using Azul.Core.BoardAggregate.Contracts;
using Azul.Core.TileFactoryAggregate;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.BoardAggregate;

/// <inheritdoc cref="IBoard"/>
internal class Board : IBoard
{
    private readonly IPatternLine[] _patternLines;
    private readonly TileSpot[,] _wall;
    private readonly TileSpot[] _floorLine;
    private int _score;
    internal Board()
    {
        _patternLines = new IPatternLine[5];
        for (int i = 0; i < 5; i++)
        {
            _patternLines[i] = new PatternLine(length: i + 1);
        }

        _wall = new TileSpot[5, 5];
        for (int row = 0; row < 5; row++)
        {
            for (int col = 0; col < 5; col++)
            {
                TileType tileType = row switch
                {
                    0 => col switch
                    {
                        0 => TileType.PlainBlue,
                        1 => TileType.YellowRed,
                        2 => TileType.PlainRed,
                        3 => TileType.BlackBlue,
                        4 => TileType.WhiteTurquoise,
                        _ => throw new InvalidOperationException("Ongeldige kolomindex")
                    },
                    1 => col switch
                    {
                        0 => TileType.WhiteTurquoise,
                        1 => TileType.PlainBlue,
                        2 => TileType.YellowRed,
                        3 => TileType.PlainRed,
                        4 => TileType.BlackBlue,
                        _ => throw new InvalidOperationException("Ongeldige kolomindex")
                    },
                    2 => col switch
                    {
                        0 => TileType.BlackBlue,
                        1 => TileType.WhiteTurquoise,
                        2 => TileType.PlainBlue,
                        3 => TileType.YellowRed,
                        4 => TileType.PlainRed,
                        _ => throw new InvalidOperationException("Ongeldige kolomindex")
                    },
                    3 => col switch
                    {
                        0 => TileType.PlainRed,
                        1 => TileType.BlackBlue,
                        2 => TileType.WhiteTurquoise,
                        3 => TileType.PlainBlue,
                        4 => TileType.YellowRed,
                        _ => throw new InvalidOperationException("Ongeldige kolomindex")
                    },
                    4 => col switch
                    {
                        0 => TileType.YellowRed,
                        1 => TileType.PlainRed,
                        2 => TileType.BlackBlue,
                        3 => TileType.WhiteTurquoise,
                        4 => TileType.PlainBlue,
                        _ => throw new InvalidOperationException("Ongeldige kolomindex")
                    },
                    _ => throw new InvalidOperationException("Ongeldige rijindex")
                };

                _wall[row, col] = new TileSpot(tileType);

            }
        }


        _floorLine = new TileSpot[7];
        for (int i = 0; i < 7; i++)
        {
            _floorLine[i] = new TileSpot();
        }

        _score = 0;
    }

    public IPatternLine[] PatternLines => _patternLines;

    public TileSpot[,] Wall => _wall;

    public TileSpot[] FloorLine => _floorLine;

    public int Score => _score;
    public bool HasCompletedHorizontalLine
    {
        get
        {
            for (int row = 0; row < 5; row++)
            {
                bool complete = true;
                for (int col = 0; col < 5; col++)
                {
                    if (!_wall[row, col].HasTile)
                    {
                        complete = false;
                        break;
                    }
                }
                if (complete) return true;
            }
            return false;
        }
    }


    public void AddTilesToFloorLine(IReadOnlyList<TileType> tilesToAdd, ITileFactory tileFactory)
    {
        if (tilesToAdd == null || tilesToAdd.Count == 0)
        {
            throw new ArgumentException("Tiles to add cannot be null or empty.", nameof(tilesToAdd));
        }
        int remainingTiles = tilesToAdd.Count;
        for (int i = 0; i < _floorLine.Length; i++)
        {
            if (!_floorLine[i].HasTile)
            {
                _floorLine[i].PlaceTile(tilesToAdd[remainingTiles - 1]);
                remainingTiles--;
                if (remainingTiles == 0)
                {
                    break;
                }
            }
        }
        for (int i = remainingTiles; i > 0; i--)
        {
            tileFactory.AddToUsedTiles(tilesToAdd[i - 1]);
        }
    }

