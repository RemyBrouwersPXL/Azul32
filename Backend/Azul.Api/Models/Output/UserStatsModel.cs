using AutoMapper;
using Azul.Core.UserAggregate;


namespace Azul.Api.Models.Output
{
    public class UserStatsModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int Wins { get; set; } = 0;
        public int Losses { get; set; } = 0;
        public int TotalGamesPlayed { get; set; } = 0;
        public int HighestScore { get; set; } = 0;
        public DateTime LastPlayed { get; set; } = DateTime.UtcNow;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;

        private class MappingProfile : Profile
        {
            public MappingProfile()
            {
                CreateMap<UserStats, UserStatsModel>();
            }
        }
    }

   
}
