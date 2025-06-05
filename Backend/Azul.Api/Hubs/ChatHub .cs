using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Azul.Api.Services.Contracts;
using Azul.Api.Services;
using Azul.Core.GameAggregate.Contracts;

namespace Azul.Api.Hubs
{
    
    public class ChatHub : Hub
    {
        private readonly GeminiAiService _aiService;
        private readonly IGameService _gameService;

        public ChatHub(GeminiAiService aiService, IGameService gameService)
        {
            _aiService = aiService;
            _gameService = gameService;
        }
        public override async Task OnConnectedAsync()
        {
            var gameId = Context.GetHttpContext().Request.Query["gameId"];
            var username = Context.GetHttpContext().Request.Query["username"];

            Console.WriteLine($"✅ Verbonden gebruiker: {username}");
            Console.WriteLine($"✅ Verbonden met groep: {gameId}");

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string message)
        {
            try
            {
                var username = Context.GetHttpContext().Request.Query["username"];
                var gameId = GetGameId();

                Console.WriteLine($"📨 Bericht ontvangen van {username}: {message}");

                await Clients.Group(gameId).SendAsync("ReceiveMessage", username, message);

                // AI-reactie (optioneel, afhankelijk van jouw logica)
                if (IsComputerOpponent(GetGameId())) // of een andere controle
                {
                    var aiReply = await _aiService.GetReplyAsync(message);
                    await Clients.Group(gameId).SendAsync("ReceiveMessage", "Computer", aiReply);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fout in SendMessage: {ex.Message}");
                throw;
            }
        }

        public async Task SendEmote(string emoteKey)
        {
            var username = Context.GetHttpContext().Request.Query["username"];
            await Clients.Group(GetGameId()).SendAsync("ReceiveEmote", username, emoteKey);
        }

        private string GetGameId()
        {
            return Context.GetHttpContext().Request.Query["gameId"];
        }

        private bool IsComputerOpponent(string gameId)
        {
            if (Guid.TryParse(gameId, out var id))
            {
                return _gameService.IsVsComputer(id); // zelf implementeren
            }

            Console.WriteLine($"⚠️ Ongeldige gameId ontvangen: {gameId}");
            return false; // of eventueel true/exception gooien
        }

    }
}
