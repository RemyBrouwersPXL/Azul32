using AutoMapper;
using Azul.Core.UserAggregate;


namespace Azul.Api.Models.Output
{
    public class UserStatsModel
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int Wins { get; set; } = 0;
        public int Losses { get; set; } = 0;
        public int TotalGamesPlayed { get; set; } = 0;
        public int HighestScore { get; set; } = 0;
        public DateTime LastPlayed { get; set; } = DateTime.UtcNow;

        
    }

   
}
