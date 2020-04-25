import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

/**
 * Defines the Melon Crop.
 */
export class Melon extends Crop {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Melon,
        quantity: 1,
      },
      {
        item: ItemType.MelonSeed,
        quantity: 1,
      },
    ];
    super(scene, x, y, 40, 28, lootConfig);
  }
}
