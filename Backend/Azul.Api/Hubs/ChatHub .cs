using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Azul.Api.Services.Contracts;

namespace Azul.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        
        
        public async Task SendMessage(string message)
        {
            var user = Context.User?.Identity?.Name ?? "Anonymous";
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public override async Task OnConnectedAsync()
        {
            // Optionally, you can handle when a client connects
            await base.OnConnectedAsync();
            await Clients.All.SendAsync("UserConnected", Context.User?.Identity?.Name ?? "Anonymous");
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.All.SendAsync("UserDisconnected", Context.User?.Identity?.Name ?? "Anonymous");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
