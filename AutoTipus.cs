using System.ComponentModel.DataAnnotations;

namespace BontoAPI
{
    public class AutoTipus
    {
        public int Id { get; set; }

        [StringLength(256)]
        public string Nev { get; set; } = string.Empty;
    }
}
