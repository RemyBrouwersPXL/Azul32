using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Azul.Api.Services.Contracts;

namespace Azul.Api.Hubs
{
    
    public class ChatHub : Hub
    {
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
    }
}
