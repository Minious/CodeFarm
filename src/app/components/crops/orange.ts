import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Orange Crop.
 */
export class Orange extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Orange,
        quantity: 1,
      },
      {
        item: ItemType.OrangeSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 18, 119, lootConfig);
  }
}
