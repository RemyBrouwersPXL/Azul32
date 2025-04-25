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
        throw new NotImplementedException();
    }

    public void FillDisplays()
    {
        throw new NotImplementedException();
    }

    public IReadOnlyList<TileType> TakeTiles(Guid displayId, TileType tileType)
    {
        throw new NotImplementedException();
    }
}