import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

/**
 * Defines the Grapes Crop.
 */
export class Grapes extends Crop {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Grapes,
        quantity: 1,
      },
      {
        item: ItemType.GrapesSeed,
        quantity: 1,
      },
    ];
    super(scene, x, y, 50, 70, lootConfig);
  }
}
