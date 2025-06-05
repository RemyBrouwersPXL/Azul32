using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Azul.Api.Services.Contracts;

namespace Azul.Api.Hubs
{
    [Authorize]
    [AllowAnonymous]
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var gameId = Context.GetHttpContext().Request.Query["gameId"];
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

            Console.WriteLine($"✅ Verbonden met groep: {gameId}");
            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string message)
        {
            var user = Context.User?.Identity?.Name ?? "Anonymous";
            await Clients.Group(GetGameId()).SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendEmote(string emoteKey)
        {
            var user = Context.User?.Identity?.Name ?? "Anonymous";
            await Clients.Group(GetGameId()).SendAsync("ReceiveEmote", user, emoteKey);
        }

        private string GetGameId()
        {
            return Context.GetHttpContext().Request.Query["gameId"];
        }
    }
}
