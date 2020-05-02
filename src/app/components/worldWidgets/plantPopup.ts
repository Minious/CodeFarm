import { WorldScene } from "../../scenes/worldScene";
import { ActionPopup } from "./actionPopup";
import { Vector2 } from "../../types/vector2.type";
import { ItemData, getItemData } from "../../interfaces/itemData.interface";
import { ItemType } from "../../enums/itemType.enum";

/**
 * A Popup icon displayed in the world view asking the player for a double click
 * confirmation to plant a crop.
 */
export class PlantPopup extends ActionPopup {
  // Specifies the type of this game object's scene as WorldScene
  public scene: WorldScene;

  /**
   * Creates the PlantPopup object.
   * @param {WorldScene} worldScene - The WorldScene this Popup belongs to
   * @param {number} x - The x position of the Popup in the world
   * @param {number} y - The y position of the Popup in the world
   * @param {number} displayWidth - The width of the Popup
   * @param {Vector2} tilePos - The position where the Crop will be planted
   * @param {ItemType} itemType - The seed ItemType to plant
   */
  public constructor(
    worldScene: WorldScene,
    x: number,
    y: number,
    displayWidth: number,
    tilePos: Vector2,
    itemType: ItemType
  ) {
    const itemTypeIsSeed: boolean = getItemData(itemType).isSeed;
    if (!itemTypeIsSeed) {
      throw new Error("Cannot plant, the selected item is not a seed.");
    }

    const callback = (): void => {
      worldScene.createCrop(tilePos.x, tilePos.y, itemType);
      this.scene.scenesManager.controllerScene.modifySelectedInventorySlotQuantity(
        -1
      );
    };

    const itemData: ItemData = getItemData(itemType);

    super(
      worldScene,
      x,
      y,
      displayWidth,
      callback,
      itemData.texture,
      itemData.frame
    );
  }
}
