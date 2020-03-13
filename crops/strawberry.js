class Strawberry extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'strawberry': 1,
            'strawberrySeed': 1,
        };
        super(scene, x, y, layerCrops, 25, 91, lootConfig);
    }
}