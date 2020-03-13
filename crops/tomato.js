class Tomato extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'tomato': 1,
            'tomatoSeed': 1,
        };
        super(scene, x, y, layerCrops, 10, 35, lootConfig);
    }
}