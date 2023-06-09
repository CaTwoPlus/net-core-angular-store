﻿using System;
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
    public class AutoTipusController : ControllerBase
    {
        private readonly DataContext _context;

        public AutoTipusController(DataContext context)
        {
            _context = context;
        }

        // GET: api/AutoTipus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AutoTipus>>> GetAutoTipusok()
        {
          if (_context.AutoTipusok == null)
          {
              return NotFound();
          }
            return await _context.AutoTipusok.ToListAsync();
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
    }
}
