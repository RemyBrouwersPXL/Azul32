using System.Collections;
using Azul.Core.TileFactoryAggregate.Contracts;

namespace Azul.Core.Tests.Extensions;

public static class RandomExtensions
{
    public static T NextItem<T>(this Random random, IEnumerable<T> enumerable)
    {
        if (enumerable is null)
        {
            throw new ArgumentNullException(nameof(enumerable));
        }
        List<T> list = enumerable.ToList();
        if (!list.Any())
        {
            throw new ArgumentException("The enumerable is empty.", nameof(enumerable));
        }
        int index = random.Next(0, list.Count);
        return list.ElementAt(index);
    }

    public static TileType NextTileType(this Random random)
    {
        return random.NextItem(Enum.GetValues<TileType>().Where(t => t != TileType.StartingTile));
    }
}