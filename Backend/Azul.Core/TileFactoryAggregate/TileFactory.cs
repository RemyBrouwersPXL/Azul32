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

    //public void FillDisplays()
    //{
    //    if (_displays == null) throw new InvalidOperationException("Displays not initialized");
    //    if (Bag == null) throw new InvalidOperationException("Tile bag not initialized");

    //    var pendingDisplays = new List<(IFactoryDisplay display, List<TileType> alreadyTaken, int stillNeeded)>();

    //    foreach (var display in _displays)
    //    {
    //        if (!display.IsEmpty)
    //            continue;

    //        if (Bag.Tiles.Count != 0)
    //        {
    //            if (Bag.TryTakeTiles(4, out var tilesTaken) && tilesTaken.Count == 4)
    //            {
    //                display.AddTiles(tilesTaken);
    //            }
    //            else
    //            {
    //                var taken = tilesTaken?.ToList() ?? new List<TileType>();
    //                int needed = 4 - taken.Count;
    //                pendingDisplays.Add((display, taken, needed));
    //            }
    //        }



    //    }

    //    if (pendingDisplays.Count > 0)
    //    {
    //        ReturnUsedTilesToBag();

    //        foreach (var (display, alreadyTaken, stillNeeded) in pendingDisplays)
    //        {
    //            if (Bag.TryTakeTiles(stillNeeded, out var remainingTiles))
    //            {
    //                alreadyTaken.AddRange(remainingTiles);
    //            }

    //            // Voeg pas nu alle tegels in één keer toe
    //            display.AddTiles(alreadyTaken);
    //        }
    //    }
    //}

    //private void ReturnUsedTilesToBag()
    //{
    //    if (_usedTiles == null || _usedTiles.Count == 0)
    //        return;

    //    var groupedTiles = _usedTiles.GroupBy(t => t);
    //    foreach (var group in groupedTiles)
    //    {
    //        Bag.AddTiles(group.Count(), group.Key);
    //    }
    //    _usedTiles.Clear();
    //}

    public IReadOnlyList<TileType> TakeTiles(Guid displayId, TileType tileType)
    {
        _tableCenter.AddStartingTile();
        // 1. Valideer tileType
        if (tileType == TileType.StartingTile)
            _tableCenter.TakeTiles(TileType.StartingTile);

        // 2. Zoek display of geef fout
        var display = _displays.FirstOrDefault(d => d.Id == displayId);
        if (display == null)
            throw new InvalidOperationException($"Display with id {displayId} not exist");

        // 3. Check of de display tegels bevat (voorkom 'empty enumerable')
        if (display.Tiles == null || !display.Tiles.Any())
            throw new InvalidOperationException($"Display {displayId} has no tile / tagel");

        

        // 4. Check of het gevraagde type aanwezig is
        if (!display.Tiles.Contains(tileType))
            throw new InvalidOperationException($"tile type {tileType} is not in display {displayId}");

        if (_tableCenter.IsEmpty)
        {
            
            throw new InvalidOperationException($"tablecenter {_tableCenter} has no tile");
        }

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