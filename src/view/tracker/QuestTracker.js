import {
   FoundryUIManager,
   QuestDB,
   Socket,
   Utils }                 from '../../control/index.js';

import { HandlerTracker }  from './HandlerTracker.js';

import { AQLContextMenu }  from '../internal/index.js';

import { collect }         from '../../../external/index.js';

import {
   constants,
   jquery,
   questStatus,
   sessionConstants,
   settings }              from '../../model/constants.js';

import * as contextOptions from "../internal/context-options.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Provides the quest tracker which provides an overview of active quests and objectives.
 */
export class QuestTracker extends HandlebarsApplicationMixin(ApplicationV2)
{
   static #DEFAULT_WIDTH = 296;
   static #DEFAULT_POSITION = { top: 80, width: QuestTracker.#DEFAULT_WIDTH };
   static #TIMEOUT_POSITION = 1000;

   #appExtents;
   #timeoutPosition = void 0;
   #windowResizable;
   #scrollbarActive;

   constructor(options = {})
   {
      super(options);

      try
      {
         const savedPos = JSON.parse(game.settings.get(constants.moduleName, settings.questTrackerPosition));
         this.position = savedPos || QuestTracker.#DEFAULT_POSITION;
         if (!this.position?.width) { this.position.width = QuestTracker.#DEFAULT_WIDTH; }
      }
      catch (err)
      {
         this.position = QuestTracker.#DEFAULT_POSITION;
      }

      this._dragHeader = false;
      this._pinned = game.settings.get(constants.moduleName, settings.questTrackerPinned);
      this._inPinDropRect = false;
   }

   /** @override */
   _onRender(context, options)
   {
      super._onRender(context, options);
      
      const html = $(this.element);

      // Background class handling
      const showBackgroundState = sessionStorage.getItem(sessionConstants.trackerShowBackground) === 'true';
      if (!showBackgroundState)
      {
         this.element.classList.add('no-background');
      } else {
         this.element.classList.remove('no-background');
      }

      // Drag & Pin Logic
      // AppV2 handles dragging, but we need to hook into it for pinning.
      // We can attach listeners to the window header.
      const header = this.element.querySelector('.window-header');
      if (header) {
          header.addEventListener('pointerdown', (event) => HandlerTracker.headerPointerDown(event, header, this));
          header.addEventListener('pointerup', (event) => HandlerTracker.headerPointerUp(event, header, this));
      }

      // Context Menu
      this.#contextMenu(html);

      // Double click to open quest
      // We can use standard listeners or Utils helper
      Utils.createJQueryDblClick({
         selector: '#quest-tracker .quest-tracker-header', // Selector might need adjustment for AppV2 structure
         singleCallback: (event) => HandlerTracker.questClick(event, this),
         doubleCallback: HandlerTracker.questOpen,
      });

      // Resize handle logic (AppV2 handles resizing, but we might need custom constraints)
      this.#appExtents = {
         minWidth: parseInt(html.css('min-width')) || 275,
         maxWidth: parseInt(html.css('max-width')) || 800,
         minHeight: parseInt(html.css('min-height')) || 100,
         maxHeight: parseInt(html.css('max-height')) || 1000
      };

      this.#windowResizable = game.settings.get(constants.moduleName, settings.questTrackerResizable);
      // AppV2 resizable is set in options. We can toggle it?
      // window.resizable option.
   }

   #contextMenu(html)
   {
      const menuItems = [
         contextOptions.menuItemCopyLink,
         contextOptions.jumpToPin
      ];

      if (game.user.isGM)
      {
         menuItems.push(
          contextOptions.copyQuestId,
          contextOptions.togglePrimaryQuest
         );
      }

      // Selector might need adjustment
      new AQLContextMenu(html, '.quest-tracker-header', menuItems, { fixed: true });
   }

