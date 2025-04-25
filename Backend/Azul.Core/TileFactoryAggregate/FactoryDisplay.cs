using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.TileFactoryAggregate;

internal class FactoryDisplay : IFactoryDisplay
{
    private readonly List<TileType> _tiles = new List<TileType>();
    public FactoryDisplay(ITableCenter tableCenter)
    {
        //FYI: The table center is injected to be able to move tiles (that were not taken by a player) to the center
    }

    public Guid Id { get; }

    public IReadOnlyList<TileType> Tiles => _tiles;

    public bool IsEmpty { get; }

    public void AddTiles(IReadOnlyList<TileType> tilesToAdd)
    {
        if (tilesToAdd == null)
            throw new ArgumentNullException(nameof(tilesToAdd));

        if (tilesToAdd.Any(t => t == null))
            throw new ArgumentException("Tiles to add cannot contain null elements.", nameof(tilesToAdd));

        _tiles.AddRange(tilesToAdd);
    }

    public IReadOnlyList<TileType> TakeTiles(TileType tileType)
    {
        throw new NotImplementedException();
    }
}