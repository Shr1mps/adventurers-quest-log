import { jest } from '@jest/globals';

export const QuestDB = {
  getQuest: jest.fn(),
  hooks: {}
};
export const Socket = {
  refreshQuestPreview: jest.fn()
};
export const Utils = {
  uuidv4: () => 'uuidv4',
  isTrustedPlayerEdit: () => false
};
export const FVTTCompat = {
  tokenImg: jest.fn(),
  journalImage: jest.fn(),
  ownership: jest.fn()
};
export const ViewManager = {
  verifyQuestCanAdd: jest.fn(),
  questAdded: jest.fn()
};
export const FoundryUIManager = {};
