using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.TileFactoryAggregate;

internal class TileFactory: ITileFactory
{
    private readonly ITileBag _bag;
    private readonly IList<IFactoryDisplay> _displays;
    private readonly ITableCenter _tableCenter;
    private readonly IList<TileType> _usedTiles = new List<TileType>();
    internal TileFactory(int numberOfDisplays, ITileBag bag)
    {
        if (numberOfDisplays <= 0)
            throw new ArgumentOutOfRangeException(nameof(numberOfDisplays), "Number of displays must be positive");

        _bag = bag;
        _tableCenter = new TableCenter();
        _displays = new List<IFactoryDisplay>(numberOfDisplays);

        for (int i = 0; i < numberOfDisplays; i++)
        {
            _displays.Add(new FactoryDisplay(_tableCenter));
        }

    }

    public ITileBag Bag => _bag;

    public IReadOnlyList<IFactoryDisplay> Displays => _displays.AsReadOnly();

    public ITableCenter TableCenter => _tableCenter;

    public IReadOnlyList<TileType> UsedTiles => _usedTiles.AsReadOnly();

    public bool IsEmpty => _displays.All(d => d.IsEmpty) && _tableCenter.IsEmpty;

    public void AddToUsedTiles(TileType tile)
    {
        if (tile == TileType.StartingTile)
            throw new ArgumentException("Cannot add StartingTile to used tiles", nameof(tile));

        _usedTiles.Add(tile);
    }

    public void FillDisplays()
    {
        if (_usedTiles.Count > 0)
        {
            foreach (TileType tile in _usedTiles)
            {
                _bag.AddTiles(_usedTiles.Count, tile);
            }
            
            _usedTiles.Clear();
        }

        // 2. Fill each display that is empty
        foreach (var display in _displays.Where(d => d.IsEmpty))
        {
            List<TileType> displayTiles = new List<TileType>();

            // First try to take 4 tiles
            if (_bag.TryTakeTiles(4, out IReadOnlyList<TileType> firstBatch))
            {
                displayTiles.AddRange(firstBatch);
            }
            else
            {
                // If not enough, take whatever is available
                if (_bag.TryTakeTiles(_bag.Tiles.Count, out IReadOnlyList<TileType> remainingTiles))
                {
                    displayTiles.AddRange(remainingTiles);
                }
            }

            // If we still don't have enough tiles, leave the display partially filled
            display.AddTiles(displayTiles);
        }

        // Add starting player tile to center
        TableCenter.AddStartingTile();
    }

    public IReadOnlyList<TileType> TakeTiles(Guid displayId, TileType tileType)
    {
        if (tileType == TileType.StartingTile)
            throw new ArgumentException("Cannot take StartingTile from displays", nameof(tileType));

        var display = _displays.FirstOrDefault(d => d.Id == displayId);
        if (display == null)
            throw new KeyNotFoundException($"Display with id {displayId} not found");

        var takenTiles = display.TakeTiles(tileType);

        // Move remaining tiles from display to table center
        var remainingTiles = display.Tiles.Where(t => t != tileType).ToList();
        _tableCenter.AddTiles(remainingTiles);
        display.AddTiles(new List<TileType>()); // "Leegmaken" door lege lijst toe te voegen

        // 5. Retourneer de genomen tegels
        return takenTiles;
    }
}