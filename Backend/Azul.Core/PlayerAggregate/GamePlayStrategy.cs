using Azul.Core.GameAggregate;
using System;
using System.Collections.Generic;
using System.Linq;
using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;
using Azul.Core.BoardAggregate.Contracts;

namespace Azul.Core.PlayerAggregate;
public enum AIDifficulty { Easy, Medium, Hard, Expert }
public enum AIPlayStyle { Offensive, Defensive, Chaotic }
public class GamePlayStrategy : IGamePlayStrategy
{
    private readonly AIDifficulty _difficulty;
    private readonly AIPlayStyle _playStyle;
    private readonly Random _random = new Random();

    public GamePlayStrategy(AIDifficulty difficulty, AIPlayStyle playStyle)
    {
        _difficulty = difficulty;
        _playStyle = playStyle;
    }

    // ====== HOOFDMETHODES ======
    public ITakeTilesMove GetBestTakeTilesMove(Guid playerId, IGame game)
    {
        var player = game.Players.First(p => p.Id == playerId);
        var allSources = game.TileFactory.Displays.Cast<IFactoryDisplay>()
                               .Concat(new[] { game.TileFactory.TableCenter });

        var possibleMoves = allSources
            .Where(source => source.Tiles.Any())
            .SelectMany(source => source.Tiles
                .Where(t => t != TileType.StartingTile)
                .GroupBy(t => t)
                .Select(group => new TakeOption
                {
                    Source = source,
                    Color = group.Key,
                    Count = group.Count(),
                    ContainsFirstPlayer = source.Tiles.Contains(TileType.StartingTile)
                }))
            .ToList();

        // Voeg wat willekeur toe voor lagere moeilijkheidsgraden
        if (_difficulty == AIDifficulty.Easy && possibleMoves.Count > 1 && _random.Next(100) < 30)
        {
            return possibleMoves.OrderBy(x => _random.Next()).First().ToMove();
        }

        // Pas speelstijl toe
        foreach (var move in possibleMoves)
        {
            move.Score = EvaluateTakeOption(move, player, game);

            // Pas speelstijl aan
            switch (_playStyle)
            {
                case AIPlayStyle.Offensive:
                    if (WillCompleteLine(move.Color, player.Board))
                        move.Score *= 1.5f;
                    break;
                case AIPlayStyle.Defensive:
                    int space = 0;
                    for (int i = 0; i < player.Board.FloorLine.Length; i++)
                    {
                        if (!player.Board.FloorLine[i].HasTile)
                        {
                            space++;
                        }
                    }
                    if (move.Count > space)
                        move.Score *= 0.6f; // Vermijd tegels verliezen
                    break;
                case AIPlayStyle.Chaotic:
                    move.Score *= (float)(0.8 + _random.NextDouble() * 0.4); // Willekeurige factor
                    break;
            }
        }

        return possibleMoves.OrderByDescending(m => m.Score).First().ToMove();
    }

    public IPlaceTilesMove GetBestPlaceTilesMove(Guid playerId, IGame game)
    {
        var player = game.Players.First(p => p.Id == playerId);
        var color = player.TilesToPlace.FirstOrDefault();
        var count = player.TilesToPlace.Count;

        var options = new List<PlaceOption>();

        // Optie 1: Bestaande lijn aanvullen
        for (int row = 0; row < 5; row++)
        {
            var line = player.Board.PatternLines[row];
            if (line.NumberOfTiles > 0 && line.TileType == color && !line.IsComplete)
            {
                int needed = (row + 1) - line.NumberOfTiles;
                if (count >= needed || _difficulty >= AIDifficulty.Medium) // Hard AI plaatst zelfs als niet compleet
                {
                    options.Add(new PlaceOption
                    {
                        Row = row,
                        Score = CalculatePlacementScore(row, color, player.Board, isNewLine: false)
                    });
                }
            }
        }

        // Optie 2: Nieuwe lijn starten (alleen als geen bestaande opties)
        if (!options.Any() || _difficulty >= AIDifficulty.Hard)
        {
            for (int row = 0; row < 5; row++)
            {
                var line = player.Board.PatternLines[row];
                if (line.NumberOfTiles == 0 && !player.Board.IsColorInWallRow(row, color))
                {
                    options.Add(new PlaceOption
                    {
                        Row = row,
                        Score = CalculatePlacementScore(row, color, player.Board, isNewLine: true)
                    });
                }
            }
        }

        // Floorline als laatste optie
        options.Add(new PlaceOption { Row = -1, Score = -50 });

        // Kies beste optie op basis van moeilijkheid
        PlaceOption bestOption;
        if (_difficulty == AIDifficulty.Easy && options.Count > 1)
        {
            bestOption = options.OrderByDescending(o => o.Score).Take(3).OrderBy(x => _random.Next()).First();
        }
        else
        {
            bestOption = options.OrderByDescending(o => o.Score).First();
        }

        return bestOption.Row >= 0
            ? PlaceTilesMove.CreateMoveOnPatternLine(bestOption.Row)
            : PlaceTilesMove.CreateMoveOnFloorLine();
    }

