namespace BontoAPI
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public DateTime RefreshTokenExpirationDate { get; set; }
    }
}
