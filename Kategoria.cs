using System.ComponentModel.DataAnnotations;

namespace BontoAPI
{
    public class Kategoria
    {
        public int Id { get; set; }

        [StringLength(256)]
        public string Nev { get; set; } = string.Empty;
    }
}
