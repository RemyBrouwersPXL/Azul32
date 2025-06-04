using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azul.Core.UserAggregate;
using Azul.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Azul.Bootstrapper
{
    public class GameStatsService
    {
        private readonly AzulDbContext _context;

        public GameStatsService(AzulDbContext context)
        {
            _context = context;
        }

        public async Task UpdateStatsAsync(Guid userId, bool won, int score)
        {
            var stats = await _context.UserStats
                .FirstOrDefaultAsync(s => s.UserId == userId) ?? new UserStats { UserId = userId };

            stats.TotalGamesPlayed++;

            if (won)
            {
                stats.Wins++;
            }
            else
            {
                stats.Losses++;
            }

            if (score > stats.HighestScore)
            {
                stats.HighestScore = score;
            }

            stats.LastPlayed = DateTime.UtcNow;

            if (stats.Id == Guid.Empty)
            {
                _context.UserStats.Add(stats);
            }
            else
            {
                _context.UserStats.Update(stats);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<UserStats> GetUserStatsAsync(Guid userId)
        {
            return await _context.UserStats
                .FirstOrDefaultAsync(s => s.UserId == userId) ?? new UserStats { UserId = userId };
        }
    }
}
