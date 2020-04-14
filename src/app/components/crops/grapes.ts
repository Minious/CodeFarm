import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";

export class Grapes extends Crop {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
    let lootConfig = [
      {
        item: ItemType.Grapes,
        quantity: 1,
      },
      {
        item: ItemType.GrapesSeed,
        quantity: 1,
      },
    ];
    super(scene, x, y, layerCrops, 50, 70, lootConfig);
  }
}
