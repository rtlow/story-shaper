/* -------------------------------------------- */
/* D10 Roll                                     */
/* -------------------------------------------- */

/**
 * Configuration data for a D10 roll.
 *
 * @typedef {object} D10RollConfiguration
 *
 * @property {string[]} [parts=[]]  The dice roll component parts, excluding the initial d10.
 * @property {object} [data={}]     Data that will be used when parsing this roll.
 * @property {Event} [event]        The triggering event for this roll.
 *
 * ## D10 Properties
 * @property {boolean} [advantage]     Apply advantage to this roll (unless overridden by modifier keys or dialog)?
 * @property {boolean} [disadvantage]  Apply disadvantage to this roll (unless overridden by modifier keys or dialog)?
 * @property {number|null} [critical=20]  The value of the d10 result which represents a critical success,
 *                                     `null` will prevent critical successes.
 * @property {number|null} [fumble=1]  The value of the d10 result which represents a critical failure,
 *                                     `null` will prevent critical failures.
 * @property {number} [targetValue]    The value of the d10 result which should represent a successful roll.
 *
 *
 * ## Roll Configuration Dialog
 * @property {boolean} [fastForward=false]     Should the roll configuration dialog be skipped?
 * @property {boolean} [chooseModifier=false]  If the configuration dialog is shown, should the ability modifier be
 *                                             configurable within that interface?
 * @property {string} [template]               The HTML template used to display the roll configuration dialog.
 * @property {string} [title]                  Title of the roll configuration dialog.
 * @property {object} [dialogOptions]          Additional options passed to the roll configuration dialog.
 *
 * ## Chat Message
 * @property {boolean} [chatMessage=true]  Should a chat message be created for this roll?
 * @property {object} [messageData={}]     Additional data which is applied to the created chat message.
 * @property {string} [rollMode]           Value of `CONST.DICE_ROLL_MODES` to apply as default for the chat message.
 * @property {object} [flavor]             Flavor text to use in the created chat message.
 */

/**
 * A standardized helper function for managing core Shaper d10 rolls.
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus, Advantage, or Disadvantage respectively
 *
 * @param {D10RollConfiguration} configuration  Configuration data for the D10 roll.
 * @returns {Promise<D10Roll|null>}             The evaluated D10Roll, or null if the workflow was cancelled.
 */
export async function d10Roll({
  parts=[], data={}, event,
  advantage, disadvantage, boonbane=0, critical=20, fumble=1, targetValue,
  fastForward=false, chooseModifier=false, haveResistance=false, template, title, dialogOptions,
  chatMessage=true, messageData={}, rollMode, flavor
}={}) {

  // Handle input arguments
  const formula = ["2d10"].concat(parts).join(" + ");
  const {advantageMode, isFF} = _determineAdvantageMode({advantage, disadvantage, fastForward, event});
  const defaultRollMode = rollMode || game.settings.get("core", "rollMode");
  if ( chooseModifier && !isFF ) {
    data.mod = "@mod";
    if ( "abilityCheckBonus" in data ) data.abilityCheckBonus = "@abilityCheckBonus";
  }

  // Construct the D10Roll instance
  const roll = new CONFIG.Dice.D10Roll(formula, data, {
    flavor: flavor || title,
    advantageMode,
    boonbane,
    defaultRollMode,
    rollMode,
    critical,
    fumble,
    targetValue,
  });

  // Prompt a Dialog to further configure the D10Roll
  if ( !isFF ) {
    const configured = await roll.configureDialog({
      title,
      chooseModifier,
      haveResistance,
      defaultRollMode,
      defaultAction: advantageMode,
      defaultAbility0: data?.defaultAbility0,
      defaultAbility1: data?.defaultAbility1,
      boonbane,
      template
    }, dialogOptions);
    if ( configured === null ) return null;
  } else roll.options.rollMode ??= defaultRollMode;

  // Evaluate the configured roll
  await roll.evaluate({async: true});

  // Create a Chat Message
  if ( roll && chatMessage ) await roll.toMessage(messageData);
  return roll;
}

/* -------------------------------------------- */

/**
 * Determines whether this d10 roll should be fast-forwarded, and whether advantage or disadvantage should be applied
 * @param {object} [config]
 * @param {Event} [config.event]           Event that triggered the roll.
 * @param {boolean} [config.advantage]     Is something granting this roll advantage?
 * @param {boolean} [config.disadvantage]  Is something granting this roll disadvantage?
 * @param {boolean} [config.fastForward]   Should the roll dialog be skipped?
 * @returns {{isFF: boolean, advantageMode: number}}  Whether the roll is fast-forward, and its advantage mode.
 */
