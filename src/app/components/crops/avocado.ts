import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Avocado extends Crop {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
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
    super(scene, x, y, 23, 112, lootConfig);
  }
}
