using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.TileFactoryAggregate;

internal class TileFactory: ITileFactory
{
    private readonly ITileBag _bag;
    private readonly IList<IFactoryDisplay> _displays;
    private readonly ITableCenter _tableCenter;
    private readonly List<TileType> _usedTiles;
    internal TileFactory(int numberOfDisplays, ITileBag bag)
    {
        if (numberOfDisplays <= 0)
            throw new ArgumentOutOfRangeException(nameof(numberOfDisplays), "Number of displays must be positive");

        _bag = bag;
        _tableCenter = new TableCenter();
        _displays = new List<IFactoryDisplay>(numberOfDisplays);
        _usedTiles = new List<TileType>();
 

        for (int i = 0; i < numberOfDisplays; i++)
        {
            _displays.Add(new FactoryDisplay(_tableCenter));
        }


    }

    public ITileBag Bag => _bag;

    public IReadOnlyList<IFactoryDisplay> Displays => _displays.AsReadOnly();

    public ITableCenter TableCenter => _tableCenter;

    public IReadOnlyList<TileType> UsedTiles => _usedTiles;

    public bool IsEmpty => _displays.All(d => d.IsEmpty);

    public void AddToUsedTiles(TileType tile)
    {
        if (tile == TileType.StartingTile)
            throw new ArgumentException("Cannot add StartingTile to used tiles", nameof(tile));

        _usedTiles.Add(tile);
    }

    public void FillDisplays()
    {
        // 1. Return used tiles to the bag
        if (_usedTiles.Count > 0)
        {
            var groupedTiles = _usedTiles.GroupBy(t => t);
            foreach (var group in groupedTiles)
            {
                _bag.AddTiles(group.Count(), group.Key);
            }
            _usedTiles.Clear();
        }

        // 2. Fill each display that is empty
        foreach (var display in _displays)
        {
            if (!display.IsEmpty)
                continue;

            List<TileType> displayTiles = new List<TileType>();

            // Try to take exactly 4 tiles (this is what the test expects)
            if (_bag.TryTakeTiles(4, out IReadOnlyList<TileType> firstBatch))
            {
                displayTiles.AddRange(firstBatch);
            }

            // Add whatever tiles we got (even if less than 4)
            if (displayTiles.Count > 0)
            {
                display.AddTiles(displayTiles);
            }
        }

        // 3. Add starting player tile to center
        TableCenter.AddStartingTile();
    }

    public IReadOnlyList<TileType> TakeTiles(Guid displayId, TileType tileType)
    {
        // 1. Valideer tileType
        if (tileType == TileType.StartingTile)
            throw new ArgumentException("Cannot take StartingTile from displays", nameof(tileType));

        // 2. Zoek display of geef fout
        var display = _displays.FirstOrDefault(d => d.Id == displayId);
        if (display == null)
            throw new InvalidOperationException($"Display with id {displayId} not exist");

        // 3. Check of de display tegels bevat (voorkom 'empty enumerable')
        if (display.Tiles == null || !display.Tiles.Any())
            throw new InvalidOperationException($"Display {displayId} has no tile");

        // 4. Check of het gevraagde type aanwezig is
        if (!display.Tiles.Contains(tileType))
            throw new InvalidOperationException($"Tile type {tileType} is not in display {displayId}");

        // 5. Neem alle tegels van het type
        var takenTiles = display.TakeTiles(tileType);

        // 6. Verplaats overige tegels naar het tafelcentrum (alleen als ze bestaan)
        var remainingTiles = display.Tiles.Where(t => t != tileType).ToList();
        if (remainingTiles.Any())
        {
            _tableCenter.AddTiles(remainingTiles);
        }

       

        return takenTiles;
    }
}