import { WorldScene } from "../../scenes/worldScene";
import { ActionPopup } from "./actionPopup";
import { Vector2 } from "../../types/vector2.type";

/**
 * TODO
 */
export class PlowPopup extends ActionPopup {
  // Specifies the type of this game object's scene as WorldScene
  public scene: WorldScene;

  /**
   * Creates the PlowPopup object.
   * @param {WorldScene} worldScene - The WorldScene this Popup belongs to
   * @param {number} x - The x position of the Popup in the world
   * @param {number} y - The y position of the Popup in the world
   * @param {number} displayWidth - The width of the Popup
   * @param {Vector2} tilePos - TODO
   */
  public constructor(
    worldScene: WorldScene,
    x: number,
    y: number,
    displayWidth: number,
    tilePos: Vector2
  ) {
    super(
      worldScene,
      x,
      y,
      displayWidth,
      (): void => this.scene.scenesManager.worldScene.createFieldTile(tilePos),
      "tools",
      1
    );
  }
}
