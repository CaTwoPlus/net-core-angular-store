using Microsoft.AspNetCore.Mvc;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace BontoAPI.Controllers
{
    [Route("api/uzenet")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        [HttpPost("kuld")]
        public async Task<IActionResult> SendEmailAsync([FromBody] EmailRequest request)
        {
            try
            {
                var plainTextMessage = request.EmailAddress + Environment.NewLine + request.PhoneNumber + Environment.NewLine +
                    Environment.NewLine + request.Message;
                var HTMLMessage = $"<p><strong>{request.Name}</strong></p><p><strong>{request.EmailAddress}</strong></p><p><strong>{request.PhoneNumber}</strong></p><br><p>{request.Message}</p>";
                var apiKey = System.Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
                var client = new SendGridClient(apiKey);
                var from = new EmailAddress("fordfocuskombibonto17@gmail.com", request.Name);
                var subject = "Ford Bontó - Új vásárlói üzenet";
                var to = new EmailAddress("fordfocuskombibonto17@gmail.com", "Admin");
                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextMessage, HTMLMessage);
                var response = await client.SendEmailAsync(msg);
                if (response != null && response.IsSuccessStatusCode)
                {
                    return Ok(response);
                }
                return BadRequest(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class EmailRequest
    {
        public string Name { get; set; }
        public string EmailAddress { get; set; }
        public string PhoneNumber { get; set; }
        public string Message { get; set; }
    }
}
