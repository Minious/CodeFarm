import { Crop } from '../crop';

export class Avocado extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'avocado': 1,
            'avocadoSeed': 1,
        };
        super(scene, x, y, layerCrops, 23, 112, lootConfig);
    }
}