   /** @override */
   _getHeaderControls()
   {
      const controls = super._getHeaderControls();

      // Show Background Button
      const showBackgroundState = sessionStorage.getItem(sessionConstants.trackerShowBackground) === 'true';
      controls.unshift({
         icon: showBackgroundState ? 'fas fa-fill on' : 'fas fa-fill off',
         label: showBackgroundState ? 'AdventurersQuestLog.QuestTracker.Tooltips.BackgroundUnshow' : 'AdventurersQuestLog.QuestTracker.Tooltips.BackgroundShow',
         action: 'showBackground',
         onclick: () => HandlerTracker.showBackground(this)
      });

      // Show Primary Button
      const primaryState = sessionStorage.getItem(sessionConstants.trackerShowPrimary) === 'true';
      controls.unshift({
         icon: primaryState ? 'fas fa-star' : 'far fa-star',
         label: primaryState ? 'AdventurersQuestLog.QuestTracker.Tooltips.PrimaryQuestUnshow' : 'AdventurersQuestLog.QuestTracker.Tooltips.PrimaryQuestShow',
         action: 'showPrimary',
         onclick: () => HandlerTracker.questPrimaryShow(this)
      });

      if (game.user.isGM)
      {
         controls.unshift({
            icon: 'fas fa-eye',
            label: 'AdventurersQuestLog.Labels.AppHeader.ShowPlayers',
            action: 'shareTracker',
            onclick: () => Socket.showQuestTracker()
         });
      }

      return controls;
   }

   /** @override */
   setPosition(position = {})
   {
       // Custom setPosition logic for pinning
       // We need to call super.setPosition but also handle pinning constraints.
       // AppV2 setPosition returns the new position.
       
       const { override, pinned = this._pinned, ...opts } = position;

       if (typeof override === 'boolean')
       {
          if (pinned)
          {
             this._pinned = true;
             this._inPinDropRect = true;
             game.settings.set(constants.moduleName, settings.questTrackerPinned, true);
             FoundryUIManager.updateTracker();
             return opts; 
          }
          else
          {
             this._pinned = false;
             this._inPinDropRect = false;
             game.settings.set(constants.moduleName, settings.questTrackerPinned, false);
          }
       }

       if (pinned)
       {
          if (typeof opts.left === 'number') { opts.left = this.position.left; }
          if (typeof opts.top === 'number') { opts.top = this.position.top; }
          if (typeof opts.width === 'number') { opts.width = this.position.width; }
       }

       const currentPosition = super.setPosition(opts);
       
       // Pinning logic check
       const currentInPinDropRect = this._inPinDropRect;
       // We need to adapt FoundryUIManager.checkPosition to work with AppV2 position object if needed
       this._inPinDropRect = FoundryUIManager.checkPosition(currentPosition);

       if (!this._pinned && this._dragHeader && currentInPinDropRect !== this._inPinDropRect)
       {
          this.element.style.animation = this._inPinDropRect ? 'aql-jiggle 0.3s infinite' : '';
       }

       // Save position
       if (currentPosition && currentPosition.width && currentPosition.height)
       {
          if (this.#timeoutPosition) clearTimeout(this.#timeoutPosition);
          this.#timeoutPosition = setTimeout(() =>
          {
             game.settings.set(constants.moduleName, settings.questTrackerPosition, JSON.stringify(currentPosition));
          }, QuestTracker.#TIMEOUT_POSITION);
       }

       return currentPosition;
   }

   /* Actions */

   static onOpenQuest(event, target)
   {
      const questId = target.dataset.questId;
      QuestAPI.open({ questId });
   }

   static async onToggleTask(event, target)
   {
      const questId = target.dataset.questId;
      const uuidv4 = target.dataset.uuidv4;
      const quest = QuestDB.getQuest(questId);

      if (quest)
      {
         const task = quest.getTask(uuidv4);
         if (task)
         {
            task.toggle();
            await quest.save();
            Socket.refreshQuestPreview({ questId, focus: false });
         }
      }
   }

   static onToggleFolder(event, target)
   {
       // Toggle folder state
       const questId = target.dataset.questId;
       const folderState = sessionStorage.getItem(`${sessionConstants.trackerFolderState}${questId}`);
       const collapsed = folderState !== 'false';
       sessionStorage.setItem(`${sessionConstants.trackerFolderState}${questId}`, (!collapsed).toString());
       this.render();
   }
}