import * as Phaser from "phaser";

import { ControllerScene } from "./scenes/controllerScene";
import { WorldScene } from "./scenes/worldScene";
import { UiScene } from "./scenes/uiScene";

export const run = (): void => {
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
    scene: [ControllerScene, WorldScene, UiScene],
  };

  // @ts-ignore: noUnusedLocals error
  const game: Phaser.Game = new Phaser.Game(config);
};
