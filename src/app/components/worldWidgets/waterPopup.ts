import { WorldScene } from "../../scenes/worldScene";
import { ActionPopup } from "./actionPopup";
import { Crop } from "../crops/crop";

/**
 * A Popup icon displayed in the world view asking the player for a double click
 * confirmation to water a crop.
 */
export class WaterPopup extends ActionPopup {
  // Specifies the type of this game object's scene as WorldScene
  public scene: WorldScene;

  /**
   * Creates the WaterPopup object.
   * @param {WorldScene} worldScene - The WorldScene this Popup belongs to
   * @param {number} x - The x position of the Popup in the world
   * @param {number} y - The y position of the Popup in the world
   * @param {number} displayWidth - The width of the Popup
   * @param {Crop} crop - The Crop to water
   */
  public constructor(
    worldScene: WorldScene,
    x: number,
    y: number,
    displayWidth: number,
    crop: Crop
  ) {
    super(worldScene, x, y, displayWidth, (): void => crop.water(), "tools", 2);
  }
}