    public void AddTilesToPatternLine(IReadOnlyList<TileType> tilesToAdd, int patternLineIndex, ITileFactory tileFactory)
    {
        // Validate pattern line index
        if (patternLineIndex < 0 || patternLineIndex >= PatternLines.Length)
        {
            throw new ArgumentOutOfRangeException(nameof(patternLineIndex), "Invalid pattern line index.");
        }

        // Check for null or empty tiles
        if (tilesToAdd == null || tilesToAdd.Count == 0)
        {
            return;
        }

        // Check if any tile is the starting tile (which is not allowed)
        if (tilesToAdd.Any(t => t == TileType.StartingTile))
        {
            // Move starting tile directly to floor line
            var startingTiles = tilesToAdd.Where(t => t == TileType.StartingTile).ToList();
            AddTilesToFloorLine(startingTiles, tileFactory);

            // Continue with only non-starting tiles
            var nonStartingTiles = tilesToAdd.Where(t => t != TileType.StartingTile).ToList();
            if (nonStartingTiles.Count == 0)
            {
                return; // Only starting tiles were provided
            }
            var tileType = nonStartingTiles[0];
            if (tilesToAdd.Any(t => t != tileType && t != TileType.StartingTile))
            {
                throw new ArgumentException("All tiles must be of the same type (excluding starting tile).");
            }

            int wallRow = patternLineIndex;
            for (int col = 0; col < Wall.GetLength(1); col++)
            {
                if (Wall[wallRow, col].HasTile && Wall[wallRow, col].Type == tileType)
                {
                    throw new InvalidOperationException("Cannot add tiles to pattern line - wall already contains this tile type in the corresponding row.");
                }
            }

            var patternLine = PatternLines[patternLineIndex];

            // Try to add tiles to pattern line (only non-starting tiles)
            var tilesForPatternLine = tilesToAdd.Where(t => t != TileType.StartingTile).ToList();
            patternLine.TryAddTiles(tileType, tilesForPatternLine.Count, out int remainingTiles);
            // Use first non-starting tile as the type
            if (remainingTiles > 0)
            {
                // Get the excess tiles (all of same type)
                var excessTiles = Enumerable.Repeat(tileType, remainingTiles).ToList();
                AddTilesToFloorLine(excessTiles, tileFactory);
            }
        }
        else
        {
            var tileType = tilesToAdd[0];
            if (tilesToAdd.Any(t => t != tileType && t != TileType.StartingTile))
            {
                throw new ArgumentException("All tiles must be of the same type (excluding starting tile).");
            }
            int wallRow = patternLineIndex;
            for (int col = 0; col < Wall.GetLength(1); col++)
            {
                if (Wall[wallRow, col].HasTile && Wall[wallRow, col].Type == tileType)
                {
                    throw new InvalidOperationException("Cannot add tiles to pattern line - wall already contains this tile type in the corresponding row.");
                }
            }

            var patternLine = PatternLines[patternLineIndex];

            // Try to add tiles to pattern line (only non-starting tiles)
            var tilesForPatternLine = tilesToAdd.Where(t => t != TileType.StartingTile).ToList();
            patternLine.TryAddTiles(tileType, tilesForPatternLine.Count, out int remainingTiles);
            // Use first non-starting tile as the type
            if (remainingTiles > 0)
            {
                // Get the excess tiles (all of same type)
                var excessTiles = Enumerable.Repeat(tileType, remainingTiles).ToList();
                AddTilesToFloorLine(excessTiles, tileFactory);
            }
        }
        // Use first tile as the type

        // Verify all (non-starting) tiles are same type


    }


