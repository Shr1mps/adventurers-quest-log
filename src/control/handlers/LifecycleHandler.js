import {
   FoundryUIManager,
   ModuleSettings,
   QuestDB,
   Socket,
   ViewManager,
   Utils }              from '../index.js';

import { QuestAPI }     from '../public/index.js';

import { Quest }        from '../../model/index.js';

import { QuestPreview } from '../../view/index.js';

import { DBMigration }  from '../../database/DBMigration.js';

import {
   constants,
   sessionConstants,
   settings }           from '../../model/constants.js';

export class LifecycleHandler
{
   /**
    * Provides AQL initialization during the `init` Foundry lifecycle hook.
    */
   static foundryInit()
   {
      // Set the sheet to render quests.
      Quest.setSheet(QuestPreview);

      // Register AQL module settings.
      ModuleSettings.register();

      // Preload Handlebars templates and register helpers.
      Utils.preloadTemplates();
      Utils.registerHandlebarsHelpers();
   }

   /**
    * Provides the remainder of AQL initialization during the `ready` Foundry lifecycle hook.
    *
    * @returns {Promise<void>}
    */
   static async foundryReady()
   {
      // Initialize all main GUI views.
      ViewManager.init();

      // Only attempt to run DB migration for GM.
      if (game.user.isGM) { await DBMigration.migrate(); }

      // Initialize the in-memory QuestDB. Loads all quests that the user can see at this point.
      await QuestDB.init();

      // Allow and process incoming socket data.
      Socket.listen();

      // Start watching sidebar updates.
      FoundryUIManager.init();

      // Need to track any current primary quest as Foundry settings don't provide a old / new state on setting
      // change. The current primary quest state is saved in session storage.
      sessionStorage.setItem(sessionConstants.currentPrimaryQuest,
       game.settings.get(constants.moduleName, settings.primaryQuest));

      // Must set initial session storage state for quest tracker background if it doesn't exist.
      const showBackgroundState = sessionStorage.getItem(sessionConstants.trackerShowBackground);
      if (showBackgroundState !== 'true' && showBackgroundState !== 'false')
      {
         sessionStorage.setItem(sessionConstants.trackerShowBackground, 'true');
      }

      // Initialize current client based macro images based on current state.
      await Utils.setMacroImage([settings.questTrackerEnable, settings.questTrackerResizable]);

      // Show quest tracker if applicable.
      ViewManager.renderOrCloseQuestTracker();

      // Fire our own lifecycle event to inform any other modules that depend on AQL QuestDB.
      Hooks.callAll('AdventurersQuestLog.Lifecycle.ready');
   }

   /**
    * Provides the setup AQL initialization during the `setup` Foundry lifecycle hook. Make the public QuestAPI
    * accessible from `game.modules('adventurers-quest-log').public.QuestAPI`.
    */
   static foundrySetup()
   {
      const moduleData = Utils.getModuleData();

      /**
       * @type {AQLPublicAPI}
       */
      moduleData.public = {
         QuestAPI
      };

      // Freeze the public API so it can't be modified.
      Object.freeze(moduleData.public);
   }

   /**
    * Provides a GM only hook to manually run DB Migration.
    *
    * @param {number}   [schemaVersion] - A valid schema version from 0 to {@link DBMigration.version}
    *
    * @returns {Promise<void>}
    */
   static async runDBMigration(schemaVersion = void 0)
   {
      // Only GMs can run the migration.
      if (!game.user.isGM) { return; }

      await DBMigration.migrate(schemaVersion);
   }
}
