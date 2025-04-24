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
                _wall[row, col] = new TileSpot();
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
        throw new NotImplementedException();
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