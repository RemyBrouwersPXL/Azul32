using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Azul.Api.Services
{
    public class GeminiAiService
    {
        private readonly string _apiKey = "AIzaSyAKqozWR7e7wrNJqvvATexd0V46qzeOAiU"; // Vervang dit

        public async Task<string> GetReplyAsync(string userMessage)
        {
            using var client = new HttpClient();
            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = userMessage } } }
                }
            };

            var response = await client.PostAsync(
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={_apiKey}",
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            );

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);
            var reply = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return reply ?? "Geen antwoord van Gemini.";
        }
    }
}