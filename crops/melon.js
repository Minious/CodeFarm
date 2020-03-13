class Melon extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'melon': 1,
            'melonSeed': 1,
        };
        super(scene, x, y, layerCrops, 40, 28, lootConfig);
    }
}