namespace Azul.Api.Models.Output
{
    public class ProfielModel
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int TotalGamesPlayed { get; set; }
        public int HighestScore { get; set; }
        public DateTime LastPlayed { get; set; }
        public string AvatarUrl { get; set; }
        public string Color { get; set; }
        public string Bio { get; set; }
    }
}
