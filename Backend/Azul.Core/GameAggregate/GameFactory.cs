using System.Drawing;
using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TableAggregate;
using Azul.Core.TableAggregate.Contracts;
using Azul.Core.TileFactoryAggregate;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.GameAggregate;

internal class GameFactory : IGameFactory
{
    public IGame CreateNewForTable(ITable table)
    {
        //Guid gameId = Guid.NewGuid();
        throw new NotImplementedException();

    }
}