using Azul.Core.BoardAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.BoardAggregate;

/// <inheritdoc cref="IPatternLine"/>
internal class PatternLine : IPatternLine
{
    private TileType? _tileType;
    private int _numberOfTiles;

    public PatternLine(int length)
    {
        Length = length;
        _tileType = null;
        _numberOfTiles = 0;
    }

    public int Length { get; }

    public TileType? TileType => _tileType;

    public int NumberOfTiles => _numberOfTiles;

    public bool IsComplete => _numberOfTiles == Length;

    public void Clear()
    {
        _tileType = null;
        _numberOfTiles = 0;
    }

    public void TryAddTiles(TileType type, int numberOfTilesToAdd, out int remainingNumberOfTiles)
    {
        if (IsComplete)
        {
            throw new InvalidOperationException("Pattern line is already complete.");
        }

        if (_tileType.HasValue && _tileType.Value != type)
        {
            throw new InvalidOperationException("Pattern line already contains tiles of another type.");
        }

        if (!_tileType.HasValue)
        {
            _tileType = type;
        }

        int availableSpace = Length - _numberOfTiles;
        int tilesToAdd = Math.Min(availableSpace, numberOfTilesToAdd);

        _numberOfTiles += tilesToAdd;
        remainingNumberOfTiles = numberOfTilesToAdd - tilesToAdd;
    }
}