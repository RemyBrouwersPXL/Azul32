using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.TileFactoryAggregate;

/// <inheritdoc cref="ITileBag"/>
internal class TileBag : ITileBag
{
    private readonly List<TileType> _tiles = new List<TileType>();
    private readonly Random _random = new Random();


    public IReadOnlyList<TileType> Tiles => _tiles.AsReadOnly();

    public void AddTiles(int amount, TileType tileType)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be greater than 0.");

        if (tileType == null)
            throw new ArgumentNullException(nameof(tileType));

        for (int i = 0; i < amount; i++)
        {
            _tiles.Add(tileType);
        }
    }

    public void AddTiles(IReadOnlyList<TileType> tilesToAdd)
    {
        if (tilesToAdd == null)
            throw new ArgumentNullException(nameof(tilesToAdd));

        if (tilesToAdd.Any(t => t == null))
            throw new ArgumentException("Tiles to add cannot contain null elements.", nameof(tilesToAdd));

        _tiles.AddRange(tilesToAdd);
    }

    public bool TryTakeTiles(int amount, out IReadOnlyList<TileType> tiles)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be greater than 0.");

        IList<TileType> takenTiles = new List<TileType>();
        bool hasEnoughTiles = _tiles.Count >= amount;
        int tilesToTake = Math.Min(amount, _tiles.Count);

        for (int i = 0; i < tilesToTake; i++)
        {
            int index = _random.Next(_tiles.Count);
            takenTiles.Add(_tiles[index]);
            _tiles.RemoveAt(index);
        }

        tiles = takenTiles.AsReadOnly();
        return hasEnoughTiles;
    }
}