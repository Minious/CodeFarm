import { Crop } from '../crop';
import { ItemType } from '../enums/itemType.enum';

export class Rose extends Crop {
    constructor (scene: Phaser.Scene, x: number, y: number, layerCrops: Phaser.Tilemaps.DynamicTilemapLayer) {
        let lootConfig = [
            {
                item: ItemType.Rose,
                quantity: 1
            },
            {
                item: ItemType.RoseSeed,
                quantity: 1
            }
        ];
        super(scene, x, y, layerCrops, 60, 0, lootConfig);
    }
}