class Lemon extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'lemon': 1,
            'lemonSeed': 1,
        };
        super(scene, x, y, layerCrops, 15, 42, lootConfig);
    }
}