/**
 * Register all of the system's settings.
 */
export default function registerSystemSettings() {
  // Internal System Migration Version
  game.settings.register("shaper", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  // Rest Recovery Rules
  game.settings.register("shaper", "restVariant", {
    name: "SETTINGS.ShaperRestN",
    hint: "SETTINGS.ShaperRestL",
    scope: "world",
    config: true,
    default: "normal",
    type: String,
    choices: {
      normal: "SETTINGS.ShaperRestPHB",
      gritty: "SETTINGS.ShaperRestGritty",
      epic: "SETTINGS.ShaperRestEpic"
    }
  });

  // Diagonal Movement Rule
  game.settings.register("shaper", "diagonalMovement", {
    name: "SETTINGS.ShaperDiagN",
    hint: "SETTINGS.ShaperDiagL",
    scope: "world",
    config: true,
    default: "EUCL",
    type: String,
    choices: {
      555: "SETTINGS.ShaperDiagPHB",
      5105: "SETTINGS.ShaperDiagDMG",
      EUCL: "SETTINGS.ShaperDiagEuclidean"
    },
    onChange: rule => canvas.grid.diagonalRule = rule
  });


  // Disable Experience Tracking
  game.settings.register("shaper", "disableExperienceTracking", {
    name: "SETTINGS.ShaperNoExpN",
    hint: "SETTINGS.ShaperNoExpL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });


  // Collapse Item Cards (by default)
  game.settings.register("shaper", "autoCollapseItemCards", {
    name: "SETTINGS.ShaperAutoCollapseCardN",
    hint: "SETTINGS.ShaperAutoCollapseCardL",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: s => {
      ui.chat.render();
    }
  });

  // Critical Damage Modifiers
  game.settings.register("shaper", "criticalDamageModifiers", {
    name: "SETTINGS.ShaperCriticalModifiersN",
    hint: "SETTINGS.ShaperCriticalModifiersL",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Critical Damage Maximize
  game.settings.register("shaper", "criticalDamageMaxDice", {
    name: "SETTINGS.ShaperCriticalMaxDiceN",
    hint: "SETTINGS.ShaperCriticalMaxDiceL",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}
