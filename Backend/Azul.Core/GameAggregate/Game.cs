using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TableAggregate;
using Azul.Core.TileFactoryAggregate;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.GameAggregate;

/// <inheritdoc cref="IGame"/>
internal class Game : IGame
{
    


    /// <summary>
    /// Creates a new game and determines the player to play first.
    /// </summary>
    /// <param name="id">The unique identifier of the game</param>
    /// <param name="tileFactory">The tile factory</param>
    /// <param name="players">The players that will play the game</param>
    public Game(Guid id, ITileFactory tileFactory, IPlayer[] players)
    {
        if (players.Length < 2 || players.Length > 4)
            throw new ArgumentException("The number of players must be between 2 and 4.");

        IPlayer firstplayer = players[0];
      
        foreach (IPlayer newplayer in players)
        {
            

            if (newplayer.LastVisitToPortugal > firstplayer.LastVisitToPortugal)
            {
                firstplayer = newplayer;
            }
            
        }
        Id = id;
        TileFactory = tileFactory;
        Players = players;
        
        PlayerToPlayId = firstplayer.Id; 
        TileFactory.TableCenter.AddStartingTile();
        TileFactory.FillDisplays();

    }

    

    public Guid Id { get; }

    public ITileFactory TileFactory { get; }

    public IPlayer[] Players { get; }

    public Guid PlayerToPlayId { get; }

    public int RoundNumber => throw new NotImplementedException();

    public bool HasEnded => throw new NotImplementedException();

    public void PlaceTilesOnFloorLine(Guid playerId)
    {
        throw new NotImplementedException();
    }

    public void PlaceTilesOnPatternLine(Guid playerId, int patternLineIndex)
    {
        throw new NotImplementedException();
    }

    public void TakeTilesFromFactory(Guid playerId, Guid displayId, TileType tileType)
    {
        {
            // 1. Validate the player
            var player = Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null)
                throw new InvalidOperationException($"Player with ID {playerId} does not exist.");

            // 2. Validate the display
            var display = TileFactory.Displays.FirstOrDefault(d => d.Id == displayId);
            if (display == null)
                throw new InvalidOperationException($"Display with ID {displayId} does not exist.");

            // 3. Validate the tile type
            if (!display.Tiles.Contains(tileType))
                throw new InvalidOperationException($"Tile type {tileType} is not available in display {displayId}.");

            // 4. Take tiles from the display
            var takenTiles = TileFactory.TakeTiles(displayId, tileType);

            // 5. Handle the starting tile
            if (takenTiles.Contains(TileType.StartingTile))
            {
                player.HasStartingTile = true;
                
            }

            // 6. Add the taken tiles to the player's tiles to place
            player.TilesToPlace.AddRange(takenTiles);

            
            
        }
    }
}