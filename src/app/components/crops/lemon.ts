import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Lemon extends Crop {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
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
    super(scene, x, y, layerCrops, 15, 42, lootConfig);
  }
}
