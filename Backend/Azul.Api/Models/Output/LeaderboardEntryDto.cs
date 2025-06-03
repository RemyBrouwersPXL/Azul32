namespace Azul.Api.Models.Output
{
    public class LeaderboardEntryDto
    {
        public string UserName { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int HighestScore { get; set; }
    }
}
