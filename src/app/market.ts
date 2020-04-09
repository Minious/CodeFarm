import * as Phaser from "phaser";

import { Building } from "./building";
import { UiScene } from "./uiScene";

export class Market extends Building {
    constructor (scene: Phaser.Scene, x: number, y: number) {
        let margin = 15;
        let heightMarket = 50;
        let size = {x: 3, y: 4};
        let colliderPosition = {
            x: margin,
            y: size.y * 32 - heightMarket,
            width: size.x * 32 - 2 * margin,
            height: heightMarket
        };
        let foreground = {
            x: 0,
            y: 0,
            width: 2,
            height: 2,
        }
        let externalCallback = () => {
            (this.scene.game.scene.getScene('UiScene') as UiScene).openMarket();
        };
        super(scene, x, y, 306, size, foreground, colliderPosition, externalCallback);
    }
}