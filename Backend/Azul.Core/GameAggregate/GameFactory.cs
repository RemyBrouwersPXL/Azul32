using System;
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
        {
            if (table == null)
                throw new ArgumentNullException(nameof(table), "Table cannot be null.");

            if (table.SeatedPlayers.Count == 0)
                throw new InvalidOperationException("Cannot create game for table with no players.");

            // 1. Create and fill tile bag with 20 tiles of each color
            ITileBag tileBag = new TileBag();
            foreach (TileType tileType in Enum.GetValues(typeof(TileType)))
            {
                if (tileType != TileType.StartingTile)
                {
                    tileBag.AddTiles(20, tileType);
                }
            }


            // 2. Create tile factory with displays from table preferences
            int displayCount = table.Preferences.NumberOfFactoryDisplays;
            ITileFactory tileFactory = new TileFactory(displayCount, tileBag);

            // 3. Generate game ID
            Guid Id;
            do
            {
                Id = Guid.NewGuid();
                
                table.GameId = Id;
            } while (Id == Guid.Empty);
            IPlayer[] Players = (IPlayer[])table.SeatedPlayers;
            // 4. Create and return the game
            return new Game(Id, tileFactory, Players);
        }

    }
}