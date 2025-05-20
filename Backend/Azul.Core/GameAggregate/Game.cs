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
    private Guid _playerToPlayId;
    private bool _hasEnded;

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
        GamePlayStrategy strategy = new GamePlayStrategy();
        _playerToPlayId = firstplayer.Id; 
        TileFactory.TableCenter.AddStartingTile();
        TileFactory.FillDisplays();
        _hasEnded = false;
        _roundNumber = 1;

    }

    

    public Guid Id { get; }

    public ITileFactory TileFactory { get; }

    public IPlayer[] Players { get; }

    // Modify the PlayerToPlayId property to make it writable by adding a private setter.
    public Guid PlayerToPlayId => _playerToPlayId;


    public int RoundNumber => _roundNumber;

    public bool HasEnded => _hasEnded;

    public void PlaceTilesOnFloorLine(Guid playerId)
    {
        if (PlayerToPlayId != playerId)
            throw new InvalidOperationException("It's not this player's turn.");
        // Get the player
        IPlayer player = Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
            throw new InvalidOperationException($"Player with ID {playerId} does not exist.");
        // Check if player has tiles to place
        if (player.TilesToPlace.Count == 0)
            throw new InvalidOperationException("Player has no tiles to place.");
        // Get the player's board
        if (player.Board == null)
            throw new InvalidOperationException("Player has no board initialized.");
        // Place tiles on the floor line
        try
        {
            player.Board.AddTilesToFloorLine(player.TilesToPlace, TileFactory);
            // Clear the player's tiles to place
            player.TilesToPlace.Clear();
            bool tookStartingTile = player.TilesToPlace.Contains(TileType.StartingTile);
            var playerHasStartingTile = Players.FirstOrDefault(p => p.HasStartingTile == true);
                       
           
            bool shouldStartNewRound = TileFactory.IsEmpty && TileFactory.TableCenter.IsEmpty;

            if (shouldStartNewRound)
            {

                foreach (IPlayer p in Players)
                {
                    p.Board.DoWallTiling(TileFactory);
                    p.Board.CalculateFinalBonusScores();

                    if (p.Board.HasCompletedHorizontalLine)
                    {
                        _hasEnded = true;
                    }
                }


                TileFactory.FillDisplays();


                // Reset starting tile status
                foreach (var p in Players)
                {
                    p.HasStartingTile = false;
                }

                // Zoek speler met starting tile op floor line
                var startingPlayer = Players.FirstOrDefault(p =>
                    p.Board.FloorLine.Any(t => t.HasTile && t.Type == TileType.StartingTile));

                if (playerHasStartingTile != null)
                {


                    _playerToPlayId = playerHasStartingTile.Id;


                }
                else
                {
                    var nextPlayer = Players.First(p => p.Id != _playerToPlayId);

                    var playersList = Players.ToList();
                    int currentIndex = playersList.FindIndex(p => p.Id == playerId);
                    int nextIndex = (currentIndex + 1) % playersList.Count;
                    IPlayer player1 = playersList[nextIndex];
                    _playerToPlayId = player1.Id;
                    if (player1 is ComputerPlayer computer)
                    {
                        computer.PlayTurn(this);
                    }
                }


                _roundNumber++;
                TileFactory.TableCenter.AddStartingTile();
            }
            else
            {
                var nextPlayer = Players.First(p => p.Id != _playerToPlayId);

                var playersList = Players.ToList();
                int currentIndex = playersList.FindIndex(p => p.Id == playerId);
                int nextIndex = (currentIndex + 1) % playersList.Count;
                IPlayer player1 = playersList[nextIndex];
                _playerToPlayId = player1.Id;
                if (player1 is ComputerPlayer computer)
                {
                    computer.PlayTurn(this);
                }
            }
            
            
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to place tiles on floor line: {ex.Message}", ex);
        }
    }

    public void PlaceTilesOnPatternLine(Guid playerId, int patternLineIndex)
    {
        // Validate it's the player's turn
        if (PlayerToPlayId != playerId)
            throw new InvalidOperationException("It's not this player's turn.");

        // Get the player
        IPlayer player = Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
            throw new InvalidOperationException($"Player with ID {playerId} does not exist.");

        // Check if player has tiles to place
        if (player.TilesToPlace.Count == 0)
            throw new InvalidOperationException("Player has no tiles to place.");

        // Validate pattern line index
        if (patternLineIndex < 0 || patternLineIndex > 4)
            throw new ArgumentOutOfRangeException(nameof(patternLineIndex), "Pattern line index must be between 0 and 4");

        TileType? tileType = null;
        foreach (var tile in player.TilesToPlace)
        {
            if (tile != TileType.StartingTile)
            {
                if (tileType == null)
                {
                    tileType = tile;
                }
                else if (tile != tileType.Value)
                {
                    throw new InvalidOperationException("All non-starting tiles must be of the same type.");
                }
            }
        }
        // Get the tile type (all tiles should be same type)
        

        // Get the player's board
        if (player.Board == null)
            throw new InvalidOperationException("Player has no board initialized.");

        try
        {
            bool tookStartingTile = player.TilesToPlace.Contains(TileType.StartingTile);
            var playerHasStartingTile = Players.FirstOrDefault(p => p.HasStartingTile == true);

            // Plaats tegels
            
            player.Board.AddTilesToPatternLine(player.TilesToPlace, patternLineIndex, TileFactory);
            player.TilesToPlace.Clear();



            // Verwerk wall tiling en scores
            

            // Bepaal of nieuwe ronde moet starten
            bool shouldStartNewRound = TileFactory.IsEmpty && TileFactory.TableCenter.IsEmpty;

            if (shouldStartNewRound)
            {
                
                foreach (IPlayer p in Players)
                {
                    p.Board.DoWallTiling(TileFactory);
                    p.Board.CalculateFinalBonusScores();

                    if (p.Board.HasCompletedHorizontalLine)
                    {
                        _hasEnded = true;
                    }
                }
                
                
                TileFactory.FillDisplays();
                

                // Reset starting tile status
                foreach (var p in Players)
                {
                    p.HasStartingTile = false;
                }

                // Zoek speler met starting tile op floor line
                var startingPlayer = Players.FirstOrDefault(p =>
                    p.Board.FloorLine.Any(t => t.HasTile && t.Type == TileType.StartingTile));

                if (playerHasStartingTile != null )
                {
                    

                    _playerToPlayId = playerHasStartingTile.Id;
                    
                    
                } else
                {
                    var nextPlayer = Players.First(p => p.Id != _playerToPlayId);

                    var playersList = Players.ToList();
                    int currentIndex = playersList.FindIndex(p => p.Id == playerId);
                    int nextIndex = (currentIndex + 1) % playersList.Count;
                    IPlayer player1 = playersList[nextIndex];
                    _playerToPlayId = player1.Id;
                    if (player1 is ComputerPlayer computer)
                    {
                        computer.PlayTurn(this);
                    }
                }

                
                    _roundNumber++;
                TileFactory.TableCenter.AddStartingTile();
            }
            else
            {
                var nextPlayer = Players.First(p => p.Id != _playerToPlayId);

                var playersList = Players.ToList();
                int currentIndex = playersList.FindIndex(p => p.Id == playerId);
                int nextIndex = (currentIndex + 1) % playersList.Count;
                IPlayer player1 = playersList[nextIndex];
                _playerToPlayId = player1.Id;
                if(player1 is ComputerPlayer computer)
{
                    computer.PlayTurn(this);
                }
            }

            // BEURTWISSELING LOGICA
            //if (!shouldStartNewRound)
            //{

                

            //    var playersList = Players.ToList();
            //    int currentIndex = playersList.FindIndex(p => p.Id == playerId);
            //    int nextIndex = (currentIndex + 1) % playersList.Count;
            //    _playerToPlayId = playersList[nextIndex].Id;


            //}
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to place tiles: {ex.Message}", ex);
        }
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