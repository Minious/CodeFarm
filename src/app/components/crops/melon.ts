import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Melon extends Crop {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
    const lootConfig: LootConfig = [
      {
        item: ItemType.Melon,
        quantity: 1,
      },
      {
        item: ItemType.MelonSeed,
        quantity: 1,
      },
    ];
    super(scene, x, y, layerCrops, 40, 28, lootConfig);
  }
}
