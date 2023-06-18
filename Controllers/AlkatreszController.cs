using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BontoAPI;
using BontoAPI.Data;

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
            return await _context.Alkatreszek.ToListAsync();
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

            return NoContent();
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

            return NoContent();
        }

        [HttpGet("filtered-alkatreszek")]
        public ActionResult<IEnumerable<Alkatresz>> GetFilteredAlkatreszek(string searchTerm)
        {
            // Perform the filtering logic based on the provided search term if it is not null or empty
            var filteredAlkatreszek = string.IsNullOrEmpty(searchTerm)
                ? _context.Alkatreszek.ToList()  // Return all alkatreszek if searchTerm is null or empty
                : _context.Alkatreszek
                    .Where(alkatresz => alkatresz.Nev.ToLower().Contains(searchTerm.ToLower()))
                    .ToList();

            return Ok(filteredAlkatreszek);
        }

        [HttpGet("categorized-alkatreszek")]
        public ActionResult<IEnumerable<Alkatresz>> GetCategorizedAlkatreszek(string categoryFilter)
        {
            // Retrieve all alkatreszek from the database
            var alkatreszek = _context.Alkatreszek.ToList();

            // Perform the filtering logic based on the provided category filter
            var filters = categoryFilter?.ToLower().Split(';').Select(c => c.Trim()).ToList();

            var categorizedAlkatreszek = alkatreszek
                .Where(alkatresz => filters == null || filters.All(filter =>
                    alkatresz.Kategoriak?.ToLower().Split(';').Select(c => c.Trim()).Contains(filter) == true))
                .ToList();

            return Ok(categorizedAlkatreszek);
        }

        private bool AlkatreszExists(int id)
        {
            return (_context.Alkatreszek?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
