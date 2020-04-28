import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Defines the Avocado Crop.
 */
export class Avocado extends Crop {
  public constructor(worldScene: WorldScene, x: number, y: number) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Avocado,
        quantity: 1,
      },
      {
        item: ItemType.AvocadoSeed,
        quantity: 1,
      },
    ];
    super(worldScene, x, y, 23, 112, lootConfig);
  }
}
