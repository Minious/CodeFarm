import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Rose Crop.
 */
export class Rose extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Rose,
        quantity: 1,
      },
      {
        item: ItemType.RoseSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 60, 0, lootConfig);
  }
}
