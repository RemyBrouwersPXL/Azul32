using System.Collections.Generic;
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

    public IReadOnlyList<IPlayer> SeatedPlayers => _seatedPlayers.AsReadOnly();

    public bool HasAvailableSeat => true ;

    public Guid GameId
    {
        get => _gameId;
        set => _gameId = value;
    }

    public void FillWithArtificialPlayers(IGamePlayStrategy gamePlayStrategy)
    {
        throw new NotImplementedException();
    }

    public void Join(User user)
    {
        IPlayer player = new(user.Id, user.UserName, user.LastVisitToPortugal);
        _seatedPlayers.Add(player);
    }

    public void Leave(Guid userId)
    {
        throw new NotImplementedException();
    }
}