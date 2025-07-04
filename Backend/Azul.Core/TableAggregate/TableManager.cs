﻿using Azul.Core.GameAggregate.Contracts;
using Azul.Core.PlayerAggregate;
using Azul.Core.PlayerAggregate.Contracts;
using Azul.Core.TableAggregate.Contracts;
using Azul.Core.UserAggregate;

namespace Azul.Core.TableAggregate;

/// <inheritdoc cref="ITableManager"/>
internal class TableManager : ITableManager
{
    private readonly ITableRepository _tableRepository;
    private readonly ITableFactory _tableFactory;
    private readonly IGameRepository _gameRepository;
    private readonly IGameFactory _gameFactory;
    private readonly IGamePlayStrategy _gamePlayStrategy;

    public TableManager(
        ITableRepository tableRepository,
        ITableFactory tableFactory,
        IGameRepository gameRepository,
        IGameFactory gameFactory,
        IGamePlayStrategy gamePlayStrategy)
    {
        _tableRepository = tableRepository;
        _tableFactory = tableFactory;
        _gameRepository = gameRepository;
        _gameFactory = gameFactory;
        _gamePlayStrategy = gamePlayStrategy;
    }

    public ITable JoinOrCreateTable(User user, ITablePreferences preferences)
    {
        var listTables = _tableRepository.FindTablesWithAvailableSeats(preferences);
        if (listTables.Count == 0)
        {
            var newTable = _tableFactory.CreateNewForUser(user, preferences);
            _tableRepository.Add(newTable);
            if (newTable.Preferences.NumberOfArtificialPlayers > 0)
            {
                FillWithArtificialPlayers(newTable.Id, user);
            }
            return newTable;
        }
        else 
        {
            ITable table = listTables[0];
            table.Join(user);
            
            
            return table;
        }
        
        
    }

    public void LeaveTable(Guid tableId, User user)
    {
        ITable table = _tableRepository.Get(tableId);
        if (table.SeatedPlayers.Count > 1)
        {
            table.Leave(user.Id);
            
        }
        else
        {
            table.Leave(user.Id);
            _tableRepository.Remove(tableId);
        }
        
    }


    public IGame StartGameForTable(Guid tableId)
    {
        ITable table = _tableRepository.Get(tableId);
        if (table.HasAvailableSeat)
        {
            table.GameId = Guid.Empty;
            throw new InvalidOperationException("not enough");
        }
        else
        {
            IGame game = _gameFactory.CreateNewForTable(table);
            _gameRepository.Add(game);
            table.GameId = game.Id;
            return game;
        }
    }

    public void FillWithArtificialPlayers(Guid tableId, User user)
    {
        ITable table = _tableRepository.Get(tableId);

        if (!table.HasAvailableSeat)
        {
            throw new InvalidOperationException("Table is already full");
        }

        // Verify the requesting user is at the table
        if (!table.SeatedPlayers.Any(p => p.Id == user.Id))
        {
            throw new InvalidOperationException("User is not seated at this table");
        }
        var stratagy = new GamePlayStrategy(AIDifficulty.Hard, AIPlayStyle.Offensive);
        // Fill remaining seats with AI players
        table.FillWithArtificialPlayers(stratagy);

        
    }
}