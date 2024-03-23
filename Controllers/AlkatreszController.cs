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
    public class AlkatreszController : ControllerBase
    {
        private readonly DataContext _context;

        public AlkatreszController(DataContext context)
        {
            _context = context;
        }
         
        // GET: api/Alkatresz
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alkatresz>>> GetAlkatreszek()
        {
            if (_context.Alkatreszek == null)
            {
                return NotFound();
            }

            var alkatreszek = await _context.Alkatreszek.ToListAsync();
            var eTag = GenerateUniqueETagForItemList(alkatreszek);
            var requestETag = Request.Headers["If-None-Match"].FirstOrDefault();

            if (requestETag == eTag)
            {
                return StatusCode(304);
            }

            Response.Headers.Add("ETag", eTag);
            return Ok(alkatreszek);
        }

        // GET: api/Alkatresz/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Alkatresz>> GetAlkatresz(int id)
        {
          if (_context.Alkatreszek == null)
          {
              return NotFound();
          }
            var alkatresz = await _context.Alkatreszek.FindAsync(id);

            if (alkatresz == null)
            {
                return NotFound();
            }

            var eTag = GenerateUniqueETag(alkatresz);
            var requestETag = Request.Headers["If-None-Match"].FirstOrDefault();

            if (requestETag == eTag)
            {
                return StatusCode(304);
            }

            Response.Headers.Add("ETag", eTag);

            return alkatresz;
        }

        // PUT: api/Alkatresz/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlkatresz(int id, Alkatresz alkatresz)
        {
            if (id != alkatresz.Id)
            {
                return BadRequest();
            }

            _context.Entry(alkatresz).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlkatreszExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        // POST: api/Alkatresz
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Alkatresz>> PostAlkatresz(Alkatresz alkatresz)
        {
          if (_context.Alkatreszek == null)
          {
              return Problem("Entity set 'DataContext.Alkatreszek'  is null.");
          }
            _context.Alkatreszek.Add(alkatresz);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAlkatresz", new { id = alkatresz.Id }, alkatresz);
        }

        // DELETE: api/Alkatresz/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlkatresz(int id)
        {
            if (_context.Alkatreszek == null)
            {
                return NotFound();
            }
            var alkatresz = await _context.Alkatreszek.FindAsync(id);
            if (alkatresz == null)
            {
                return NotFound();
            }

            _context.Alkatreszek.Remove(alkatresz);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("filtered-alkatreszek")]
        [ResponseCache(Duration = 28800)]
        public ActionResult<IEnumerable<Alkatresz>> GetFilteredAlkatreszek(string searchTerm, string orderOption)
        {
            // Perform the filtering logic based on the provided search term if it is not null or empty
            var filteredAlkatreszek = string.IsNullOrEmpty(searchTerm)
                ? _context.Alkatreszek.ToList()  // Return all alkatreszek if searchTerm is null or empty
                : _context.Alkatreszek
                    .Where(alkatresz => alkatresz.Nev.ToLower().Contains(searchTerm.ToLower()))
                    .ToList();

            switch (orderOption)
            {
                case "ascPrice":
                    filteredAlkatreszek = filteredAlkatreszek.OrderBy(alkatresz => alkatresz.Ar).ToList();
                    break;
                case "descPrice":
                    filteredAlkatreszek = filteredAlkatreszek.OrderByDescending(alkatresz => alkatresz.Ar).ToList();
                    break;
                case "ascName":
                    filteredAlkatreszek = filteredAlkatreszek.OrderBy(alkatresz => alkatresz.Nev).ToList();
                    break;
                case "descName":
                    filteredAlkatreszek = filteredAlkatreszek.OrderByDescending(alkatresz => alkatresz.Nev).ToList();
                    break;
            }

            var eTag = GenerateUniqueETagForItemList(filteredAlkatreszek);
            var requestETag = Request.Headers["If-None-Match"].FirstOrDefault();
            if (requestETag == eTag)
            {
                return StatusCode(304);
            }
            Response.Headers.Add("ETag", eTag);

            return Ok(filteredAlkatreszek);
        }

        [HttpGet("categorized-alkatreszek")]
        [ResponseCache(Duration = 28800)]
        public ActionResult<IEnumerable<Alkatresz>> GetCategorizedAlkatreszek(string categoryFilter, string orderOption)
        {
            // Retrieve all alkatreszek from the database
            var alkatreszek = _context.Alkatreszek.ToList();

            // Perform the filtering logic based on the provided category filter
            var filters = categoryFilter?.ToLower().Split(';').Select(c => c.Trim()).ToList();

            var categorizedAlkatreszek = alkatreszek
                .Where(alkatresz => filters == null || filters.All(filter =>
                    alkatresz.Kategoriak?.ToLower().Split(';').Select(c => c.Trim()).Contains(filter) == true))
                .ToList();

            switch (orderOption)
            {
                case "ascPrice":
                    categorizedAlkatreszek = categorizedAlkatreszek.OrderBy(alkatresz => alkatresz.Ar).ToList();
                    break;
                case "descPrice":
                    categorizedAlkatreszek = categorizedAlkatreszek.OrderByDescending(alkatresz => alkatresz.Ar).ToList();
                    break;
                case "ascName":
                    categorizedAlkatreszek = categorizedAlkatreszek.OrderBy(alkatresz => alkatresz.Nev).ToList();
                    break;
                case "descName":
                    categorizedAlkatreszek = categorizedAlkatreszek.OrderByDescending(alkatresz => alkatresz.Nev).ToList();
                    break;
            }

            var eTag = GenerateUniqueETagForItemList(categorizedAlkatreszek);
            var requestETag = Request.Headers["If-None-Match"].FirstOrDefault();
            if (requestETag == eTag)
            {
                return StatusCode((int)HttpStatusCode.NotModified);
            }
            Response.Headers.Add("ETag", eTag);

            return Ok(categorizedAlkatreszek);
        }

        private string GenerateUniqueETag(Alkatresz alkatresz)
        {
            using (MD5 md5 = MD5.Create())
            {
                StringBuilder sb = new StringBuilder();

                // Include relevant properties of the Alkatresz object to generate the hash
                sb.Append(alkatresz.Id);
                sb.Append(alkatresz.Nev);
                sb.Append(alkatresz.Megjegyzes);
                sb.Append(alkatresz.Kategoriak);
                sb.Append(alkatresz.Generacio);
                sb.Append(alkatresz.Ar);
                sb.Append(alkatresz.Kepek);
                sb.Append(';');

                byte[] hashBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(sb.ToString()));
                string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                return hash;
            }
        }

        private string GenerateUniqueETagForItemList(IEnumerable<Alkatresz> data)
        {
            using (MD5 md5 = MD5.Create())
            {
                StringBuilder sb = new StringBuilder();

                foreach (var alkatresz in data)
                {
                    // Include relevant properties of the Alkatresz object to generate the hash
                    sb.Append(alkatresz.Id);
                    sb.Append(alkatresz.Nev);
                    sb.Append(alkatresz.Megjegyzes);
                    sb.Append(alkatresz.Kategoriak);
                    sb.Append(alkatresz.Generacio);
                    sb.Append(alkatresz.Ar);
                    sb.Append(alkatresz.Kepek);
                    sb.Append(';');
                }

                byte[] hashBytes = md5.ComputeHash(Encoding.UTF8.GetBytes(sb.ToString()));
                string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

                return hash;
            }
        }

        private bool AlkatreszExists(int id)
        {
            return (_context.Alkatreszek?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
