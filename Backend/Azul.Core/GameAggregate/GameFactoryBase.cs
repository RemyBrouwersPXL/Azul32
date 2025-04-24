using Azul.Core.GameAggregate.Contracts;
using Azul.Core.TableAggregate.Contracts;

namespace Azul.Core.GameAggregate
{
    internal abstract class GameFactoryBase
    {
        public abstract IGame CreateNewForTable(ITable table);
    }
}