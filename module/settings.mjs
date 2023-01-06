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


  // Diagonal Movement Rule
  game.settings.register("shaper", "diagonalMovement", {
    name: "SETTINGS.ShaperDiagN",
    hint: "SETTINGS.ShaperDiagL",
    scope: "world",
    config: true,
    default: "EUCL",
    type: String,
    choices: {
      555: "SETTINGS.ShaperDiagSUP",
      EUCL: "SETTINGS.ShaperDiagEuclidean"
    },
    onChange: rule => canvas.grid.diagonalRule = rule
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

}
