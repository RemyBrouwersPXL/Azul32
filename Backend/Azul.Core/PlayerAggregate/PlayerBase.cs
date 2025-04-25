using System.Drawing;
using Azul.Core.BoardAggregate;
using Azul.Core.BoardAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class PlayerBase : IPlayer
{
    internal PlayerBase(Guid id, string name, DateOnly? lastVisitToPortugal)
    {
        Id = id;
        Name = name;
        LastVisitToPortugal = lastVisitToPortugal;
    }

    public Guid Id { get; }

    public string Name { get; }

    public DateOnly? LastVisitToPortugal { get; }

    public IBoard Board { get; } //=> throw new NotImplementedException();

    public bool HasStartingTile { get; set; } //{ get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public List<TileType> TilesToPlace { get; } //=> throw new NotImplementedException();
}