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
                    new {
                        role = "user", // system prompt moet in de vorm van een "user" als Gemini Flash 001 geen "system" direct ondersteunt
                        parts = new[] {
                            new {
                                text = "Je bent een virtuele speler in een Azul-spel. Je heet 'Computer'. Je doet zelf beurten, kiest tegels, plaatst ze op je bord en houdt je eigen score bij. Je reageert alsof je meespeelt. Gebruik geen zinnen als 'ik ben een AI' of 'ik kan niet fysiek spelen'. Gedraag je als een echte speler."
                            }
                        }
                    },
                    new {
                        role = "user",
                        parts = new[] {
                            new {
                                text = userMessage
                            }
                        }
                    }
                }
            };


            var response = await client.PostAsync(
                $"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key={_apiKey}",
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            );

            var responseString = await response.Content.ReadAsStringAsync();

            try
            {
                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;

                if (root.TryGetProperty("candidates", out var candidates) &&
                    candidates.GetArrayLength() > 0 &&
                    candidates[0].TryGetProperty("content", out var content) &&
                    content.TryGetProperty("parts", out var parts) &&
                    parts.GetArrayLength() > 0 &&
                    parts[0].TryGetProperty("text", out var textProp))
                {
                    return textProp.GetString() ?? "🤖 Geen antwoord van Gemini.";
                }
                else
                {
                    Console.WriteLine("⚠️ Ongeldig Gemini-response:\n" + responseString);
                    return "🤖 Ongeldig antwoord van AI.";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fout bij verwerken Gemini-response: {ex.Message}\nResponse: {responseString}");
                return "🤖 AI kon niet antwoorden.";
            }
        }

    }
}