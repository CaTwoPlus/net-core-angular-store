using System;
using System.IO;
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
    public class MediaController : ControllerBase
    {
        private readonly DataContext _context;

        public MediaController(DataContext context)
        {
            _context = context;
        }

        // GET: api/Media
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetMedia(string kategoria, string autoTipus, string fájlNév)
        {
            string rootFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            if ((string.IsNullOrEmpty(kategoria) && string.IsNullOrEmpty(autoTipus)) || string.IsNullOrEmpty(fájlNév))
            {
                return BadRequest("A kategória vagy az autóTípus mezőt és a fájlNév mezőt kötelező megadni!.");
            }

            string kategoriaFolder = string.IsNullOrEmpty(kategoria) ? rootFolder : Path.Combine(rootFolder, kategoria);
            string autoTipusFolder = string.IsNullOrEmpty(autoTipus) ? rootFolder : Path.Combine(rootFolder, autoTipus);

            string fileExtension = Path.GetExtension(fájlNév);
            if (string.IsNullOrEmpty(fileExtension))
            {
                string[] extensions = { ".jpg", ".png", ".gif" };
                foreach (string extension in extensions)
                {
                    string filePath = Path.Combine(kategoriaFolder, fájlNév + extension);
                    if (System.IO.File.Exists(filePath))
                    {
                        return Ok(Path.Combine(kategoria, fájlNév + extension));
                    }

                    filePath = Path.Combine(autoTipusFolder, fájlNév + extension);
                    if (System.IO.File.Exists(filePath))
                    {
                        return Ok(Path.Combine(autoTipus, fájlNév + extension));
                    }
                }

                return NotFound();
            }

            string fileName = "";
            if (!string.IsNullOrEmpty(kategoriaFolder))
            {
                fileName = Path.Combine(kategoriaFolder, fájlNév);
            }
            else if (!string.IsNullOrEmpty(autoTipusFolder))
            {
                fileName = Path.Combine(autoTipusFolder, fájlNév);
            }

            if (string.IsNullOrEmpty(fileName) || !System.IO.File.Exists(fileName))
            {
                return NotFound();
            }

            if (!Directory.Exists(kategoriaFolder) || !Directory.Exists(autoTipusFolder))
            {
                return NotFound();
            }

            var kategoriaFiles = Directory.GetFiles(kategoriaFolder);
            var autoTipusFiles = Directory.GetFiles(autoTipusFolder);
            var images = kategoriaFiles.Select(f => Path.Combine(kategoria, Path.GetFileName(f)))
                                        .Union(autoTipusFiles.Select(f => Path.Combine(autoTipus, Path.GetFileName(f))));

            return Ok(images);
        }


        // GET: api/Media/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Media>> GetMedia(int id)
        {
            var media = await _context.Media.FindAsync(id);

            if (media == null)
            {
                return NotFound();
            }

            return media;
        }

        // PUT: api/Media/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMedia(int id, Media media)
        {
            if (id != media.Id)
            {
                return BadRequest();
            }

            _context.Entry(media).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MediaExists(id))
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

        // POST: api/Media
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Media>> PostMedia(Media media)
        {
            _context.Media.Add(media);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMedia", new { id = media.Id }, media);
        }

        // DELETE: api/Media/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedia(int id)
        {
            var media = await _context.Media.FindAsync(id);
            if (media == null)
            {
                return NotFound();
            }

            _context.Media.Remove(media);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MediaExists(int id)
        {
            return _context.Media.Any(e => e.Id == id);
        }
    }
}
