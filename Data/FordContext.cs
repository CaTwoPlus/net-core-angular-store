using Microsoft.EntityFrameworkCore;
using BontoAPI;

namespace BontoAPI.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) {}

        public DbSet<Alkatresz> Alkatreszek { get; set; }

        public DbSet<Kategoria> Kategoriak { get; set; }

        public DbSet<AutoTipus> AutoTipusok { get; set; }

        public DbSet<BontoAPI.Media> Media { get; set; }
    }

}
