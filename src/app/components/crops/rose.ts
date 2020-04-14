import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";
import { LootConfig } from "../../types/lootConfig.type";

export class Rose extends Crop {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
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
    super(scene, x, y, layerCrops, 60, 0, lootConfig);
  }
}
