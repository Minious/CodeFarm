import { Crop } from '../crop';
import { ItemType } from '../enums/itemType.enum';

export class Orange extends Crop {
    constructor (scene: Phaser.Scene, x: number, y: number, layerCrops: Phaser.Tilemaps.DynamicTilemapLayer) {
        let lootConfig = [
            {
                item: ItemType.Orange,
                quantity: 1
            },
            {
                item: ItemType.OrangeSeed,
                quantity: 1
            }
        ];
        super(scene, x, y, layerCrops, 18, 119, lootConfig);
    }
}