    public void CalculateFinalBonusScores()
    {
        int completedHorizontalLines = 0;
        for (int row = 0; row < 5; row++)
        {
            bool complete = true;
            for (int col = 0; col < 5; col++)
            {
                if (!_wall[row, col].HasTile)
                {
                    complete = false;
                    break;
                }
            }
            if (complete) completedHorizontalLines++;
        }
        _score += completedHorizontalLines * 2;
        // Check for completed vertical lines
        for (int col = 0; col < 5; col++)
        {
            bool complete = true;
            for (int row = 0; row < 5; row++)
            {
                if (!_wall[row, col].HasTile)
                {
                    complete = false;
                    break;
                }
            }
            if (complete) _score += 7;
        }
        // Check for completed colors
        // Dictionary to count how many tiles of each color are placed
        var colorCounts = new Dictionary<TileType, int>();

        // Initialize counts for all tile types (excluding StartingTile)
        foreach (TileType tileType in Enum.GetValues(typeof(TileType)))
        {
            if (tileType != TileType.StartingTile)
            {
                colorCounts[tileType] = 0;
            }
        }

        // Count all tiles on the wall
        for (int row = 0; row < 5; row++)
        {
            for (int col = 0; col < 5; col++)
            {

                if (_wall[row, col].HasTile)
                {
                    TileType? type = _wall[row, col].Type;

                    if (type != TileType.StartingTile)
                    {
                        // Fix for CS1503: Ensure the nullable TileType is properly handled before incrementing the dictionary value.
                        if (type.HasValue && type != TileType.StartingTile)
                        {
                            colorCounts[type.Value]++;
                        }

                    }
                }
            }
        }

        // Check how many colors have all 5 tiles placed
        int completedColors = 0;
        foreach (var count in colorCounts.Values)
        {
            if (count == 5)
            {
                completedColors++;
            }
        }

        _score += completedColors * 10;
    }

    public void DoWallTiling(ITileFactory tileFactory)
    {
        for (int row = 0; row < 5; row++)
        {
            if (_patternLines[row].IsComplete && _patternLines[row].TileType.HasValue)
            {
                TileType tileType = _patternLines[row].TileType.Value;
                bool tilePlaced = false;

                // Find correct column for this tile type
                for (int col = 0; col < 5; col++)
                {
                    if (_wall[row, col].Type == tileType)
                    {
                        if (!_wall[row, col].HasTile)
                        {
                            // Place tile on wall
                            _wall[row, col].PlaceTile(tileType);
                            tilePlaced = true;
                            //_score += 1;
                            // Calculate immediate score
                            CalculateImmediateScore(row, col);
                        }
                        
                        break;
                    }
                }

                // Clear pattern line (keep 1 tile for first row)


                int tilesRemoved = tilePlaced ? _patternLines[row].NumberOfTiles - 1 : _patternLines[row].NumberOfTiles;
                for (int i = 0; i < tilesRemoved; i++)
                {
                    tileFactory.AddToUsedTiles(_patternLines[row].TileType.Value);
                }



                _patternLines[row].Clear();

               
                
            }
        }

        // Process floor line

        int[] penalties = { -1, -1, -2, -2, -2, -3, -3 };
        int penalty = 0;

        for (int i = 0; i < _floorLine.Length && i < penalties.Length; i++)
        {

            if (_floorLine[i].HasTile)
            {
                if (_floorLine[i].Type != TileType.StartingTile)
                {
                    tileFactory.AddToUsedTiles(_floorLine[i].Type.Value);
                }
                

                penalty += penalties[i];
                _floorLine[i].Clear();
            }

        }

        _score += penalty;
        if (_score < 0)
        {
            _score = 0;
        }

    }

    private void CalculateImmediateScore(int row, int col)
    {
        int horizontal = CountDirection(row, col, 0, -1) + CountDirection(row, col, 0, 1);
        int vertical = CountDirection(row, col, -1, 0) + CountDirection(row, col, 1, 0);

        int score = 0;

        if (horizontal > 0) score += horizontal + 1; // +1 = huidige tegel
        if (vertical > 0) score += vertical + 1;

        if (horizontal == 0 && vertical == 0)
            score = 1;

        _score += score;
    }

    private int CountDirection(int row, int col, int rowDelta, int colDelta)
    {
        int count = 0;
        int r = row + rowDelta;
        int c = col + colDelta;

        while (r >= 0 && r < 5 && c >= 0 && c < 5 && _wall[r, c].HasTile)
        {
            count++;
            r += rowDelta;
            c += colDelta;
        }

        return count;
    }
}
