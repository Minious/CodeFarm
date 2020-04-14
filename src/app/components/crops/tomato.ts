import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Tomato extends Crop {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
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
    super(scene, x, y, layerCrops, 10, 35, lootConfig);
  }
}
