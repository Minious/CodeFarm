import { Crop } from './crop';
import { ItemType } from '../../enums/itemType.enum';

export class Melon extends Crop {
    constructor (scene: Phaser.Scene, x: number, y: number, layerCrops: Phaser.Tilemaps.DynamicTilemapLayer) {
        let lootConfig = [
            {
                item: ItemType.Melon,
                quantity: 1
            },
            {
                item: ItemType.MelonSeed,
                quantity: 1
            }
        ];
        super(scene, x, y, layerCrops, 40, 28, lootConfig);
    }
}