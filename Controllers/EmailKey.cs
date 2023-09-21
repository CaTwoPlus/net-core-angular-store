using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;

namespace BontoAPI.Controllers
{
    [Route("api/recaptcha")]
    [ApiController]
    public class EmailKey : ControllerBase
    {
        [HttpGet]
        public IActionResult GetValidationKey()
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
        public async Task<IActionResult> VerifyRecaptchaAsync([FromBody] CaptchaVerificationRequest request)
        {
            var secretKey = Environment.GetEnvironmentVariable("reCAPTCHA_SERVER_API_KEY");
            using (var httpClient = new HttpClient())
            {
                var content = new FormUrlEncodedContent(new[]
                {
                new KeyValuePair<string, string>("secret", secretKey),
                new KeyValuePair<string, string>("response", request.Response),
            });

                var response = await httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                var captchaResponse = JsonConvert.DeserializeObject<RecaptchaResponse>(responseContent);

                if (captchaResponse.Success)
                {
                    return Ok();
                }
                else
                {
                    // Handle reCAPTCHA validation failure
                    return BadRequest("reCAPTCHA validation failed.");
                }
            }
        }

        public class CaptchaVerificationRequest
        {
            public string Response { get; set; }
        }
        public class RecaptchaResponse
        {
            [JsonProperty("success")]
            public bool Success { get; set; }
        }

    }
}
