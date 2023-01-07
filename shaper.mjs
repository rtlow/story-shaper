/**
 * An implementation of the Story Shaper System in
 * the Foundry Virtual Tabletop environment.
 * Author: guiyii
 * Software License: MIT
 * Repository: https://github.com/rtlow/story-shaper
 * Issue Tracker: https://github.com/rtlow/story-shaper/issues
 */

// Import Configuration
import SHAPER from "./module/config.mjs";
import registerSystemSettings from "./module/settings.mjs";

// Import Submodules
import * as applications from "./module/applications/_module.mjs";
import * as canvas from "./module/canvas/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as utils from "./module/utils.mjs";

/* -------------------------------------------- */
/*  Define Module Structure                     */
/* -------------------------------------------- */

globalThis.shaper = {
  applications,
  canvas,
  config: SHAPER,
  dice,
  documents,
  utils
};

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function() {
  globalThis.shaper = game.shaper = Object.assign(game.system, globalThis.shaper);
  console.log(`shaperSystem | Initializing the shaperSystem Game System - Version ${shaper.version}\n${SHAPER.ASCII}`);


  // Record Configuration Values
  CONFIG.SHAPER = SHAPER;
  CONFIG.ActiveEffect.documentClass = documents.ActiveEffectShaper;
  CONFIG.Actor.documentClass = documents.ActorShaper;
  CONFIG.Item.documentClass = documents.ItemShaper;
  CONFIG.Token.documentClass = documents.TokenDocumentShaper;
  CONFIG.Token.objectClass = canvas.TokenShaper;
  CONFIG.time.roundTime = 6;
  CONFIG.Dice.DamageRoll = dice.DamageRoll;
  CONFIG.Dice.D10Roll = dice.D10Roll;
  CONFIG.MeasuredTemplate.defaults.angle = 53.13; // Shaper cone RAW should be 53.13 degrees

  // Register System Settings
  registerSystemSettings();

  // Patch Core Functions
  CONFIG.Combat.initiative.formula = "2d10 + @attributes.fin.mod + @attributes.sol.mod";
  Combatant.prototype._getInitiativeFormula = documents.combat._getInitiativeFormula;

  // Register Roll Extensions
  CONFIG.Dice.rolls.push(dice.D10Roll);
  CONFIG.Dice.rolls.push(dice.DamageRoll);

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shaper", applications.actor.ActorSheetShaperCharacter, {
    types: ["character"],
    makeDefault: true,
    label: "SHAPER.SheetClassCharacter"
  });
  Actors.registerSheet("shaper", applications.actor.ActorSheetShaperNPC, {
    types: ["npc"],
    makeDefault: true,
    label: "SHAPER.SheetClassNPC"
  });
  Actors.registerSheet("shaper", applications.actor.ActorSheetShaperVehicle, {
    types: ["vehicle"],
    makeDefault: true,
    label: "SHAPER.SheetClassVehicle"
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("shaper", applications.item.ItemSheetShaper, {
    makeDefault: true,
    label: "SHAPER.SheetClassItem"
  });

  // Preload Handlebars helpers & partials
  utils.registerHandlebarsHelpers();
  utils.preloadHandlebarsTemplates();
});


/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/**
 * Prepare attribute lists.
 */
Hooks.once("setup", function() {
  CONFIG.SHAPER.trackableAttributes = expandAttributeList(CONFIG.SHAPER.trackableAttributes);
  CONFIG.SHAPER.consumableResources = expandAttributeList(CONFIG.SHAPER.consumableResources);
});

/* --------------------------------------------- */

/**
 * Expand a list of attribute paths into an object that can be traversed.
 * @param {string[]} attributes  The initial attributes configuration.
 * @returns {object}  The expanded object structure.
 */
function expandAttributeList(attributes) {
  return attributes.reduce((obj, attr) => {
    foundry.utils.setProperty(obj, attr, true);
    return obj;
  }, {});
}

/* --------------------------------------------- */

/**
 * Perform one-time pre-localization and sorting of some configuration objects
 */
Hooks.once("i18nInit", () => utils.performPreLocalization(CONFIG.SHAPER));

/* -------------------------------------------- */
/*  Foundry VTT Ready                           */
/* -------------------------------------------- */


/* -------------------------------------------- */
/*  Canvas Initialization                       */
/* -------------------------------------------- */

Hooks.on("canvasInit", gameCanvas => {
  gameCanvas.grid.diagonalRule = game.settings.get("shaper", "diagonalMovement");
  SquareGrid.prototype.measureDistances = canvas.measureDistances;
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", documents.chat.onRenderChatMessage);
Hooks.on("getChatLogEntryContext", documents.chat.addChatMessageContextOptions);

Hooks.on("renderChatLog", (app, html, data) => documents.ItemShaper.chatListeners(html));
Hooks.on("renderChatPopout", (app, html, data) => documents.ItemShaper.chatListeners(html));

/* -------------------------------------------- */
/*  Bundled Module Exports                      */
/* -------------------------------------------- */

export {
  applications,
  canvas,
  dice,
  documents,
  utils,
  SHAPER
};
