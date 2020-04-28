import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Potato Crop.
 */
export class Potato extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Potato,
        quantity: 1,
      },
      {
        item: ItemType.PotatoSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 20, 105, lootConfig);
  }
}
