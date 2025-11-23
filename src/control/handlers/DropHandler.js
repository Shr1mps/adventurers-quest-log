import {
   FVTTCompat,
   QuestDB,
   Socket,
   Utils }              from '../index.js';

import { Quest }        from '../../model/index.js';

import { constants }    from '../../model/constants.js';

export class DropHandler
{
   /**
    * Responds to when a data drop occurs on an ActorSheet.
    *
    * @param {Actor}          actor - The Actor which received the data drop.
    *
    * @param {ActorSheet}     sheet - The ActorSheet which received the data drop.
    *
    * @param {RewardDropData} data - Any data drop, but only handle RewardDropData.
    *
    * @returns {Promise<void>}
    */
   static async dropActorSheetData(actor, sheet, data)
   {
      if (typeof data !== 'object' || data?._aqlData?.type !== 'reward') { return; }

      await Socket.questRewardDrop({
         actor: { id: actor.id, name: FVTTCompat.get(actor, 'name') },
         sheet: { id: sheet.id },
         data
      });
   }

   /**
    * Converts a Quest drop on the canvas type to `JournalEntry` if the quest exists in the QuestDB.
    *
    * @param {Canvas}   foundryCanvas - The Foundry canvas.
    *
    * @param {object}   data - Drop data for canvas.
    */
   static dropCanvasData(foundryCanvas, data)
   {
      if (data.type === Quest.documentName && QuestDB.getQuest(data.id) !== void 0)
      {
         data.type = 'JournalEntry';
         data.uuid = `JournalEntry.${data.id}`;
      }
   }

   /**
    * Handles Quest data drops. Also handles setting image state of any macro dropped from the AQL macro compendiums.
    *
    * @param {object} data - The dropped data object.
    *
    * @param {number} slot - The target hotbar slot
    *
    * @returns {Promise<void>}
    */
   static async handleMacroHotbarDrop(data, slot)
   {
      const uuid = Utils.getUUID(data);
      const document = await fromUuid(uuid);

      if (!document) { return; }

      const macroCommand = FVTTCompat.get(document, 'command');

      const existingMacro = game.macros.contents.find((m) =>
      {
         return (FVTTCompat.authorID(m) === game.user.id && FVTTCompat.get(m, 'command') === macroCommand);
      });

      let macro = existingMacro;

      // If there is no existing macro then create one.
      if (!existingMacro)
      {
         const macroData = {
            name: FVTTCompat.get(document, 'name'),
            type: FVTTCompat.get(document, 'type'),
            command: FVTTCompat.get(document, 'command'),
            img: FVTTCompat.get(document, 'img'),
            flags: FVTTCompat.get(document, 'flags')
         };

         macro = await Macro.create(macroData, { displaySheet: false });
      }

      // If the macro is from the AQL macro compendiums then update the image state.
      if (macro)
      {
         const macroSetting = macro.getFlag(constants.moduleName, 'macro-setting');

         if (macroSetting) { await Utils.setMacroImage(macroSetting); }

         await game.user.assignHotbarMacro(macro, slot);
      }
   }

   /**
    * Handles creating a macro for a Quest drop on the hotbar. Uses existing macro if possible before creating a macro.
    *
    * @param {object} data - The dropped data object.
    *
    * @param {number} slot - The target hotbar slot
    *
    * @returns {Promise<void>}
    */
   static async handleQuestHotbarDrop(data, slot)
   {
      const questId = data.id;

      const quest = QuestDB.getQuest(questId);

      // Early out if Quest isn't in the QuestDB.
      if (!quest)
      {
         throw new Error(game.i18n.localize('AdventurersQuestLog.API.Hooks.Notifications.NoQuest'));
      }

      // The macro script data to open the quest via the public QuestAPI.
      const command = `game.modules.get('${constants.moduleName}').public.QuestAPI.open({ questId: '${questId}' });`;

      const macroData = {
         name: game.i18n.format('AdventurersQuestLog.API.Hooks.Labels.OpenMacro', { name: quest.name }),
         type: 'script',
         command
      };

      // Determine the image for the macro. Use the splash image if `splashAsIcon` is true otherwise the giver image.
      macroData.img = quest.splashAsIcon && quest.splash.length ? quest.splash : quest?.giverData?.img;

      // Search for an already existing macro with the same command.
      let macro = game.macros.contents.find((m) => (FVTTCompat.get(m, 'command') === command));

      // If not found then create a new macro with the command.
      if (!macro)
      {
         macro = await Macro.create(macroData, { displaySheet: false });
      }

      // Assign the macro to the hotbar.
      await game.user.assignHotbarMacro(macro, slot);
   }

   /**
    * Two cases are handled. Because hooks can not be asynchronous an immediate value is returned that reflects whether
    * the drop was handled or not.
    *
    * @param {Hotbar} hotbar - The Hotbar application instance.
    *
    * @param {object} data - The dropped data object.
    *
    * @param {number} slot - The target hotbar slot
    *
    * @returns {boolean} - Whether the callback was handled.
    */
   static hotbarDrop(hotbar, data, slot)
   {
      let handled = false;

      // Verify if the hotbar drop is data that is handled; either a quest or macro from AQL macro compendium.
      if (data.type === Quest.documentName || FVTTCompat.isAQLMacroDataTransfer(data))
      {
         handled = true;
      }

      // Wrap the handling code in an async IIFE. If this is a Quest data drop or a macro from the AQL macro compendium
      // pack then handle it.
      (async () =>
      {
         if (FVTTCompat.isAQLMacroDataTransfer(data))
         {
            await DropHandler.handleMacroHotbarDrop(data, slot);
         }

         if (data.type === Quest.documentName)
         {
            await DropHandler.handleQuestHotbarDrop(data, slot);
         }
      })();

      // Immediately return the handled state in the hook callback. Foundry expects false to stop the callback change.
      return !handled;
   }
}
