class Potato extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'potato': 1,
            'potatoSeed': 1,
        };
        super(scene, x, y, layerCrops, 20, 105, lootConfig);
    }
}