    // ====== SCORE BEREKENINGEN ======
    private float EvaluateTakeOption(TakeOption option, IPlayer player, IGame game)
    {
        float score = 0;

        // 1. Directe lijncompletering (hoogste prioriteit)
        if (WillCompleteLine(option.Color, player.Board))
            score += 200;

        // 2. Toekomstige muurplaatsing
        score += CalculateFutureWallScore(option.Color, player.Board) * (_difficulty == AIDifficulty.Hard ? 1.5f : 1f);

        int space = 0;
        for (int i = 0; i < player.Board.FloorLine.Length; i++)
        {
            if (!player.Board.FloorLine[i].HasTile)
            {
                space++;
            }
        }

        // 3. Floorline management
        if (option.Count > space)
            score -= (option.Count - space) * 30;

        // 4. First player token
        if (option.ContainsFirstPlayer)
            score += player.Board.FloorLine.Length <= 2 ? 40 : -80;

        // 5. Tegel efficiëntie (voor Hard+ AI)
        if (_difficulty >= AIDifficulty.Hard)
        {
            int usableTiles = Math.Min(option.Count, 5); // Max aantal nodig voor een lijn
            score += usableTiles * 5;
        }

        return score;
    }

    private int CalculatePlacementScore(int row, TileType color, IBoard board, bool isNewLine)
    {
        int score = 0;
        int col = GetWallColumnForColor(row, color);

        // Directe score voor muurplaatsing
        if (!board.IsColorInWallRow(row, color))
        {
            score += CalculateWallScore(row, col, board);
        }

        // Bonus voor het starten van een strategische lijn
        if (isNewLine && row == 4) score += 30; // Lange lijn bonus
        if (isNewLine && _difficulty >= AIDifficulty.Hard) score += 15;

        // Malus voor onvolledige lijnen (voor Hard AI)
        if (!isNewLine && _difficulty >= AIDifficulty.Hard)
        {
            var line = board.PatternLines[row];
            if (!line.IsComplete) score -= 10;
        }

        return score;
    }

    private int CalculateWallScore(int row, int col, IBoard board)
    {
        int score = 1; // Basispunt

        // Horizontale aansluitingen
        int left = col - 1;
        while (left >= 0 && board.Wall[row, left].HasTile) { score++; left--; }

        int right = col + 1;
        while (right < 5 && board.Wall[row, right].HasTile) { score++; right++; }

        // Verticale aansluitingen
        int up = row - 1;
        while (up >= 0 && board.Wall[up, col].HasTile) { score++; up--; }

        int down = row + 1;
        while (down < 5 && board.Wall[down, col].HasTile) { score++; down++; }

        return score;
    }

    private int CalculateFutureWallScore(TileType color, IBoard board)
    {
        int total = 0;
        for (int row = 0; row < 5; row++)
        {
            if (!board.IsColorInWallRow(row, color))
            {
                int col = GetWallColumnForColor(row, color);
                total += CalculateWallScore(row, col, board);
            }
        }
        return total;
    }

    private bool WillCompleteLine(TileType color, IBoard board)
    {
        for (int row = 0; row < 5; row++)
        {
            var line = board.PatternLines[row];
            if (line.TileType == color && !line.IsComplete)
            {
                int needed = (row + 1) - line.NumberOfTiles;
                if (needed <= line.Length) return true;
            }
        }
        return false;
    }

    private int GetWallColumnForColor(int row, TileType color)
    {
        return color switch
        {
            TileType.PlainBlue => (0 + row) % 5,
            TileType.YellowRed => (1 + row) % 5,
            TileType.PlainRed => (2 + row) % 5,
            TileType.BlackBlue => (3 + row) % 5,
            TileType.WhiteTurquoise => (4 + row) % 5,
            _ => throw new ArgumentOutOfRangeException(nameof(color), "Invalid tile color")
        };
    }
    private class TakeOption
    {
        public IFactoryDisplay Source { get; set; }
        public TileType Color { get; set; }
        public int Count { get; set; }
        public bool ContainsFirstPlayer { get; set; }
        public float Score { get; set; }

        public ITakeTilesMove ToMove() => new TakeTilesMove(Source, Color);
    }

    private class PlaceOption
    {
        public int Row { get; set; }
        public int Score { get; set; }
    }
}