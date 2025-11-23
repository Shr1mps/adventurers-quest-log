import {
   FoundryUIManager,
   ViewManager,
   Utils }              from '../index.js';

import {
   constants,
   sessionConstants,
   settings }           from '../../model/constants.js';

export class UIHandler
{
   /**
    * Responds to the in game hook `getSceneControlButtons` to add the AQL quest log and floating quest log to the
    * journal / 'notes' tool as sub categories.
    *
    * @param {SceneControl[]} controls - The scene controls to add AQL controls.
    */
   static getSceneControlButtons(controls)
   {
      if (game.user.isGM || !game.settings.get(constants.moduleName, settings.hideAQLFromPlayers))
      {
         controls.notes.tools = foundry.utils.mergeObject(controls.notes.tools, FoundryUIManager.noteControls);
      }
   }

   /**
    * Opens the QuestLog if the game user is a GM or if AQL isn't hidden to players.
    *
    * @param {object}               [opts] - Optional parameters.
    */
   static openQuestLog(opts)
   {
      if (!game.user.isGM && game.settings.get(constants.moduleName, settings.hideAQLFromPlayers)) { return; }

      let constraints = {};

      let tabId;

      if (typeof opts === 'object')
      {
         // Select only constraint related parameters.
         constraints = (({ left, top, width, height }) => ({ left, top, width, height }))(opts);

         if (typeof opts.tabId === 'string') { tabId = opts.tabId; }
      }

      ViewManager.questLog.render({ force: true, focus: true, ...constraints, tabId });
   }

   /**
    * Opens the {@link QuestTracker} if the game user is a GM or if AQL isn't hidden to players.
    *
    * @param {object}               [opts] - Optional parameters.
    */
   static async openQuestTracker(opts)
   {
      if (!game.user.isGM && game.settings.get(constants.moduleName, settings.hideAQLFromPlayers)) { return; }

      await game.settings.set(constants.moduleName, settings.questTrackerEnable, true);

      if (typeof opts === 'object')
      {
         // Handle setting quest tracker primary change.
         if (typeof opts.primary === 'boolean')
         {
            sessionStorage.setItem(sessionConstants.trackerShowPrimary, (opts.primary).toString());
         }

         // Select only constraint related parameters.
         const constraints = (({ left, top, width, height, pinned }) => ({ left, top, width, height, pinned }))(opts);

         if (Object.keys(constraints).length > 0)
         {
            // Set to indicate an override of any pinned state.
            constraints.override = true;

            const tracker = ViewManager.questTracker;

            // Defer to make sure quest tracker is rendered before setting position.
            setTimeout(() =>
            {
               if (tracker.rendered) { tracker.setPosition(constraints); }
            }, 0);
         }

         // Handle setting quest tracker resizable change.
         if (typeof opts.resizable === 'boolean')
         {
            setTimeout(() =>
            {
               game.settings.set(constants.moduleName, settings.questTrackerResizable, opts.resizable);
            }, 0);
         }
      }
   }

   /**
    * Handles adding the 'open quest log' button at the bottom of the journal directory.
    *
    * @param {JournalDirectory}  app - The JournalDirectory app.
    *
    * @param {HTMLElement}       html - The HTML Element for the window content of the app.
    */
   static renderJournalDirectory(app, html)
   {
      if (game.user.isGM || !game.settings.get(constants.moduleName, settings.hideAQLFromPlayers))
      {
         const button = document.createElement('button');
         button.classList.add("quest-log-btn");
         button.innerText = game.i18n.localize('AdventurersQuestLog.QuestLog.Title');

         let footer = html.querySelector('.directory-footer');
         if (footer.length === 0)
         {
            footer = document.createElement("footer");
            footer.classList.add("directory-footer");
            html.append(footer);
         }
         footer.append(button);

         button.addEventListener("click", () => ViewManager.questLog.render({ force: true }));
      }

      if (!(game.user.isGM && game.settings.get(constants.moduleName, settings.showFolder)))
      {
         const folder = Utils.getQuestFolder();
         if (folder !== void 0)
         {
            const element = html.querySelector(`.folder[data-folder-id="${folder.id}"]`);
            if (element !== void 0)
            {
               element.remove();
            }
         }
      }
   }

   /**
    * Remove option item for quest journal folder when any journal entry is rendered.
    *
    * @param {JournalSheet}   app - The JournalSheet app.
    *
    * @param {JQuery}         html - The jQuery element for the window content of the app.
    */
   static renderJournalSheet(app, html)
   {
      const folder = Utils.getQuestFolder();
      if (folder)
      {
         const option = html.find(`option[value="${folder.id}"]`);

         if (option) { option.remove(); }
      }
   }
}
