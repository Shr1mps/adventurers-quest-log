import { jest } from '@jest/globals';

global.game = {
  i18n: { localize: (key) => key, format: (key, data) => `${key} ${JSON.stringify(data)}` },
  settings: { get: jest.fn(), set: jest.fn() },
  user: { isGM: true, name: 'Gamemaster' },
  users: { activeGM: { name: 'Gamemaster' } }
};
global.Hooks = { on: jest.fn(), callAll: jest.fn() };
global.foundry = {
  utils: { mergeObject: (a, b) => ({...a, ...b}), randomID: () => 'uuidv4' },
  applications: {
    api: {
      ApplicationV2: class {},
      HandlebarsApplicationMixin: (Base) => class extends Base {}
    },
    apps: {
      DocumentOwnershipConfig: class {}
    },
    ux: {
      ContextMenu: class {}
    }
  },
  appv1: {
    api: {
      Dialog: class {}
    }
  }
};
global.fromUuid = jest.fn();
global.Actor = class { static documentName = 'Actor'; };
global.Item = class { static documentName = 'Item'; };
global.JournalEntry = class { static documentName = 'JournalEntry'; };
global.DOMRect = class { constructor(x, y, w, h) { this.x = x; this.y = y; this.width = w; this.height = h; } };

global.CONST = { DOCUMENT_OWNERSHIP_LEVELS: { OBSERVER: 2, OWNER: 3 } };
global.ui = { notifications: { info: jest.fn(), warn: jest.fn() } };
