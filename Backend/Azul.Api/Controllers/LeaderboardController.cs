using Azul.Api.Models.Output;
using Azul.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Azul.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaderboardController : ControllerBase
    {
        private readonly AzulDbContext _dbContext;

        public LeaderboardController(AzulDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboard()
        {
            var leaderboard = await _dbContext.Users
                .Include(u => u.Stats)
                .Where(u => u.Stats != null)
                .Select(u => new LeaderboardEntryDto
                {
                    UserName = u.UserName,
                    Wins = u.Stats.Wins,
                    Losses = u.Stats.Losses,
                    HighestScore = u.Stats.HighestScore
                })
                .OrderByDescending(u => u.Wins) // Of sorteren op HighestScore?
                .ToListAsync();

            return Ok(leaderboard);
        }
    }
}
