import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Orange extends Crop {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
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
    super(scene, x, y, layerCrops, 18, 119, lootConfig);
  }
}
