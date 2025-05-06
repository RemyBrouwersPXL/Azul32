using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.TileFactoryAggregate;

internal class TileFactory: ITileFactory
{
    
    private readonly IList<IFactoryDisplay> _displays;
    private readonly ITableCenter _tableCenter;
    private readonly List<TileType> _usedTiles;
    internal TileFactory(int numberOfDisplays, ITileBag bag)
    {
        if (numberOfDisplays <= 0)
            throw new ArgumentOutOfRangeException(nameof(numberOfDisplays), "Number of displays must be positive");

        Bag = bag;
        _tableCenter = new TableCenter();
        _displays = new List<IFactoryDisplay>(numberOfDisplays);
        _usedTiles = new List<TileType>();
 

        for (int i = 0; i < numberOfDisplays; i++)
        {
            _displays.Add(new FactoryDisplay(_tableCenter));
        }


    }

    public ITileBag Bag { get; }

    public IReadOnlyList<IFactoryDisplay> Displays => _displays.AsReadOnly();

    public ITableCenter TableCenter => _tableCenter;

    public IReadOnlyList<TileType> UsedTiles => _usedTiles;

    public bool IsEmpty => _displays.All(d => !d.Tiles.Any());


    public void AddToUsedTiles(TileType tile)
    {
        if (tile == TileType.StartingTile)
            throw new ArgumentException("Cannot add StartingTile to used tiles", nameof(tile));

        _usedTiles.Add(tile);
    }

    public void FillDisplays()
    {
        


        int displayCount = _displays.Count;


        for (int count = 0; count < displayCount; count++)
        {
            // 2. Fill each display that is empty
            if (!_displays[count].IsEmpty)
                continue;

            List<TileType> displayTiles = new List<TileType>();
            int tilesNeeded = 4;

            // Try to take tiles from the bag
            if (Bag.Tiles.Count >= 0)
            {
                if (Bag.TryTakeTiles(tilesNeeded, out IReadOnlyList<TileType> tiles))
                {
                    displayTiles.AddRange(tiles);
                }
                else
                {
                    displayTiles.AddRange(tiles);
                    if (_usedTiles.Count > 0)
                    {
                        var groupedTiles = _usedTiles.GroupBy(t => t);
                        foreach (var group in groupedTiles)
                        {
                            Bag.AddTiles(group.Count(), group.Key);
                        }
                        _usedTiles.Clear();
                    }
                    int remainingTiles = tilesNeeded - 2;
                    if (remainingTiles > 0 && Bag.TryTakeTiles(remainingTiles, out IReadOnlyList<TileType> additionalTiles))
                    {
                        displayTiles.AddRange(additionalTiles);
                    }
                }

            }
            else
            {

                // Add used tiles back to the bag


                // Calculate remaining tiles needed and try again

            }
            if (displayTiles.Count > 0)
            {
                _displays[count].AddTiles(displayTiles);
            }




        }


    }



    public IReadOnlyList<TileType> TakeTiles(Guid displayId, TileType tileType)
    {
        // 1. Check if it's the table center
        if (_tableCenter.Id == displayId)
        {
            // Special handling for table center
            var centerTakenTiles = new List<TileType>();

            if (tileType != TileType.StartingTile && !_tableCenter.Tiles.Contains(tileType))
            {
                throw new InvalidOperationException($"Tile type {tileType} is not in table center");
            }// Renamed to avoid conflict

            // Take requested tiles
            centerTakenTiles.AddRange(_tableCenter.TakeTiles(tileType));

            // Always take starting tile if present
            if (_tableCenter.Tiles.Contains(TileType.StartingTile))
            {
                centerTakenTiles.AddRange(_tableCenter.TakeTiles(TileType.StartingTile));
            }



            return centerTakenTiles;
        }

        // 2. Handle factory displays
        IFactoryDisplay display = _displays.FirstOrDefault(d => d.Id == displayId);
        if (display == null)
            if (_tableCenter.Id != displayId)
            {
                throw new InvalidOperationException($"Display with id {displayId} not exist tile");
            }
        

        if (display.Tiles == null || !display.Tiles.Any())
            throw new InvalidOperationException($"Display {displayId} has no tiles");

        if (!display.Tiles.Contains(tileType))
            throw new InvalidOperationException($"Tile type {tileType} is not in display {displayId}");

        var displayTakenTiles = display.TakeTiles(tileType); // Renamed to avoid conflict

        // Move remaining tiles to table center
        var remainingTiles = display.Tiles.Where(t => t != tileType).ToList();
        if (remainingTiles.Any())
        {
            _tableCenter.AddTiles(remainingTiles);
        }

        return displayTakenTiles;
    }
}