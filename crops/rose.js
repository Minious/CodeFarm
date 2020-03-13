class Rose extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'rose': 1,
            'roseSeed': 1,
        };
        super(scene, x, y, layerCrops, 60, 0, lootConfig);
    }
}