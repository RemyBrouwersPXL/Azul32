using System.ComponentModel;
using System.Drawing;
using Azul.Core.BoardAggregate;
using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;

namespace Azul.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class ComputerPlayer : PlayerBase
{
    private readonly IGamePlayStrategy _strategy;
    private static int _indexCounter = 1; // Static counter to ensure unique names
    private readonly string _index;

    public ComputerPlayer(IGamePlayStrategy strategy) : base(Guid.NewGuid(), $"Computer", null, 0)
    {
        _strategy = strategy;
        _index = _indexCounter.ToString();
        if (_indexCounter == 1)
        {
            _indexCounter = 2;
        }
        else if (_indexCounter == 2)
        {
            _indexCounter = 1;
        }
    }

    public void PlayTurn(IGame game)
    {
        // 1. Neem tegels
        var takeMove = _strategy.GetBestTakeTilesMove(Id, game);
        game.TakeTilesFromFactory(Id, takeMove.FactoryDisplayId, takeMove.TileType);

        // 2. Plaats tegels
        var placeMove = _strategy.GetBestPlaceTilesMove(Id, game);
        if (placeMove.PatternLineIndex >= 0)
        {
            game.PlaceTilesOnPatternLine(Id, placeMove.PatternLineIndex);
        }
        else
        {
            game.PlaceTilesOnFloorLine(Id);
        }
    }

    
}

