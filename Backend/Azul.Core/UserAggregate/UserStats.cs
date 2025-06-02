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
        public User User { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int TotalGamesPlayed { get; set; }
        public int HighestScore { get; set; }
        public DateTime LastPlayed { get; set; }
    }
}
