import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";

export class Strawberry extends Crop {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
    let lootConfig = [
      {
        item: ItemType.Strawberry,
        quantity: 1,
      },
      {
        item: ItemType.StrawberrySeed,
        quantity: 1,
      },
    ];
    super(scene, x, y, layerCrops, 25, 91, lootConfig);
  }
}
