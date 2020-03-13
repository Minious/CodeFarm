class Wheat extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'wheat': 1,
            'wheatSeed': 1,
        };
        super(scene, x, y, layerCrops, 1, 77, lootConfig);
    }
}