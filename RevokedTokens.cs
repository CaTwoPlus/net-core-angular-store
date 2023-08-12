namespace BontoAPI
{
    public class RevokedTokens
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public DateTime RefreshTokenExpirationDate { get; set; }
    }
}
