using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Azul.Core.UserAggregate
{
    public class UserStats
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public int Wins { get; set; } = 0;
        public int Losses { get; set; } = 0;
        public int TotalGamesPlayed { get; set; } = 0;
        public int HighestScore { get; set; } = 0;
        public DateTime LastPlayed { get; set; } = DateTime.MinValue;

        public string AvatarUrl { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;


        public virtual User User { get; set; }
    }
}
