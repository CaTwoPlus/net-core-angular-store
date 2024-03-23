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

namespace BontoAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KategoriaController : ControllerBase
    {
        private readonly DataContext _context;

        public KategoriaController(DataContext context)
        {
            _context = context;
        }

        // GET: api/Kategoria
        [HttpGet]
        [ResponseCache(Duration = 86400)]
        public async Task<ActionResult<IEnumerable<Kategoria>>> GetKategoriak()
        {
            if (_context.Kategoriak == null)
            {
                return NotFound();
            }
            var list = await _context.Kategoriak.ToListAsync();
            var eTag = GenerateUniqueETag(list);
            var requestETag = Request.Headers["If-None-Match"].FirstOrDefault();

            if (requestETag == eTag)
            {
                return StatusCode(304);
            }

            Response.Headers.Add("ETag", eTag);
            return Ok(list);
        }

        // GET: api/Kategoria/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Kategoria>> GetKategoria(int id)
        {
          if (_context.Kategoriak == null)
          {
              return NotFound();
          }
            var kategoria = await _context.Kategoriak.FindAsync(id);

            if (kategoria == null)
            {
                return NotFound();
            }

            return kategoria;
        }

        // PUT: api/Kategoria/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKategoria(int id, Kategoria kategoria)
        {
            if (id != kategoria.Id)
            {
                return BadRequest();
            }

            _context.Entry(kategoria).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KategoriaExists(id))
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

        // POST: api/Kategoria
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Kategoria>> PostKategoria(Kategoria kategoria)
        {
          if (_context.Kategoriak == null)
          {
              return Problem("Entity set 'DataContext.Kategoriak'  is null.");
          }
            _context.Kategoriak.Add(kategoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetKategoria", new { id = kategoria.Id }, kategoria);
        }

        // DELETE: api/Kategoria/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKategoria(int id)
        {
            if (_context.Kategoriak == null)
            {
                return NotFound();
            }
            var kategoria = await _context.Kategoriak.FindAsync(id);
            if (kategoria == null)
            {
                return NotFound();
            }

            _context.Kategoriak.Remove(kategoria);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool KategoriaExists(int id)
        {
            return (_context.Kategoriak?.Any(e => e.Id == id)).GetValueOrDefault();
        }

        private string GenerateUniqueETag(IEnumerable<Kategoria> data)
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
