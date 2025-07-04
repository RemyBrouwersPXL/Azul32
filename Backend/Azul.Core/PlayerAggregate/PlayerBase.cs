﻿using System.Drawing;
using Azul.Core.BoardAggregate;
using Azul.Core.BoardAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;
using Azul.Core.UserAggregate;

namespace Azul.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class PlayerBase : IPlayer
{
   

    internal PlayerBase(Guid id, string name, DateOnly? lastVisitToPortugal, UserStats stats)
    {
        Id = id;
        Name = name;
        LastVisitToPortugal = lastVisitToPortugal;
        Board = new Board();
        HasStartingTile = false;
        TilesToPlace = new List<TileType>();
        Stats = stats;
    }

    public Guid Id { get; }

    public string Name { get; }

    public DateOnly? LastVisitToPortugal { get; }

    public IBoard Board { get; }

    public bool HasStartingTile { get; set; } //{ get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public List<TileType> TilesToPlace { get; }

    public UserStats Stats { get; } //{ get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

   
}