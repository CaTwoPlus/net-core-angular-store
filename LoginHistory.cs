namespace BontoAPI
{
    public class LoginHistory
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string IPAddress { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}
