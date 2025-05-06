using System.ComponentModel;
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
    private int _roundNumber;


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
            } else if (newplayer.LastVisitToPortugal != null && firstplayer.LastVisitToPortugal == null)
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

        _roundNumber = 1;

    }

    

    public Guid Id { get; }

    public ITileFactory TileFactory { get; }

    public IPlayer[] Players { get; }

    public Guid PlayerToPlayId { get; }


    public int RoundNumber => _roundNumber;

    public bool HasEnded { get; }

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
       
        if (PlayerToPlayId != playerId)
            throw new InvalidOperationException("It's not this player's turn.");

       
        IPlayer player = Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
            throw new InvalidOperationException($"Player with ID {playerId} does not exist.");

        if (player.TilesToPlace.Any())
            throw new InvalidOperationException("Player already has tiles to place. Place them first before taking new ones.");

        

        IReadOnlyList<TileType> takenTiles = TileFactory.TakeTiles(displayId, tileType);
        var remainingTiles = TileFactory.TableCenter.Tiles;
        



        if (takenTiles.Contains(TileType.StartingTile))
        {
            player.HasStartingTile = true;
            
        }


        player.TilesToPlace.AddRange(takenTiles);

        
    }
}