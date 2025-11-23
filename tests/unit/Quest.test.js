import { Quest } from '../../src/model/Quest.js';
import { questStatus } from '../../src/model/constants.js';
import { jest } from '@jest/globals';

describe('Quest', () => {
  let quest;
  let mockEntry;

  beforeEach(() => {
    mockEntry = {
      id: 'quest123',
      update: jest.fn(),
      testUserPermission: jest.fn().mockReturnValue(true),
      canUserModify: jest.fn().mockReturnValue(true),
      _sheet: null
    };
    quest = new Quest({}, mockEntry);
  });

  test('should initialize with default values', () => {
    expect(quest.id).toBe('quest123');
    // Verify default status if known, or check what it is initialized to
    // Quest.js initData sets defaults.
  });

  test('should set status', async () => {
    await quest.setStatus(questStatus.completed);
    expect(quest.status).toBe(questStatus.completed);
    expect(mockEntry.update).toHaveBeenCalled();
  });

  test('should add task', () => {
    quest.addTask({ name: 'New Task' });
    expect(quest.tasks.length).toBe(1);
    expect(quest.tasks[0].name).toBe('New Task');
  });

  test('should toggle task state', () => {
    quest.addTask({ name: 'Task 1' });
    const task = quest.tasks[0];
    
    // Initial: incomplete
    expect(task.completed).toBe(false);
    expect(task.failed).toBe(false);

    // Toggle -> completed
    task.toggle();
    expect(task.completed).toBe(true);
    expect(task.failed).toBe(false);

    // Toggle -> failed
    task.toggle();
    expect(task.completed).toBe(false);
    expect(task.failed).toBe(true);

    // Toggle -> incomplete
    task.toggle();
    expect(task.completed).toBe(false);
    expect(task.failed).toBe(false);
  });

  test('should add and remove rewards', () => {
    quest.addReward({ type: 'item', data: { name: 'Sword' } });
    expect(quest.rewards.length).toBe(1);
    const uuid = quest.rewards[0].uuidv4;
    quest.removeReward(uuid);
    expect(quest.rewards.length).toBe(0);
  });

  test('should manage subquests', () => {
    quest.addSubquest('subquest1');
    expect(quest.subquests).toContain('subquest1');
    quest.removeSubquest('subquest1');
    expect(quest.subquests).not.toContain('subquest1');
  });

  test('should serialize to JSON', () => {
    quest.name = 'Serialized Quest';
    const json = quest.toJSON();
    expect(json.name).toBe('Serialized Quest');
    expect(json.status).toBeDefined();
  });

  test('should get giver from UUID', async () => {
    global.fromUuid.mockResolvedValue({ documentName: 'Actor', name: 'Quest Giver', img: 'img.png' });
    const data = await Quest.giverFromUUID('Actor.123');
    expect(data.name).toBe('Quest Giver');
    expect(data.img).toBe('img.png');
  });

  test('should save quest', async () => {
    mockEntry.update.mockResolvedValue(mockEntry);
    await quest.save();
    expect(mockEntry.update).toHaveBeenCalled();
  });

  test('should set status and update dates', async () => {
    mockEntry.update.mockResolvedValue(mockEntry);
    await quest.setStatus(questStatus.completed);
    expect(quest.status).toBe(questStatus.completed);
    expect(quest.date.end).toBeDefined();
    expect(mockEntry.update).toHaveBeenCalled();
  });
});
