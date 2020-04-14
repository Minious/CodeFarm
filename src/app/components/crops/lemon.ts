import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";

export class Lemon extends Crop {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
    let lootConfig = [
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
