import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Lemon Crop.
 */
export class Lemon extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Lemon,
        quantity: 1,
      },
      {
        item: ItemType.LemonSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 15, 42, lootConfig);
  }
}
