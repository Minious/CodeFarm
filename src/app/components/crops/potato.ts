import { Crop } from "./crop";
import { ItemType } from "../../enums/itemType.enum";

export class Potato extends Crop {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    layerCrops: Phaser.Tilemaps.DynamicTilemapLayer
  ) {
    let lootConfig = [
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
