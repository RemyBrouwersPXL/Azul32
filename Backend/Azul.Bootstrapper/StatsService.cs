using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azul.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Azul.Bootstrapper
{
    public class StatsService
    {
        private readonly AzulDbContext _dbContext;

        public StatsService(AzulDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task UpdateStatsAfterGameAsync(Guid userId, bool didWin, int score)
        {
            var user = await _dbContext.Users
                .Include(u => u.Stats)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || user.Stats == null)
                throw new InvalidOperationException("Gebruiker of stats niet gevonden.");

            user.Stats.TotalGamesPlayed += 1;
            user.Stats.LastPlayed = DateTime.UtcNow;

            if (didWin)
                user.Stats.Wins += 1;
            else
                user.Stats.Losses += 1;

            if (score > user.Stats.HighestScore)
                user.Stats.HighestScore = score;

            await _dbContext.SaveChangesAsync();
        }
    }
}
