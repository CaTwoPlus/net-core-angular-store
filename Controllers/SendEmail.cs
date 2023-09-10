using Microsoft.AspNetCore.Mvc;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace BontoAPI.Controllers
{
    public class SendEmail : Controller
    {
        [Route("api/uzenet")]
        [ApiController]
        public class EmailController : ControllerBase
        {
            [HttpPost("send")]
            public async Task<IActionResult> SendEmailAsync([FromBody] EmailRequest request)
            {
                try
                {
                    var apiKey = System.Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
                    var client = new SendGridClient(apiKey);
                    var from = new EmailAddress("test@example.com", "Example User");
                    var subject = "Sending with SendGrid is Fun";
                    var to = new EmailAddress("test@example.com", "Example User");
                    var plainTextContent = "and easy to do anywhere, even with C#";
                    var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
                    var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                    var response = await client.SendEmailAsync(msg);
                    return Ok("Email sent successfully");
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
}
