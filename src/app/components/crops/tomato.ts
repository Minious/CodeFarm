import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Tomato Crop.
 */
export class Tomato extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Tomato,
        quantity: 1,
      },
      {
        item: ItemType.TomatoSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 10, 35, lootConfig);
  }
}
