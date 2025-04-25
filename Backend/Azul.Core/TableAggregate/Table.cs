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
    private Guid _gameId;
    internal Table(Guid id, ITablePreferences preferences)
    {
        Id = id;
        Preferences = preferences;
    }

    public Guid Id { get; }

    public ITablePreferences Preferences { get; }

    public IReadOnlyList<IPlayer> SeatedPlayers => _seatedPlayers;

    public bool HasAvailableSeat =>  _seatedPlayers.Count < Preferences.NumberOfPlayers;

    public Guid GameId
    {
        get => _gameId;
        set => _gameId = Guid.Empty;
    }

    public void FillWithArtificialPlayers(IGamePlayStrategy gamePlayStrategy)
    {
        throw new NotImplementedException();
    }

    public void Join(User user)
    {
        var player = new HumanPlayer(user.Id, user.UserName, user.LastVisitToPortugal);
        if (_seatedPlayers.Any(player => player.Id == user.Id))
        {
            throw new InvalidOperationException("User already seated");
        }

        

        if (HasAvailableSeat == false)
        {
            throw new InvalidOperationException("The table is full");
        }

        _seatedPlayers.Add(player);
        int aantal = _seatedPlayers.Count;
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