/**
 * Provides a single dialog for confirming quest, task, & reward deletion.
 *
 * Note: You have been warned. This is tricky code. Please understand it before modifying. Feel free to ask questions:
 *
 * There presently is no modal dialog in Foundry and this dialog implementation repurposes a single dialog instance
 * through potentially multiple cycles of obtaining and resolving Promises storing the resolve function in the dialog
 * itself. There are four locations in the codebase where a delete confirmation dialog is invoked and awaited upon. Each
 * time one of the static methods below is invoked the previous the current promise resolves with undefined / void 0
 * and then the same dialog instance is reconfigured with new information about a successive delete confirmation
 * operation and brings the dialog to front and renders again. This provides reasonable semi-modal behavior from just a
 * single dialog instance shared across confirmation to delete quests, tasks, and rewards.
 */
export class AQLDialog
{
   /**
    * @private
    */
   constructor()
   {
      throw new Error('This is a static class that should not be instantiated.');
   }


   /**
    * Stores any open AQLDialogImpl.
    *
    * @type {AQLDialogImpl}
    */
   static #deleteDialog = void 0;

   /**
    * Closes any open AQLDialogImpl that is associated with the questId or quest log. AQLDialogImpl gets associated
    * with the last app that invoked the dialog.
    *
    * @param {object}   [options] - Optional parameters.
    *
    * @param {string}   [options.questId] - The quest ID associated with a QuestPreview app.
    *
    * @param {boolean}  [options.isQuestLog] - Is the quest log closing.
    */
   static closeDialogs({ questId, isQuestLog = false } = {})
   {
      if (this.#deleteDialog && (this.#deleteDialog.aqlQuestId === questId ||
       this.#deleteDialog.aqlIsQuestLog === isQuestLog))
      {
         this.#deleteDialog.close();
         this.#deleteDialog = void 0;
      }
   }

   /**
    * Show a dialog to confirm quest deletion.
    *
    * @param {options} options - Optional parameters.
    *
    * @param {string} options.name - The name for the reward to delete.
    *
    * @param {string} options.result - The UUID of the reward to delete.
    *
    * @param {string|void} options.questId - The questId to track to auto-close the dialog when the QuestPreview closes.
    *
    * @returns {Promise<string|void>} Result of the delete confirmation dialog.
    */
   static async confirmDeleteQuest({ name, result, questId, isQuestLog = false })
   {
      if (this.#deleteDialog && this.#deleteDialog.rendered)
      {
         return this.#deleteDialog.updateAQLData({
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('AdventurersQuestLog.Labels.Quest'),
            body: 'AdventurersQuestLog.DeleteDialog.BodyQuest'
         });
      }

      this.#deleteDialog = void 0;

      return new Promise((resolve) =>
      {
         this.#deleteDialog = new AQLDialogImpl({
            resolve,
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('AdventurersQuestLog.Labels.Quest'),
            body: 'AdventurersQuestLog.DeleteDialog.BodyQuest'
         });

         this.#deleteDialog.render(true);
      });
   }

   /**
    * Show a dialog to confirm reward deletion.
    *
    * @param {options} options - Optional parameters.
    *
    * @param {string} options.name - The name for the reward to delete.
    *
    * @param {string} options.result - The UUID of the reward to delete.
    *
    * @param {string|void} options.questId - The questId to track to auto-close the dialog when the QuestPreview closes.
    *
    * @returns {Promise<string|void>} Result of the delete confirmation dialog.
    */
   static async confirmDeleteReward({ name, result, questId, isQuestLog = false })
   {
      if (this.#deleteDialog && this.#deleteDialog.rendered)
      {
         return this.#deleteDialog.updateAQLData({
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('AdventurersQuestLog.QuestPreview.Labels.Reward'),
            body: 'AdventurersQuestLog.DeleteDialog.BodyReward'
         });
      }

      this.#deleteDialog = void 0;

      return new Promise((resolve) =>
      {
         this.#deleteDialog = new AQLDialogImpl({
            resolve,
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('AdventurersQuestLog.QuestPreview.Labels.Reward'),
            body: 'AdventurersQuestLog.DeleteDialog.BodyReward'
         });

         this.#deleteDialog.render(true);
      });
   }

   /**
    * Show a dialog to confirm task deletion.
    *
    * @param {options} options - Optional parameters.
    *
    * @param {string} options.name - The name for the task to delete.
    *
    * @param {string} options.result - The UUIDv4 of the task to delete.
    *
    * @param {string|void} options.questId - The questId to track to auto-close the dialog when the QuestPreview closes.
    *
    * @returns {Promise<string|void>} Result of the delete confirmation dialog.
    */
   static async confirmDeleteTask({ name, result, questId, isQuestLog = false })
   {
      if (this.#deleteDialog && this.#deleteDialog.rendered)
      {
         return this.#deleteDialog.updateAQLData({
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('AdventurersQuestLog.QuestPreview.Labels.Objective'),
            body: 'AdventurersQuestLog.DeleteDialog.BodyObjective'
         });
      }

      this.#deleteDialog = void 0;

      return new Promise((resolve) =>
      {
         this.#deleteDialog = new AQLDialogImpl({
            resolve,
            name,
            result,
            questId,
            isQuestLog,
            title: game.i18n.localize('AdventurersQuestLog.QuestPreview.Labels.Objective'),
            body: 'AdventurersQuestLog.DeleteDialog.BodyObjective'
         });

         this.#deleteDialog.render(true);
      });
   }
}