function _determineAdvantageMode({event, advantage=false, disadvantage=false, fastForward=false}={}) {
  const isFF = fastForward || (event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey));
  let advantageMode = CONFIG.Dice.D10Roll.ADV_MODE.NORMAL;
  if ( advantage || event?.altKey ) advantageMode = CONFIG.Dice.D10Roll.ADV_MODE.ADVANTAGE;
  else if ( disadvantage || event?.ctrlKey || event?.metaKey ) {
    advantageMode = CONFIG.Dice.D10Roll.ADV_MODE.DISADVANTAGE;
  }
  return {isFF, advantageMode};
}

/* -------------------------------------------- */
/* Damage Roll                                  */
/* -------------------------------------------- */

/**
 * Configuration data for a damage roll.
 *
 * @typedef {object} DamageRollConfiguration
 *
 * @property {string[]} [parts=[]]  The dice roll component parts.
 * @property {object} [data={}]     Data that will be used when parsing this roll.
 * @property {Event} [event]        The triggering event for this roll.
 *
 * ## Critical Handling
 * @property {boolean} [allowCritical=true]  Is this damage roll allowed to be rolled as critical?
 * @property {boolean} [critical=false]      Apply critical to this roll (unless overridden by modifier key or dialog)?
 * @property {number} [criticalBonusDice]    A number of bonus damage dice that are added for critical hits.
 * @property {number} [criticalMultiplier]   Multiplier to use when calculating critical damage.
 * @property {boolean} [multiplyNumeric]     Should numeric terms be multiplied when this roll criticals?
 * @property {boolean} [powerfulCritical]    Should the critical dice be maximized rather than rolled?
 * @property {string} [criticalBonusDamage]  An extra damage term that is applied only on a critical hit.
 *
 * ## Roll Configuration Dialog
 * @property {boolean} [fastForward=false]  Should the roll configuration dialog be skipped?
 * @property {string} [template]            The HTML template used to render the roll configuration dialog.
 * @property {string} [title]               Title of the roll configuration dialog.
 * @property {object} [dialogOptions]       Additional options passed to the roll configuration dialog.
 *
 * ## Chat Message
 * @property {boolean} [chatMessage=true]  Should a chat message be created for this roll?
 * @property {object} [messageData={}]     Additional data which is applied to the created chat message.
 * @property {string} [rollMode]           Value of `CONST.DICE_ROLL_MODES` to apply as default for the chat message.
 * @property {string} [flavor]             Flavor text to use in the created chat message.
 */

/**
 * A standardized helper function for managing core Shaper damage rolls.
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus, Critical, or no bonus respectively
 *
 * @param {DamageRollConfiguration} configuration  Configuration data for the Damage roll.
 * @returns {Promise<DamageRoll|null>}             The evaluated DamageRoll, or null if the workflow was canceled.
 */
export async function damageRoll({
  parts=[], data={}, event,
  allowCritical=true, critical=false, criticalBonusDice, criticalMultiplier,
  multiplyNumeric, powerfulCritical, criticalBonusDamage,
  fastForward=false, template, title, dialogOptions,
  chatMessage=true, messageData={}, rollMode, flavor
}={}) {

  // Handle input arguments
  const defaultRollMode = rollMode || game.settings.get("core", "rollMode");

  // Construct the DamageRoll instance
  const formula = parts.join(" + ");
  const {isCritical, isFF} = _determineCriticalMode({critical, fastForward, event});
  const roll = new CONFIG.Dice.DamageRoll(formula, data, {
    flavor: flavor || title,
    rollMode,
    critical: isFF ? isCritical : false,
    criticalBonusDice,
    criticalMultiplier,
    criticalBonusDamage
  });

  // Prompt a Dialog to further configure the DamageRoll
  if ( !isFF ) {
    const configured = await roll.configureDialog({
      title,
      defaultRollMode: defaultRollMode,
      defaultCritical: isCritical,
      template,
      allowCritical
    }, dialogOptions);
    if ( configured === null ) return null;
  }

  // Evaluate the configured roll
  await roll.evaluate({async: true});

  // Create a Chat Message
  if ( roll && chatMessage ) await roll.toMessage(messageData);
  return roll;
}

/* -------------------------------------------- */

/**
 * Determines whether this d10 roll should be fast-forwarded, and whether advantage or disadvantage should be applied
 * @param {object} [config]
 * @param {Event} [config.event]          Event that triggered the roll.
 * @param {boolean} [config.critical]     Is this roll treated as a critical by default?
 * @param {boolean} [config.fastForward]  Should the roll dialog be skipped?
 * @returns {{isFF: boolean, isCritical: boolean}}  Whether the roll is fast-forward, and whether it is a critical hit
 */
function _determineCriticalMode({event, critical=false, fastForward=false}={}) {
  const isFF = fastForward || (event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey));
  if ( event?.altKey ) critical = true;
  return {isFF, isCritical: critical};
}
