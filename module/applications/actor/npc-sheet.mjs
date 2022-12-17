import ActorSheet5e from "./base-sheet.mjs";

/**
 * An Actor sheet for NPC type characters.
 */
export default class ActorSheet5eNPC extends ActorSheet5e {

  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shaper", "sheet", "actor", "npc"],
      width: 600
    });
  }

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async getData(options) {
    const context = await super.getData(options);
    // Resources
    context.stats = ["physO", "menO", "physD", "menD", "endurance"].reduce((arr, r) => {
      const stat = context.actor.system.stats[r] || {};
      stat.name = r;
      stat.placeholder = game.i18n.localize(`SHAPER.Stat${r.titleCase()}`);
      return arr.concat([stat]);
    }, []);
    return context
  }

  /* -------------------------------------------- */

  /** @override */
  _prepareItems(context) {

    // Categorize Items as Features
    const features = {
      actions: { label: game.i18n.localize("SHAPER.ActionPl"), items: [], hasActions: true,
        dataset: {type: "feat", "activation.type": "action"} },
      passive: { label: game.i18n.localize("SHAPER.Features"), items: [], dataset: {type: "feat"} }
    };

    // Start by classifying items into groups for rendering
    let [spells, other] = context.items.reduce((arr, item) => {
      const {quantity, uses, recharge, target} = item.system;
      item.img = item.img || CONST.DEFAULT_TOKEN;
      item.isStack = Number.isNumeric(quantity) && (quantity !== 1);
      item.hasUses = uses && (uses.max > 0);
      item.isOnCooldown = recharge && !!recharge.value && (recharge.charged === false);
      
      item.hasTarget = !!target && !(["none", ""].includes(target.type));
      if ( item.type === "spell" ) arr[0].push(item);
      else arr[1].push(item);
      return arr;
    }, [[], []]);

    // Apply item filters
    other = this._filterItems(other, this._filters.features);

    // Organize Features
    for ( let item of other ) {
      if ( item.type === "feat" ) {
        if ( item.system.activation.type ) features.actions.items.push(item);
        else features.passive.items.push(item);
      }
    }

    // Assign and return
    context.features = Object.values(features);
  }


  /* -------------------------------------------- */
  /*  Object Updates                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _updateObject(event, formData) {


    // Parent ActorSheet update steps
    return super._updateObject(event, formData);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".health .rollable").click(this._onRollHPFormula.bind(this));
    html.find(".mind .rollable").click(this._onRollMPFormula.bind(this));
    html.find(".rollable[data-action]").click(this._onSheetAction.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling NPC health values using the provided formula.
   * @param {Event} event  The original click event.
   * @private
   */
  _onRollHPFormula(event) {
    event.preventDefault();
    const formula = this.actor.system.attributes.hp.formula;
    if ( !formula ) return;
    const hp = new Roll(formula).roll({async: false}).total;
    AudioHelper.play({src: CONFIG.sounds.dice});
    this.actor.update({"system.attributes.hp.value": hp, "system.attributes.hp.max": hp});
  }

    /* -------------------------------------------- */

  /**
   * Handle rolling NPC mind values using the provided formula.
   * @param {Event} event  The original click event.
   * @private
   */
   _onRollMPFormula(event) {
    event.preventDefault();
    const formula = this.actor.system.attributes.mp.formula;
    if ( !formula ) return;
    const mp = new Roll(formula).roll({async: false}).total;
    AudioHelper.play({src: CONFIG.sounds.dice});
    this.actor.update({"system.attributes.mp.value": mp, "system.attributes.mp.max": mp});
  }

  /* -------------------------------------------- */

  /**
   * Handle mouse click events for character sheet actions.
   * @param {MouseEvent} event  The originating click event.
   * @returns {Promise}         Dialog or roll result.
   * @private
   */
   _onSheetAction(event) {
    event.preventDefault();
    const button = event.currentTarget;
    switch ( button.dataset.action ) {
      case "rollInitiative":
        return this.actor.rollInitiative({createCombatants: true});
    }
  }
}
