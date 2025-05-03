using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.GameAggregate;

/// <inheritdoc cref="IGameService"/>
internal class GameService : IGameService
{
    private IGameRepository _gameRepository;

    public GameService(IGameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }
    public IGame GetGame(Guid gameId)
    {
        {
            if (gameId == Guid.Empty)
            {
                throw new ArgumentException("Game ID cannot be empty", nameof(gameId));
            }

            var game = _gameRepository.GetById(gameId);

            if (game == null)
            {
                throw new KeyNotFoundException($"Game with ID {gameId} not found");
            }

            return game;
        }
    }
    public void TakeTilesFromFactory(Guid gameId, Guid playerId, Guid displayId, TileType tileType)
    {
        throw new NotImplementedException();
    }

    public void PlaceTilesOnPatternLine(Guid gameId, Guid playerId, int patternLineIndex)
    {
        throw new NotImplementedException();
    }

    public void PlaceTilesOnFloorLine(Guid gameId, Guid playerId)
    {
        throw new NotImplementedException();
    }
}