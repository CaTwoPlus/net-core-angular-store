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

        public DbSet<Credentials> Credentials { get; set; }

        public DbSet<LoginHistory> LoginHistory { get; set; }

        public DbSet<RefreshToken> RefreshToken { get; set; }

        public DbSet<RevokedTokens> RevokedTokens { get; set; }
    }

}
