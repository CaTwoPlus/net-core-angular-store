using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace BontoAPI.Controllers
{
    [Route("api/validate")]
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
            return Ok(apiKey);
        }
    }
}
