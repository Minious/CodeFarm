import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Wheat extends Crop {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
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
    super(scene, x, y, 1, 77, lootConfig);
  }
}
