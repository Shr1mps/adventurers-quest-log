import {
   QuestDB,
   Socket,
   Utils,
   ViewManager }        from '../../control/index.js';

import {
   AQLContextMenu,
   AQLDialog }          from '../internal/index.js';

import { HandlerLog }   from './HandlerLog.js';

import {
   constants,
   questStatus,
   questStatusI18n,
   settings }           from '../../model/constants.js';
import * as contextOptions from "../internal/context-options.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Provides the main quest log app which shows the quests separated by status.
 */
export class QuestLog extends HandlebarsApplicationMixin(ApplicationV2)
{
   constructor(options = {})
   {
      super(options);

      this.searchQuery = "";
      this.sortKey = "alpha"; // 'alpha', 'date', 'priority'
   }

   static DEFAULT_OPTIONS = {
      tag: "form",
      window: {
         contentClasses: ["standard-form", "quest-log"],
         icon: "fas fa-scroll",
         title: "AdventurersQuestLog.Title",
         resizable: true
      },
      position: {
         width: 800,
         height: 600
      },
      actions: {
         openQuest: QuestLog.onOpenQuest,
         setStatus: QuestLog.onSetStatus,
         showPlayers: QuestLog.onShowPlayers,
         newQuest: QuestLog.onNewQuest,
         deleteQuest: QuestLog.onDeleteQuest
      }
   };

   static PARTS = {
      log: {
         template: "modules/adventurers-quest-log/templates/quest-log.html",
         scrollable: [".quest-list"]
      }
   };

   async _prepareContext(options)
   {
      const quests = QuestDB.getQuests();
      const filtered = this._filterAndSortQuests(quests);

      return {
         quests: filtered,
         searchQuery: this.searchQuery,
         sortKey: this.sortKey,
         isGM: game.user.isGM,
         canCreate: ViewManager.verifyQuestCanAdd()
      };
   }

   _filterAndSortQuests(quests)
   {
      let { active, completed, failed } = quests;
      const query = this.searchQuery.toLowerCase();

      const filter = (q) => q.name.toLowerCase().includes(query);
      
      if (query)
      {
         active = active.filter(filter);
         completed = completed.filter(filter);
         failed = failed ? failed.filter(filter) : [];
      }

      const sort = (a, b) => {
         if (this.sortKey === 'date') return b.date.create - a.date.create;
         if (this.sortKey === 'priority') return b.priority - a.priority;
         return a.name.localeCompare(b.name);
      };

      active.sort(sort);
      completed.sort(sort);
      if (failed) failed.sort(sort);

      return { active, completed, failed };
   }

   static async onNewQuest(event, target)
   {
      if (ViewManager.verifyQuestCanAdd())
      {
         const quest = await QuestDB.createQuest();
         ViewManager.questAdded({ quest });
      }
   }

   static async onDeleteQuest(event, target)
   {
      const questId = target.dataset.questId;
      const name = target.dataset.questName;

      const result = await AQLDialog.confirmDeleteQuest({ name, result: questId, questId });
      if (result)
      {
         await QuestDB.deleteQuest({ questId: result });
      }
   }

   static onOpenQuest(event, target)
   {
      const questId = target.closest('.drag-quest')?.dataset.questId;
      if (questId) QuestAPI.open({ questId });
   }

   static async onSetStatus(event, target)
   {
      const statusTarget = target.dataset.target;
      const questId = target.dataset.questId;

      const quest = QuestDB.getQuest(questId);
      if (quest) { await Socket.setQuestStatus({ quest, target: statusTarget }); }
   }

   static onShowPlayers(event, target)
   {
      // Need to get active tab. AppV2 doesn't track tabs the same way.
      // We can find the active tab in DOM.
      const activeTab = this.element.querySelector('.log-tabs .item.active')?.dataset.tab || 'active';
      Socket.showQuestLog(activeTab);
   }

   static onSearch(event, target)
   {
      this.searchQuery = target.value;
      this.render();
   }

   static onSort(event, target)
   {
      this.sortKey = target.value;
      this.render();
   }
}
