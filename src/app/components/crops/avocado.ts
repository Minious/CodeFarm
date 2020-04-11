import { Crop } from './crop';
import { ItemType } from '../../enums/itemType.enum';

export class Avocado extends Crop {
    constructor (scene: Phaser.Scene, x: number, y: number, layerCrops: Phaser.Tilemaps.DynamicTilemapLayer) {
        let lootConfig = [
            {
                item: ItemType.Avocado,
                quantity: 1
            },
            {
                item: ItemType.AvocadoSeed,
                quantity: 1
            }
        ];
        super(scene, x, y, layerCrops, 23, 112, lootConfig);
    }
}