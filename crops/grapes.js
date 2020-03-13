class Grapes extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'grapes': 1,
            'grapesSeed': 1,
        };
        super(scene, x, y, layerCrops, 50, 70, lootConfig);
    }
}