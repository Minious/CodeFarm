class Orange extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'orange': 1,
            'orangeSeed': 1,
        };
        super(scene, x, y, layerCrops, 15, 119, lootConfig);
    }
}