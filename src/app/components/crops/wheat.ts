import { Crop } from './crop';
import { ItemType } from '../../enums/itemType.enum';

export class Wheat extends Crop {
    constructor (scene: Phaser.Scene, x: number, y: number, layerCrops: Phaser.Tilemaps.DynamicTilemapLayer) {
        let lootConfig = [
            {
                item: ItemType.Wheat,
                quantity: 1
            },
            {
                item: ItemType.WheatSeed,
                quantity: 1
            }
        ];
        super(scene, x, y, layerCrops, 1, 77, lootConfig);
    }
}