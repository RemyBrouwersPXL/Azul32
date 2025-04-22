using System.Security.Cryptography;
using Azul.Core.TableAggregate.Contracts;
using Azul.Core.UserAggregate;

namespace Azul.Core.TableAggregate;

/// <inheritdoc cref="ITableFactory"/>
internal class TableFactory : ITableFactory
{
    public ITable CreateNewForUser(User user, ITablePreferences preferences)
    {
        Guid tableId = Guid.NewGuid();
        ITable table = new Table(tableId, preferences);
        table.Join(user);
        return table;

    }
}