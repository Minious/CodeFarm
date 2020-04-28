import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Wheat Crop.
 */
export class Wheat extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Wheat,
        quantity: 1,
      },
      {
        item: ItemType.WheatSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 1, 77, lootConfig);
  }
}
