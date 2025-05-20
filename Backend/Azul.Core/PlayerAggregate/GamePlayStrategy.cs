using Azul.Core.GameAggregate;
using System;
using System.Collections.Generic;
using System.Linq;
using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;
using Azul.Core.BoardAggregate.Contracts;

namespace Azul.Core.PlayerAggregate;

public class GamePlayStrategy : IGamePlayStrategy
{
    private class PlacementOption
    {
        public int Row { get; set; }
        public int ImmediateScore { get; set; }
        public int FuturePotential { get; set; }
        public int TotalScore => ImmediateScore + FuturePotential;
    }

    public ITakeTilesMove GetBestTakeTilesMove(Guid playerId, IGame game)
    {
        var player = game.Players.First(p => p.Id == playerId);
        var allSources = game.TileFactory.Displays.Cast<IFactoryDisplay>()
                               .Concat(new[] { game.TileFactory.TableCenter });

        var bestMove = allSources
            .Where(source => source.Tiles.Any())
            .SelectMany(source => source.Tiles
                .Where(t => t != TileType.StartingTile)
                .GroupBy(t => t)
                .Select(group => new {
                    Source = source,
                    Color = group.Key,
                    Count = group.Count(),
                    ContainsFirstPlayer = source.Tiles.Contains(TileType.StartingTile)
                }))
            .OrderByDescending(option => EvaluateTakeOption(option.Color, option.Count,
                                option.ContainsFirstPlayer, player, game))
            .FirstOrDefault();

        return bestMove != null
            ? new TakeTilesMove(bestMove.Source, bestMove.Color)
            : throw new InvalidOperationException("No valid moves available");
    }

    private float EvaluateTakeOption(TileType color, int count, bool containsFirstPlayer,
                                   IPlayer player, IGame game)
    {
        float score = 0;

        // 1. Kijk of we een rij kunnen afmaken
        for (int row = 0; row < 5; row++)
        {
            var line = player.Board.PatternLines[row];
            if (line.TileType == color && !line.IsComplete)
            {
                int needed = (row + 1) - line.NumberOfTiles;
                if (count >= needed)
                {
                    score += 1000; // Hoge prioriteit voor compleet maken
                    score += CalculateWallPlacementScore(row, GetWallColumnForColor(row, color), player.Board) * 2;
                }
            }
        }

        // 2. Kijk naar toekomstige plaatsingsmogelijkheden
        var placementOptions = GetBestPlacementOptions(color, player.Board);
        if (placementOptions.Any())
        {
            score += placementOptions.Max(o => o.TotalScore) * 0.8f;
        }

        // 3. Floorline management
        int floorSpace = 7 - player.Board.FloorLine.Length;
        if (count > floorSpace)
        {
            score -= (count - floorSpace) * 50;
        }

        // 4. First player token afweging
        if (containsFirstPlayer)
        {
            score += player.Board.FloorLine.Length <= 2 ? 30 : -100;
        }

        return score;
    }

    public IPlaceTilesMove GetBestPlaceTilesMove(Guid playerId, IGame game)
    {
        var player = game.Players.First(p => p.Id == playerId);
        var color = player.TilesToPlace.FirstOrDefault();
        var count = player.TilesToPlace.Count;

        // 1. HOOGSTE PRIORITEIT: Vul eerst bestaande, onvolledige lijnen aan
        for (int row = 0; row < 5; row++)
        {
            var line = player.Board.PatternLines[row];
            if (line.NumberOfTiles > 0 && line.TileType == color && !line.IsComplete)
            {
                // Als we genoeg tegels hebben om de lijn compleet te maken OF
                // als we minstens 1 tegel kunnen toevoegen aan een onvolledige lijn
                return PlaceTilesMove.CreateMoveOnPatternLine(row);
            }
        }

        // 2. Kies nieuwe lijnen strategisch (lange lijnen eerst)
        var validNewRows = new List<(int row, int capacity)>();
        for (int row = 0; row < 5; row++) // Begin bij rij 5 (index 4)
        {
            var line = player.Board.PatternLines[row];
            if (line.NumberOfTiles == 0 && !player.Board.IsColorInWallRow(row, color))
            {
                validNewRows.Add((row, row + 1));
            }
        }

        // Kies de langst mogelijke lijn die past
        foreach (var option in validNewRows.OrderByDescending(x => x.capacity))
        {
            // Voor rij 5 (index 4): altijd plaatsen als mogelijk
            if (option.row == 4) return PlaceTilesMove.CreateMoveOnPatternLine(option.row);

            // Voor andere rijen: alleen als we genoeg tegels hebben
            if (count <= option.capacity)
            {
                return PlaceTilesMove.CreateMoveOnPatternLine(option.row);
            }
        }

        // 3. Als laatste redmiddel: floorline (maar probeer dit te vermijden)
        return PlaceTilesMove.CreateMoveOnFloorLine();
    }

    private List<PlacementOption> GetBestPlacementOptions(TileType color, IBoard board)
    {
        var options = new List<PlacementOption>();

        for (int row = 0; row < 5; row++)
        {
            if (board.IsColorInWallRow(row, color)) continue;

            int immediateScore = 0;
            int futurePotential = 0;

            // Bereken directe score als we deze rij zouden afmaken
            int col = GetWallColumnForColor(row, color);
            immediateScore = CalculateWallPlacementScore(row, col, board);

            // Bereken toekomstig potentieel
            futurePotential = CalculateFuturePotential(row, col, board);

            options.Add(new PlacementOption
            {
                Row = row,
                ImmediateScore = immediateScore,
                FuturePotential = futurePotential
            });
        }

        return options;
    }

    private int CalculateWallPlacementScore(int row, int col, IBoard board)
    {
        int score = 1; // Basispunt

        // Check horizontale aansluitingen
        int horizontal = 1;
        for (int c = col - 1; c >= 0 && board.Wall[row, c].HasTile; c--) horizontal++;
        for (int c = col + 1; c < 5 && board.Wall[row, c].HasTile; c++) horizontal++;
        if (horizontal > 1) score += horizontal;

        // Check verticale aansluitingen
        int vertical = 1;
        for (int r = row - 1; r >= 0 && board.Wall[r, col].HasTile; r--) vertical++;
        for (int r = row + 1; r < 5 && board.Wall[r, col].HasTile; r++) vertical++;
        if (vertical > 1) score += vertical;

        return score;
    }

    private int CalculateFuturePotential(int row, int col, IBoard board)
    {
        int potential = 0;

        // Potentiële horizontale aansluitingen
        if (col > 0 && !board.Wall[row, col - 1].HasTile) potential += 10;
        if (col < 4 && !board.Wall[row, col + 1].HasTile) potential += 10;

        // Potentiële verticale aansluitingen
        if (row > 0 && !board.Wall[row - 1, col].HasTile) potential += 10;
        if (row < 4 && !board.Wall[row + 1, col].HasTile) potential += 10;

        return potential;
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
}