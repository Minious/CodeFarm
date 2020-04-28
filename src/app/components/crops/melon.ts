import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Melon Crop.
 */
export class Melon extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
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
    super(worldScene, x, y, 40, 28, lootConfig);
  }
}