/**
 * Provides the AQL dialog implementation.
 */
class AQLDialogImpl extends foundry.appv1.api.Dialog
{
   /**
    * Stores the options specific to the dialog
    *
    * @type {AQLDialogOptions}
    */
   #aqlOptions;

   /**
    * @param {AQLDialogOptions} options AQLDialogImpl Options
    */
   constructor(options)
   {
      super(void 0, { minimizable: false, height: 'auto' });

      this.#aqlOptions = options;

      /**
       * The Dialog options to set.
       *
       * @type {object}
       * @see https://foundryvtt.com/api/classes/client.Dialog.html
       */
      this.data = {
         title: game.i18n.format('AdventurersQuestLog.DeleteDialog.TitleDel', this.#aqlOptions),
         content: `<h3>${game.i18n.format('AdventurersQuestLog.DeleteDialog.HeaderDel', this.#aqlOptions)}</h3>` +
          `<p>${game.i18n.localize(this.#aqlOptions.body)}</p>`,
         buttons: {
            yes: {
               icon: '<i class="fas fa-trash"></i>',
               label: game.i18n.localize('AdventurersQuestLog.DeleteDialog.Delete'),
               callback: () => this.#aqlOptions.resolve(this.#aqlOptions.result)
            },
            no: {
               icon: '<i class="fas fa-times"></i>',
               label: game.i18n.localize('AdventurersQuestLog.DeleteDialog.Cancel'),
               callback: () => this.#aqlOptions.resolve(void 0)
            }
         }
      };
   }

   /**
    * Overrides the close action to resolve the cached Promise with undefined.
    *
    * @returns {Promise<void>}
    */
   async close()
   {
      this.#aqlOptions.resolve(void 0);
      return super.close();
   }

   /**
    * @returns {boolean} Returns {@link AQLDialogOptions.isQuestLog} from options.
    */
   get aqlIsQuestLog() { return this.#aqlOptions.isQuestLog; }

   /**
    * @returns {string} Returns {@link AQLDialogOptions.questId} from options.
    */
   get aqlQuestId() { return this.#aqlOptions.questId; }

   /**
    * Updates the AQLDialogOptions when a dialog is already showing and a successive delete operation is initiated.
    *
    * Resolves the currently cached Promise with undefined and cache a new Promise which is returned.
    *
    * @param {AQLDialogOptions} options - The new options to set for Dialog rendering and success return value.
    *
    * @returns {Promise<unknown>} The new Promise to await upon.
    */
   updateAQLData(options)
   {
      // Resolve old promise with undefined
      this.#aqlOptions.resolve(void 0);

      // Set new options
      this.#aqlOptions = options;

      // Create a new Promise that will store the resolve function in this AQLDialogImpl.
      const promise = new Promise((resolve) => { this.#aqlOptions.resolve = resolve; });

      // Update title and content with new data.
      this.data.title = game.i18n.format('AdventurersQuestLog.DeleteDialog.TitleDel', this.#aqlOptions);
      this.data.content = `<h3>${game.i18n.format('AdventurersQuestLog.DeleteDialog.HeaderDel', this.#aqlOptions)}</h3>` +
       `<p>${game.i18n.localize(this.#aqlOptions.body)}</p>`;

      // Bring the dialog to top and render again.
      this.bringToTop();
      this.render(true);

      // Return the new promise which is resolved from another update with undefined or the dialog confirmation action,
      // or the dialog being closed.
      return promise;
   }
}

/**
 * @typedef AQLDialogOptions
 *
 * @property {Function} [resolve] - The cached resolve function of the Dialog promise.
 *
 * @property {string}   name - The name of the data being deleted.
 *
 * @property {result}   result - The result to resolve when `OK` is pressed.
 *
 * @property {string}   questId - The associated QuestPreview by quest ID.
 *
 * @property {boolean}  isQuestLog - boolean indicating that the QuestLog owns the dialog.
 *
 * @property {string}   title - The title of the dialog.
 *
 * @property {string}   body - The body language file ID to use for dialog rendering.
 */
