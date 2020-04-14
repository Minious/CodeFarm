import * as Phaser from "phaser";

import { Building } from "./building";
import { UiScene } from "../../scenes/uiScene";
import { Vector2 } from "../../types/vector2.type";
import { BoundingBox } from "../../interfaces/boundingBox.interface";

export class Market extends Building {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    const margin: number = 15;
    const heightMarket: number = 50;
    const size: Vector2 = { x: 3, y: 4 };
    const colliderPosition: BoundingBox = {
      x: margin,
      y: size.y * 32 - heightMarket,
      width: size.x * 32 - 2 * margin,
      height: heightMarket,
    };
    const foreground: BoundingBox = {
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    };
    const externalCallback = (): void => {
      (this.scene.game.scene.getScene("UiScene") as UiScene).openMarket();
    };
    super(
      scene,
      x,
      y,
      306,
      size,
      foreground,
      colliderPosition,
      externalCallback
    );
  }
}
