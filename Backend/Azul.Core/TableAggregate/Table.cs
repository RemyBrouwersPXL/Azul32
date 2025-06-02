using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Numerics;
using Azul.Core.PlayerAggregate;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TableAggregate.Contracts;
using Azul.Core.UserAggregate;

namespace Azul.Core.TableAggregate;

/// <inheritdoc cref="ITable"/>
internal class Table : ITable
{
    private readonly List<IPlayer> _seatedPlayers = new List<IPlayer>();
    public Guid _gameId;
    internal Table(Guid id, ITablePreferences preferences)
    {
        Id = id;
        Preferences = preferences;
    }

    public Guid Id { get; }

    public ITablePreferences Preferences { get; }

    public IReadOnlyList<IPlayer> SeatedPlayers => _seatedPlayers;

    public bool HasAvailableSeat =>  (_seatedPlayers.Count) < Preferences.NumberOfPlayers;

    public Guid GameId
    {
        get => _gameId;
        set
        {
            _gameId = value;
        }

    }

    public void FillWithArtificialPlayers(IGamePlayStrategy gamePlayStrategy)
    {
        

        if (HasAvailableSeat == false)
        {
            throw new InvalidOperationException("The table is full");
        }
        for (int i=0; i < Preferences.NumberOfArtificialPlayers; i++)
        {
            IPlayer bot = new ComputerPlayer(gamePlayStrategy);
            _seatedPlayers.Add(bot);
        }
        
        
        
    }

    public void Join(User user)
    {
        // Correcting the instantiation of HumanPlayer to fix the errors
        var player = new HumanPlayer(user.Id, user.UserName, user.LastVisitToPortugal, user.Stats.Wins, user.Stats.Losses);

        // Check if the user is already seated
        if (_seatedPlayers.Any(p => p.Id == user.Id))
        {
            throw new InvalidOperationException("User already seated");
        }

        // Check if the table has available seats
        if (!HasAvailableSeat)
        {
            throw new InvalidOperationException("The table is full");
        }

        // Add the player to the seated players list
        _seatedPlayers.Add(player);
    }

    public void Leave(Guid userId)
    {
        if (!_seatedPlayers.Any(player => player.Id == userId))
        {
            throw new InvalidOperationException("User not seated");
        }
        _seatedPlayers.Remove(_seatedPlayers.First(player => player.Id == userId));
        
    }
}