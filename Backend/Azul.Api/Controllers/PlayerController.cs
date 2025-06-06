using AutoMapper;
using Azul.Api.Models.Input;
using Azul.Api.Models.Output;
using Azul.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Azul.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayerController : ApiControllerBase
    {
        private readonly AzulDbContext _context;
        public PlayerController(AzulDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Gets a player by their ID.
        /// </summary>
        /// <param name="id">The ID of the player.</param>
        /// <returns>A PlayerModel containing player information.</returns>

        [HttpGet("{id}")]

        public async Task<ActionResult<ProfielModel>> GetPlayer(Guid id)
        {
            var player = await _context.Users
                .Include(p => p.Stats)
                .Where(u => u.Id == id && u.Stats != null)
                .Select(u => new ProfielModel
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Wins = u.Stats.Wins,
                    Losses = u.Stats.Losses,
                    TotalGamesPlayed = u.Stats.TotalGamesPlayed,
                    HighestScore = u.Stats.HighestScore,
                    LastPlayed = u.Stats.LastPlayed,
                    AvatarUrl = u.Stats.AvatarUrl,
                    Bio = u.Stats.Bio,
                    Color = u.Stats.Color,
                    
                })
                .FirstOrDefaultAsync();
                

            if (player == null) return NotFound();

            

            return Ok(player);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchPlayer(Guid id, [FromBody] ProfielUpdateModel update)
        {
            var user = await _context.Users
                .Include(u => u.Stats)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null || user.Stats == null)
                return NotFound();

            // Pas enkel de velden aan die niet null zijn
            if (update.UserName != null)
                user.UserName = update.UserName;

            if (update.AvatarUrl != null)
                user.Stats.AvatarUrl = update.AvatarUrl;

            if (update.Bio != null)
                user.Stats.Bio = update.Bio;

            if (update.Color != null)
                user.Stats.Color = update.Color;

            await _context.SaveChangesAsync();
            return NoContent(); // Of Ok(user) als je de aangepaste user wil teruggeven
        }
    }
}
