using System.ComponentModel.DataAnnotations;

namespace BontoAPI
{
    public class Media
    {
        public int Id { get; set; }
        public string Image { get; set; } = string.Empty;

        public string Folder { get; set; } = string.Empty;

    }
}
