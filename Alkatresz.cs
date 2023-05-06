using System.ComponentModel.DataAnnotations;

namespace BontoAPI
{
    public class Alkatresz
    {
        public int Id { get; set; }
        [StringLength(256)]
        public string Nev { get; set; } = string.Empty;
        [StringLength(256)]
        public string Megjegyzes { get; set; } = string.Empty;

        //public int KategoriaId { get; set; }
        //public Kategoria? KategoriaNev { get; set; }
        //public int AutoTipusId { get; set; }
        //public AutoTipus? AutoTipusNev { get; set; }
        [StringLength(256)]
        public string Kategoriak { get; set; } = string.Empty;

        [StringLength(50)]
        public string Generacio { get; set; } = string.Empty;
        public int Ar { get; set; }

        [StringLength(1024)]
        public string Kepek { get; set; } = string.Empty;
    }
}
