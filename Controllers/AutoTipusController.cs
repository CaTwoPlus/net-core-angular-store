using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BontoAPI;
using BontoAPI.Data;
using System.Security.Cryptography;
using System.Text;
using System.Net;

namespace BontoAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutoTipusController : ControllerBase
    {
        private readonly DataContext _context;

        public AutoTipusController(DataContext context)
        {
            _context = context;
        }

        // GET: api/AutoTipus
        [HttpGet]
        [ResponseCache(Duration = 86400)]
        public async Task<ActionResult<IEnumerable<AutoTipus>>> GetAutoTipusok()
        {
            if (_context.AutoTipusok == null)
            {
                return NotFound();
            }

            var list = await _context.AutoTipusok.ToListAsync();
            var eTag = GenerateUniqueETag(list);
            var requestETag = Request.Headers["If-None-Match"].FirstOrDefault();
            if (requestETag == eTag)
            {
                return StatusCode((int)HttpStatusCode.NotModified);
            }
            Response.Headers.Add("ETag", eTag);

            return Ok(list);
        }

        // GET: api/AutoTipus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AutoTipus>> GetAutoTipus(int id)
        {
          if (_context.AutoTipusok == null)
          {
              return NotFound();
          }
            var autoTipus = await _context.AutoTipusok.FindAsync(id);

            if (autoTipus == null)
            {
                return NotFound();
            }

            return autoTipus;
        }

        // PUT: api/AutoTipus/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAutoTipus(int id, AutoTipus autoTipus)
        {
            if (id != autoTipus.Id)
            {
                return BadRequest();
            }

            _context.Entry(autoTipus).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AutoTipusExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/AutoTipus
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AutoTipus>> PostAutoTipus(AutoTipus autoTipus)
        {
          if (_context.AutoTipusok == null)
          {
              return Problem("Entity set 'DataContext.AutoTipusok'  is null.");
          }
            _context.AutoTipusok.Add(autoTipus);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAutoTipus", new { id = autoTipus.Id }, autoTipus);
        }

        // DELETE: api/AutoTipus/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAutoTipus(int id)
        {
            if (_context.AutoTipusok == null)
            {
                return NotFound();
            }
            var autoTipus = await _context.AutoTipusok.FindAsync(id);
            if (autoTipus == null)
            {
                return NotFound();
            }

            _context.AutoTipusok.Remove(autoTipus);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AutoTipusExists(int id)
        {
            return (_context.AutoTipusok?.Any(e => e.Id == id)).GetValueOrDefault();
        }

        private string GenerateUniqueETag(IEnumerable<AutoTipus> data)
        {
            using (MD5 md5 = MD5.Create())
            {
                StringBuilder sb = new StringBuilder();

                foreach (var alkatresz in data)
                {
                    // Include relevant properties of the Alkatresz object to generate the hash
                    sb.Append(alkatresz.Id);
                    sb.Append(alkatresz.Nev);
                    sb.Append(';');
                }

                byte[] hashBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(sb.ToString()));
                string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                return hash;
            }
        }
    }
}
