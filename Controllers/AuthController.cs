using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BontoAPI;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using BontoAPI.Data;
using SQLitePCL;
using System.Security.Claims;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using NuGet.Protocol;
using Azure.Identity;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;

    public AuthController(IConfiguration configuration, DataContext context)
    {
        _configuration = configuration;
        _context = context;
    }
    public class CustomResponse
    {
        public int Status { get; set; }
        public string Message { get; set; }
        public DataResponse Data { get; set; }
    }

    public class DataResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }

    private CustomResponse CreateCustomResponse(int status, string message, string accessToken = null, string refreshToken = null)
    {
        return new CustomResponse
        {
            Status = status,
            Message = message,
            Data = new DataResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            }
        };
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginInputModel model)
    {
        string username = model.Username;
        string password = model.Password;
        string refreshToken = model.RefreshToken;

        var response = await AuthenticateAndGenerateTokenAsync(username, password, refreshToken);

        await SaveLoginHistoryAsync(username, HttpContext.Connection.RemoteIpAddress.ToString(), DateTime.UtcNow, response.Message);

        return StatusCode(response.Status, response);
    }

    [HttpPost("logout")]
    public async Task<CustomResponse> Logout([FromBody] LoginInputModel model)
    {
        string username = model.Username;
        string refreshToken = model.RefreshToken;

        var refreshTokenMatch = RetrieveRefreshTokenFromDatabase(refreshToken);
        var revokedTokenMatch = RetrieveRevokedTokenFromDatabase(refreshToken);

        if (refreshTokenMatch != null && revokedTokenMatch == null)
        {
            await RevokeTokenAndSaveToDatabaseAsync(refreshToken, refreshTokenMatch.RefreshTokenExpirationDate);
            await SaveLoginHistoryAsync(username, HttpContext.Connection.RemoteIpAddress.ToString(), DateTime.UtcNow, "Logout successful!");
            return CreateCustomResponse(200, "Logout successful!");
        }

        if (refreshTokenMatch != null && revokedTokenMatch != null)
        {
            // The provided refresh token is already revoked, no further action needed
            await SaveLoginHistoryAsync(username, HttpContext.Connection.RemoteIpAddress.ToString(), DateTime.UtcNow, "Logout successful!");
            return CreateCustomResponse(200, "Logout successful!");
        }

        if (refreshTokenMatch == null)
        {
            // Invalid refresh token provided
            await SaveLoginHistoryAsync(username, HttpContext.Connection.RemoteIpAddress.ToString(), DateTime.UtcNow, "Invalid refresh token");
            return CreateCustomResponse(400, "Invalid refresh token");
        }

        return CreateCustomResponse(400, "Something went wrong with the logout process...");
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(string refreshToken)
    {
        var response = await RefreshTokenAsync(refreshToken);

        return StatusCode(response.Status, response);
    }

    private async Task<CustomResponse> RefreshTokenAsync(string refreshToken)
    {
        var refreshTokenDB = RetrieveRefreshTokenFromDatabase(refreshToken);
        var isRefreshTokenRevoked = RetrieveRevokedTokenFromDatabase(refreshToken);
        var accessToken = GenerateJwtToken();

        if (refreshTokenDB == null || IsRefreshTokenExpired(refreshTokenDB.RefreshTokenExpirationDate) || refreshToken != refreshTokenDB.Token)
        {
            var newRefreshToken = GenerateJwtToken();

            // Save the new refresh token and its expiration date to the database
            await SaveRefreshTokenToDatabaseAsync(newRefreshToken, CalculateNewRefreshTokenExpirationDate());

            return CreateCustomResponse(400, "refresh_token_expired or NULL", newRefreshToken, accessToken);
        }

        if (isRefreshTokenRevoked != null)
        {
            return CreateCustomResponse(400, "refresh_token_revoked", null, accessToken);
        }

        return CreateCustomResponse(200, "Access token refreshed successfully", null, accessToken);
    }

    private async Task<CustomResponse> AuthenticateAndGenerateTokenAsync(string username, string password, string refreshToken)
    {
        bool isValidCredentials = await ValidateCredentialsAsync(username, password);

        if (!isValidCredentials)
        {
            return CreateCustomResponse(400, "Invalid credentials");
        }

        var response = await RefreshTokenAsync(refreshToken);

        if (response.Status == 200) // Only return "200 OK" with access token if the refresh token was valid
        {
            var accessToken = GenerateJwtToken();
            return CreateCustomResponse(200, "Login successful", accessToken, response.Data.RefreshToken);
        }
        else
        {
            return response;
        }
    }

    private async Task SaveLoginHistoryAsync(string username, string ipAddress, DateTime date, string status)
    {
        var loginHistory = new LoginHistory
        {
            Username = username,
            IPAddress = ipAddress,
            Date = date,
            Status = status.ToString(),
        };

        _context.LoginHistory.Add(loginHistory);
        await _context.SaveChangesAsync();
    }

    private async Task SaveRefreshTokenToDatabaseAsync(string refreshToken, DateTime refreshTokenExpirationDate)
    {
        var token = new RefreshToken
        {
            Token = refreshToken,
            RefreshTokenExpirationDate = refreshTokenExpirationDate
        };

        _context.RefreshToken.Attach(token);
        _context.Entry(token).Property(x => x.RefreshTokenExpirationDate).IsModified = true;

        await _context.SaveChangesAsync();
    }

    private async Task RevokeTokenAndSaveToDatabaseAsync(string refreshToken, DateTime refreshTokenExpirationDate)
    {
        var token = new RevokedTokens
        {
            Token = refreshToken,
            RefreshTokenExpirationDate = refreshTokenExpirationDate
        };

        _context.RevokedTokens.Attach(token);
        _context.Entry(token).Property(x => x.RefreshTokenExpirationDate).IsModified = true;

        await _context.SaveChangesAsync();
    }

    private async Task<bool> ValidateCredentialsAsync(string username, string password)
    {
        var user = await _context.Credentials.FirstOrDefaultAsync(lm => lm.Username == username && lm.Password == password);

        return user != null;
    }

    private string GenerateJwtToken(bool isRefreshToken = false)
    {
        string jwtSecretKey = _configuration["JwtSettings:SecretKey"];
        string jwtIssuer = _configuration["JwtSettings:Issuer"];
        string jwtAudience = _configuration["JwtSettings:Audience"];

        if (string.IsNullOrEmpty(jwtSecretKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
        {
            throw new ApplicationException("JWT settings are not properly configured");
        }

        var expiration = isRefreshToken ? (DateTime?) CalculateNewRefreshTokenExpirationDate()
                                        : DateTime.UtcNow.AddMinutes(Convert.ToInt32(_configuration["JwtSettings:AccessTokenExpirationMinutes"]));

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            jwtIssuer,
            jwtAudience,
            claims: new List<Claim>(),
            expires: expiration,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private DateTime CalculateNewRefreshTokenExpirationDate()
    {
        var date = Convert.ToDouble(_configuration["JwtSettings:RefreshTokenExpirationDays"]);
        return DateTime.UtcNow.AddDays(date);
    }

    private bool IsRefreshTokenExpired(DateTime refreshTokenExpirationDate)
    {
        return refreshTokenExpirationDate <= DateTime.UtcNow;
    }

    private RefreshToken RetrieveRefreshTokenFromDatabase(string refreshToken)
    {
        return _context.RefreshToken.FirstOrDefault(lm => lm.Token == refreshToken);
    }

    private RevokedTokens RetrieveRevokedTokenFromDatabase(string refreshToken)
    {
        return _context.RevokedTokens.FirstOrDefault(lm => lm.Token == refreshToken);
    }

    /*[HttpPost("password-reset")]
    public IActionResult PasswordResetRequest([FromBody] PasswordResetRequestModel model)
    {
        // Handle the password reset request
        // Generate a unique password reset token
        string passwordResetToken = Guid.NewGuid().ToString();

        // Send an email to the user with the password reset link
        // Example using SendGrid
        var emailService = new SendGridEmailService();
        string resetLink = $"https://example.com/reset-password?token={passwordResetToken}";
        emailService.SendEmail(userEmail, "Password Reset Request", $"Click the following link to reset your password: {resetLink}");

        // Store the password reset token in the database

        // Return a response indicating success or failure
    }*/

    /*public void PasswordResetRequest(string email)
    {
        string resetLink = $"https://example.com/reset-password?token={passwordResetToken}";
        string emailBody = $"Click the following link to reset your password: {resetLink}";

        using (var smtpClient = new SmtpClient("bonto-smtp"))
        {
            // Set SMTP server credentials if required
            smtpClient.Credentials = new System.Net.NetworkCredential("username", "password");
            // Set SSL/TLS configuration if required
            smtpClient.EnableSsl = true;

            MailMessage mailMessage = new MailMessage
            {
                From = new MailAddress("sender@example.com"),
                Subject = "Password Reset Request",
                Body = emailBody
            };
            mailMessage.To.Add(userEmail);

            smtpClient.Send(mailMessage);
        }
    }*/

}
