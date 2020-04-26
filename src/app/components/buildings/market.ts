import * as Phaser from "phaser";

import { Building } from "./building";
import { UiScene } from "../../scenes/uiScene";
import { Vector2 } from "../../types/vector2.type";
import { BoundingBox } from "../../interfaces/boundingBox.interface";

/**
 * The Market is a Building allowing the player to buy and sell items. When
 * clicked, it opens the MarketInterface in the UiScene.
 */
export class Market extends Building {
  /**
   * Creates the Market object.
   * @param {Phaser.Scene} scene - The Phaser Scene this Popup belongs to
   * (should be WorldScene)
   * @param {number} x - The x position of the top left Tile of the Market in
   * the WorldScene's Tilemap
   * @param {number} y - The y position of the top left Tile of the Market in
   * the WorldScene's Tilemap
   */
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
