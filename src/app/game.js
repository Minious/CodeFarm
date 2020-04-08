import * as Phaser from "phaser";

import { ControllerScene } from "./controllerScene";
import { WorldScene } from "./worldScene";
import { UiScene } from "./uiScene";

export function run() {
        var config = {
        type: Phaser.AUTO,
        width: 700,
        height: 500,
        backgroundColor: "#DDD",
        parent: 'game',
        physics: {
            default: 'arcade'
        },
        pixelArt: true,
        scene: [ControllerScene, WorldScene, UiScene]
    };

    const game = new Phaser.Game(config);
}
