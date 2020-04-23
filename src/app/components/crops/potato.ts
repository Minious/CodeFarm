import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Potato extends Crop {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
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
    super(scene, x, y, layerCrops, 20, 105, lootConfig);
  }
}
