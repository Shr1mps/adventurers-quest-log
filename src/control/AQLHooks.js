import {
   LifecycleHandler,
   DropHandler,
   UIHandler }          from './handlers/index.js';

/**
 * Provides implementations for all Foundry hooks that AQL responds to and registers under.
 *
 * Foundry lifecycle:
 * - `init` - {@link LifecycleHandler.foundryInit}
 * - `ready` - {@link LifecycleHandler.foundryReady}
 * - `setup` - {@link LifecycleHandler.foundrySetup}
 *
 * Foundry game hooks:
 * - `dropActorSheetData` - {@link DropHandler.dropActorSheetData}
 * - `dropCanvasData` - {@link DropHandler.dropCanvasData}
 * - `getSceneControlButtons` - {@link UIHandler.getSceneControlButtons}
 * - `hotbarDrop` - {@link DropHandler.hotbarDrop}
 * - `renderJournalDirectory` - {@link UIHandler.renderJournalDirectory}
 * - `renderJournalSheet` - {@link UIHandler.renderJournalSheet}
 */
export default class AQLHooks
{
   /**
    * @private
    */
   constructor()
   {
      throw new Error('This is a static class that should not be instantiated');
   }

   /**
    * Initializes all hooks that AQL responds to in the Foundry lifecycle and in game hooks.
    */
   static init()
   {
      // Foundry startup hooks.
      Hooks.once('init', LifecycleHandler.foundryInit);
      Hooks.once('ready', LifecycleHandler.foundryReady);
      Hooks.once('setup', LifecycleHandler.foundrySetup);

      // Respond to Foundry in game hooks.
      Hooks.on('dropActorSheetData', DropHandler.dropActorSheetData);
      Hooks.on('dropCanvasData', DropHandler.dropCanvasData);
      Hooks.on('getSceneControlButtons', UIHandler.getSceneControlButtons);
      Hooks.on('hotbarDrop', DropHandler.hotbarDrop);
      Hooks.on('renderJournalDirectory', UIHandler.renderJournalDirectory);
      Hooks.on('renderJournalSheet', UIHandler.renderJournalSheet);

      // AQL specific hooks.
      Hooks.on('AdventurersQuestLog.Open.QuestLog', UIHandler.openQuestLog);
      Hooks.on('AdventurersQuestLog.Open.QuestTracker', UIHandler.openQuestTracker);
      Hooks.on('AdventurersQuestLog.Run.DBMigration', LifecycleHandler.runDBMigration);
   }
}
