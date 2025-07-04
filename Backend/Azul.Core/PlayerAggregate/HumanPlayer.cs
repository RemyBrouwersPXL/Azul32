﻿using System.Drawing;
using Azul.Core.BoardAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TileFactoryAggregate.Contracts;
using Azul.Core.UserAggregate;

namespace Azul.Core.PlayerAggregate;

/// <inheritdoc cref="IPlayer"/>
internal class HumanPlayer : PlayerBase
{
    internal HumanPlayer(Guid userId, string name, DateOnly? lastVisitToPortugal, UserStats stats)
        : base(userId, name, lastVisitToPortugal, stats) 
    {
    }
}
