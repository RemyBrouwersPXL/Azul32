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
            var username = Context.GetHttpContext().Request.Query["username"];
            await Clients.Group(GetGameId()).SendAsync("ReceiveMessage", username, message);

            if (IsComputerOpponent(GetGameId()))
            {
                var aiReply = await _aiService.GetReplyAsync(message);
                await Clients.Group(GetGameId()).SendAsync("ReceiveMessage", "Computer", aiReply);
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
            // Hier kun je checken of het spel tegen AI is — bijvoorbeeld:

            Guid id = Guid.Parse(gameId);

            return _gameService.IsVsComputer(id); // zelf implementeren
        }
    }
}
