using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.TileFactoryAggregate;

internal class TableCenter : ITableCenter
{
    private readonly List<TileType> _tiles = new List<TileType>();
    private const TileType StartingTile = TileType.StartingTile;

    public Guid Id { get; }

    public IReadOnlyList<TileType> Tiles => _tiles;

    public bool IsEmpty => Tiles == null || !Tiles.Any();

    public void AddStartingTile()
    {
        if (!_tiles.Contains(StartingTile))
        {
            _tiles.Add(StartingTile);
        }
    }

    public void AddTiles(IReadOnlyList<TileType> tilesToAdd)
    {
        if (tilesToAdd == null)
            throw new ArgumentNullException(nameof(tilesToAdd));

        if (tilesToAdd.Contains(StartingTile))
            throw new ArgumentException("Cannot add StartingTile through this method", nameof(tilesToAdd));

        _tiles.AddRange(tilesToAdd);
    }

    public IReadOnlyList<TileType> TakeTiles(TileType tileType)
    {
        if (tileType == StartingTile)
        {
            // Special case: when taking starting tile, take ALL tiles of that type (should be just 1)
            var startingTiles = _tiles.Where(t => t == StartingTile).ToList();
            _tiles.RemoveAll(t => t == StartingTile);
            return startingTiles;
        }
        else
        {
            // Normal tiles: take all tiles of the specified type
            var takenTiles = _tiles.Where(t => t == tileType).ToList();
            _tiles.RemoveAll(t => t == tileType);
            return takenTiles;
        }
    }
}