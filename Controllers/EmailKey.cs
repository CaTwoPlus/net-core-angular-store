using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace BontoAPI.Controllers
{
    [Route("api/recaptcha")]
    [ApiController]
    public class EmailKey : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetValidationKey()
        {
            var apiKey = System.Environment.GetEnvironmentVariable("reCAPTCHA_CLIENT_API_KEY");
            if (apiKey == null)
            {
                return BadRequest("Could not retrieve reCAPTCHA API key!");
            }
            var apiKeyObject = new { ApiKey = apiKey };

            return Ok(apiKeyObject);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyRecaptchaAsync([FromBody] string recaptchaResponse)
        {
            var secretKey = Environment.GetEnvironmentVariable("reCAPTCHA_SERVER_API_KEY");
            using (var httpClient = new HttpClient())
            {
                var content = new FormUrlEncodedContent(new[]
                {
                new KeyValuePair<string, string>("secret", secretKey),
                new KeyValuePair<string, string>("response", recaptchaResponse),
            });

            var response = await httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (responseContent == "success")
            {
                return Ok();
            }
            else
            {
                return BadRequest("Error during reCAPTCHA server key validation!");
            }

            }
        }
    }
}
