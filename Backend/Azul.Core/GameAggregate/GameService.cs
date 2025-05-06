using System.Collections;
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
        if (gameId == Guid.Empty)
        {
            throw new ArgumentException("Game ID cannot be empty", nameof(gameId));
        }

        IGame game = _gameRepository.GetById(gameId);

        if (game == null)
        {
            throw new KeyNotFoundException($"Game with ID {gameId} not found");
        }

        return game;
    }
    public void TakeTilesFromFactory(Guid gameId, Guid playerId, Guid displayId, TileType tileType)
    {
        // Fix: Cast the retrieved game object to the appropriate type (IGame)
        IGame game = _gameRepository.GetById(gameId);

        if (game == null)
        {
            throw new InvalidOperationException($"Game with ID {gameId} could not be retrieved or is of an invalid type.");
        }

        // Call TakeTilesFromFactory on the game
        game.TakeTilesFromFactory(playerId, displayId, tileType);

        // Persist the updated game state
        
    }

    public void PlaceTilesOnPatternLine(Guid gameId, Guid playerId, int patternLineIndex)
    {
        IGame game = _gameRepository.GetById(gameId);
        if (game == null)
        {
            throw new InvalidOperationException($"Game with ID {gameId} could not be retrieved or is of an invalid type.");
        }
        // Call PlaceTilesOnPatternLine on the game
        game.PlaceTilesOnPatternLine(playerId, patternLineIndex);
    }

    public void PlaceTilesOnFloorLine(Guid gameId, Guid playerId)
    {
        IGame game = _gameRepository.GetById(gameId);
        if (game == null)
        {
            throw new InvalidOperationException($"Game with ID {gameId} could not be retrieved or is of an invalid type.");
        }
        // Call PlaceTilesOnFloorLine on the game
        game.PlaceTilesOnFloorLine(playerId);
    }
}
