import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

/**
 * Defines the Strawberry Crop.
 */
export class Strawberry extends Crop {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Strawberry,
        quantity: 1,
      },
      {
        item: ItemType.StrawberrySeed,
        quantity: 1,
      },
    ];
    super(scene, x, y, 25, 91, lootConfig);
  }
}
