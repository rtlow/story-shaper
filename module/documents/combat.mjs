/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * Apply advantage, proficiency, or bonuses where appropriate
 * Apply the dexterity score as a decimal tiebreaker if requested
 * See Combat._getInitiativeFormula for more detail.
 * @returns {string}  Final initiative formula for the actor.
 * 
 */
export function getInitiativeRoll(formula="2d10") {
  if ( !this.actor ) return new CONFIG.Dice.D10Roll(formula ?? "2d10", {});
  return this.actor.getInitiativeRoll();
}
