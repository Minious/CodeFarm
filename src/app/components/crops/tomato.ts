import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";

export class Tomato extends Crop {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
    let lootConfig = [
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
