/**
 * @param {ActorShaper} actor               The Actor instance being displayed within the sheet.
 * @param {ApplicationOptions} options  Additional application configuration options.
 * @param {string} statId           The stat key as defined in CONFIG.SHAPER.stats.
 */
export default class ActorInitScalingConfig extends DocumentSheet {
  constructor(actor, options) {
    super(actor, options);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shaper"],
      template: "systems/shaper/templates/apps/scaling-config.hbs",
      width: 500,
      height: "auto"
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get title() {
    const label = game.i18n.localize("SHAPER.Initiative");
    return `${game.i18n.format("SHAPER.ScalingConfig", {stat: label})}: ${this.document.name}`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const src = this.object.toObject();
    return {
      stat: src.system.attributes.init || {},
      config: CONFIG.SHAPER,
      scale0: src.system.attributes.init.scale0,
      scale1: src.system.attributes.init.scale1,
      hasBonus: false
    };
  }
  
  /* -------------------------------------------- */

  /**
   * Prepare the update data to include choices in the provided object.
   * @param {object} formData  Form data to search for choices.
   * @returns {object}         Updates to apply to target.
   */
   _prepareUpdateData(formData) {
    const updateData = {};
    const updates = foundry.utils.expandObject(formData);
    updateData[`system.attributes.init.scale0`] = updates.scale0;
    updateData[`system.attributes.init.scale1`]  = updates.scale1;
    return updateData;
  }
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _updateObject(event, formData) {
    const actor = this.object;
    const updateData = this._prepareUpdateData(formData);
    if ( updateData ) await actor.update(updateData);
  }
}
