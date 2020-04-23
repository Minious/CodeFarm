import * as Phaser from "phaser";

import { ControllerScene } from "./scenes/controllerScene";
import { WorldScene } from "./scenes/worldScene";
import { UiScene } from "./scenes/uiScene";

export const run = (): void => {
  /**
   * The global config of the game.
   * Defines the size of the canvas, the div parent HTML element,
   * the physics engine, the pixel art mode which doesn't
   * interpolate pixels when resizing images and the Scenes list.
   */
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 700,
    height: 500,
    backgroundColor: "#DDD",
    parent: "game",
    physics: {
      default: "arcade",
    },
    // @ts-ignore
    pixelArt: true,
    // ControllerScene is instantiated first and launch WorldScene and UiScene.
    scene: [ControllerScene, WorldScene, UiScene],
  };

  // Creates the Phaser canvas and start the game
  // @ts-ignore: noUnusedLocals error
  const game: Phaser.Game = new Phaser.Game(config);
};
