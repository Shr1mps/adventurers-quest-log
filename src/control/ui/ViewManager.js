import { QuestDB }         from '../index.js';

import {
   QuestLog,
   QuestPreview,
   QuestTracker }          from '../../view/index.js';

import { UINotifications } from './UINotifications.js';

import {
   constants,
   questStatus,
   questStatusI18n,
   settings }              from '../../model/constants.js';

/**
 * Stores and manages all the GUI apps / view for AQL.
 */
export class ViewManager
{
   /**
    * Locally stores the app instances which are accessible by getter methods.
    *
    * @type {{questLog: QuestLog, questPreview: Map<string, QuestPreview>, questTracker: QuestTracker}}
    *
    * @see ViewManager.questLog
    * @see ViewManager.questPreview
    * @see ViewManager.questTracker
    */
   static #Apps = {
      questLog: void 0,
      questTracker: void 0,
      questPreview: new Map()
   };

   /**
    * Stores the QuestPreview app that is the current newly added quest. It needs to be closed before more quests can be
    * added as a gate to prevent many quests from being added rapidly.
    *
    * @type {QuestPreview}
    */
   static #newQuestPreviewApp = void 0;

   /**
    * Stores the UINotifications instance to return in {@link ViewManager.notifications}.
    *
    * @type {UINotifications}
    */
   static #uiNotifications = new UINotifications();

   /**
    * Initializes all GUI apps.
    */
   static init()
   {
      this.#Apps.questLog = new QuestLog();
      this.#Apps.questTracker = new QuestTracker();

      // Load and set the quest tracker position from settings.
      try
      {
         const position = JSON.parse(game.settings.get(constants.moduleName, settings.questTrackerPosition));
         if (position && position.width && position.height)
         {
            this.#Apps.questTracker.position = position;
         }
      }
      catch (err) { /**/ }

      ViewManager.renderOrCloseQuestTracker();

      // Whenever a QuestPreview closes and matches any tracked app that is adding a new quest set it to undefined.
      Hooks.on('closeQuestPreview', this.#handleQuestPreviewClosed.bind(this));
      Hooks.on('renderQuestPreview', this.#handleQuestPreviewRender.bind(this));

      // Right now ViewManager responds to permission changes across add, remove, update of quests.
      Hooks.on(QuestDB.hooks.addQuestEntry, this.#handleQuestEntryAdd.bind(this));
      Hooks.on(QuestDB.hooks.removeQuestEntry, this.#handleQuestEntryRemove.bind(this));
      Hooks.on(QuestDB.hooks.updateQuestEntry, this.#handleQuestEntryUpdate.bind(this));
   }

   /**
    * @returns {UINotifications} Returns the UINotifications helper.
    */
   static get notifications() { return this.#uiNotifications; }

   /**
    * @returns {QuestLog} The main quest log app accessible from the left hand menu bar or
    *                     `Hook.call('AdventurersQuestLog.Open.QuestLog')`.
    *
    * @see AQLHooks.openQuestLog
    */
   static get questLog() { return this.#Apps.questLog; }

   /**
    * @returns {Map<string, QuestPreview>} A Map that contains all currently rendered / visible QuestPreview instances
    *                                      indexed by questId / string which is the Foundry 'id' of quests and the
    *                                      backing journal entries.
    */
   static get questPreview() { return this.#Apps.questPreview; }

   /**
    * @returns {QuestTracker} Returns the quest tracker overlap app. This app is accessible when module setting
    *                         {@link AQLSettings.questTrackerEnable} is enabled.
    */
   static get questTracker() { return this.#Apps.questTracker; }

   /**
    * @param {object}   opts - Optional parameters
    *
    * @param {boolean}  [opts.questPreview=false] - If true closes all QuestPreview apps.
    *
   /**
    * The first half of the add quest action which verifies if there is a current "add" QuestPreview open. If so it
    * will bring the current add QuestPreview app to front, post a UI notification and return false. Otherwise returns
    * true indicating that a new quest can be added / created.
    *
    * @returns {boolean} Whether a new quest can be added.
    */
   static verifyQuestCanAdd()
   {
      if (this.#newQuestPreviewApp !== void 0)
      {
         if (this.#newQuestPreviewApp.rendered)
         {
            this.#newQuestPreviewApp.bringToTop();
            ViewManager.notifications.warn(game.i18n.localize('AdventurersQuestLog.Notifications.FinishQuestAdded'));
            return false;
         }
         else
         {
            this.#newQuestPreviewApp = void 0;
         }
      }

      return true;
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Handles the `addQuestEntry` hook.
    *
    * @param {QuestEntry}  questEntry - The added QuestEntry.
    *
    * @param {object}      flags - Quest flags.
    *
    * @returns {Promise<void>}
    */
   static async #handleQuestEntryAdd(questEntry, flags)
   {
      if ('ownership' in flags)
      {
         ViewManager.refreshQuestPreview(questEntry.questIds);
         ViewManager.renderAll();
      }
   }

   /**
    * Handles the `removeQuestEntry` hook.
    *
    * @param {QuestEntry}  questEntry - The added QuestEntry.
    *
    * @param {object}      flags - Quest flags.
    *
    * @returns {Promise<void>}
    */
   static async #handleQuestEntryRemove(questEntry, flags)
   {
      const quest = questEntry.quest;

      const questPreview = ViewManager.questPreview.get(quest.id);
      if (questPreview && questPreview.rendered) { await questPreview.close({ noSave: true }); }

      if ('ownership' in flags)
      {
         ViewManager.refreshQuestPreview(questEntry.questIds);
         ViewManager.renderAll();
      }
   }

   /**
    * Handles the `updateQuestEntry` hook.
    *
    * @param {QuestEntry}  questEntry - The added QuestEntry.
    *
    * @param {object}      flags - Quest flags.
    */
   static #handleQuestEntryUpdate(questEntry, flags)
   {
      if ('ownership' in flags)
      {
         ViewManager.refreshQuestPreview(questEntry.questIds);
         ViewManager.renderAll();
      }
   }

   /**
    * Handles the `closeQuestPreview` hook. Removes the QuestPreview from tracking and removes any current set
    * `#newQuestPreviewApp` state if QuestPreview matches.
    *
    * @param {QuestPreview}   questPreview - The closed QuestPreview.
    */
   static #handleQuestPreviewClosed(questPreview)
   {
      if (!(questPreview instanceof QuestPreview)) { return; }

      if (this.#newQuestPreviewApp === questPreview) { this.#newQuestPreviewApp = void 0; }

      const quest = questPreview.quest;
      if (quest !== void 0) { this.questPreview.delete(quest.id); }
   }

   /**
    * Handles the `renderQuestPreview` hook; adding the quest preview to tracking.
    *
    * @param {QuestPreview}   questPreview - The rendered QuestPreview.
    */
   static #handleQuestPreviewRender(questPreview)
   {
      if (questPreview instanceof QuestPreview)
      {
         const quest = questPreview.quest;
         if (quest !== void 0) { ViewManager.questPreview.set(quest.id, questPreview); }
      }
   }
}

/**
 * @typedef {object} RenderOptions Additional rendering options which are applied to customize the way that the
 * Application is rendered in the DOM.
 *
 * @property {number}   [left] - The left positioning attribute.
 *
 * @property {number}   [top] - The top positioning attribute.
 *
 * @property {number}   [width] - The rendered width.
 *
 * @property {number}   [height] - The rendered height.
 *
 * @property {number}   [scale] - The rendered transformation scale.
 *
 * @property {boolean}  [focus=false] - Apply focus to the application, maximizing it and bringing it to the top
 *                                      of the vertical stack.
 *
 * @property {string}   [renderContext] - A context-providing string which suggests what event triggered the render.
 *
 * @property {object}   [renderData] - The data change which motivated the render request.
 */