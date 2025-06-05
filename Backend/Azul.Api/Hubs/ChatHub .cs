using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Azul.Api.Services.Contracts;

namespace Azul.Api.Hubs
{
    public class ChatHub : Hub
    {
        // Chatberichten versturen
        public async Task SendMessage(string message)
        {
            var user = Context.User?.Identity?.Name ?? "Anonymous";
            await Clients.Group(GetGameId()).SendAsync("ReceiveMessage", user, message);
        }

        // Emotes versturen
        public async Task SendEmote(string emoteKey)
        {
            var user = Context.User?.Identity?.Name ?? "Anonymous";
            await Clients.Group(GetGameId()).SendAsync("ReceiveEmote", user, emoteKey);
        }

        private string GetGameId()
        {
            // Haal game ID op uit de context (bijv. via query string)
            return Context.GetHttpContext().Request.Query["gameId"];
        }
    }
