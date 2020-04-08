import { Crop } from '../crop';

export class Orange extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'orange': 1,
            'orangeSeed': 1,
        };
        super(scene, x, y, layerCrops, 18, 119, lootConfig);
    }
}