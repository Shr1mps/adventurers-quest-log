import { QuestLog } from '../../src/view/log/QuestLog.js';
import { QuestDB, Socket, ViewManager } from '../mocks/control/index.js';
import { AQLDialog } from '../mocks/view/internal/index.js';
import { jest } from '@jest/globals';

describe('QuestLog', () => {
  let questLog;
  let mockQuests;

  beforeEach(() => {
    questLog = new QuestLog();
    mockQuests = {
      active: [
        { name: 'Alpha Quest', priority: 1, date: { create: 100 } },
        { name: 'Beta Quest', priority: 2, date: { create: 200 } },
        { name: 'Charlie Quest', priority: 0, date: { create: 50 } }
      ],
      completed: []
    };
  });

  test('should filter quests by search query', () => {
    questLog.searchQuery = 'Alpha';
    const result = questLog._filterAndSortQuests(mockQuests);
    expect(result.active.length).toBe(1);
    expect(result.active[0].name).toBe('Alpha Quest');
  });

  test('should sort quests by priority', () => {
    questLog.sortKey = 'priority';
    const result = questLog._filterAndSortQuests(mockQuests);
    expect(result.active[0].name).toBe('Beta Quest'); // Priority 2
    expect(result.active[1].name).toBe('Alpha Quest'); // Priority 1
    expect(result.active[2].name).toBe('Charlie Quest'); // Priority 0
  });

  test('should sort quests by date', () => {
    questLog.sortKey = 'date';
    const result = questLog._filterAndSortQuests(mockQuests);
    expect(result.active[0].name).toBe('Beta Quest'); // Date 200
    expect(result.active[1].name).toBe('Alpha Quest'); // Date 100
    expect(result.active[2].name).toBe('Charlie Quest'); // Date 50
  });

  test('should return all quests if query is empty', () => {
    questLog.searchQuery = '';
    const result = questLog._filterAndSortQuests(mockQuests);
    expect(result.active.length).toBe(3);
  });

  test('should create new quest', async () => {
    const mockQuest = { id: 'newQuest' };
    QuestDB.createQuest = jest.fn().mockResolvedValue(mockQuest);
    ViewManager.verifyQuestCanAdd = jest.fn().mockReturnValue(true);
    ViewManager.questAdded = jest.fn();
    
    await QuestLog.onNewQuest({}, {});
    
    expect(QuestDB.createQuest).toHaveBeenCalled();
    expect(ViewManager.questAdded).toHaveBeenCalledWith({ quest: mockQuest });
  });

  test('should delete quest', async () => {
    const target = { dataset: { questId: 'q1', questName: 'Quest 1' } };
    AQLDialog.confirmDeleteQuest = jest.fn().mockResolvedValue('q1');
    QuestDB.deleteQuest = jest.fn();

    await QuestLog.onDeleteQuest({}, target);

    expect(AQLDialog.confirmDeleteQuest).toHaveBeenCalled();
    expect(QuestDB.deleteQuest).toHaveBeenCalledWith({ questId: 'q1' });
  });

  test('should set quest status', async () => {
    const target = { dataset: { questId: 'q1', target: 'completed' } };
    const mockQuest = { id: 'q1' };
    QuestDB.getQuest = jest.fn().mockReturnValue(mockQuest);
    Socket.setQuestStatus = jest.fn();

    await QuestLog.onSetStatus({}, target);

    expect(Socket.setQuestStatus).toHaveBeenCalledWith({ quest: mockQuest, target: 'completed' });
  });
});
