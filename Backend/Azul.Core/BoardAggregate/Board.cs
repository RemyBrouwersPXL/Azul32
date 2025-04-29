using Azul.Core.BoardAggregate.Contracts;
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
        throw new NotImplementedException();
    }

    public void CalculateFinalBonusScores()
    {
        throw new NotImplementedException();
    }

    public void DoWallTiling(ITileFactory tileFactory)
    {
        throw new NotImplementedException();
    }
}