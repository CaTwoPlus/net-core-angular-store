using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BontoAPI;
using System.Net.Mail;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginModel model)
    {
        string username = model.Username;
        string password = model.Password;

        bool isValidCredentials = ValidateCredentials(username, password);

        if (!isValidCredentials)
        {
            // Return unauthorized status if the credentials are invalid
            return Unauthorized();
        }

        // Validate credentials and generate JWT token

        var token = GenerateJwtToken();

        // Return the token in the response
        return Ok(new { token });
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

    private bool ValidateCredentials(string username, string password)
    {
        if (username == "admin" && password == "valid_password")
        {
            return true; // Credentials are valid
        }

        return false; // Credentials are invalid
    }

    private string GenerateJwtToken()
    {
        // Generate and return JWT token
        // You can use a library like System.IdentityModel.Tokens.Jwt

        // Example code:
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            // Set any additional claims or token properties
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
