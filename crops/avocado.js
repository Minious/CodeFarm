class Avocado extends Crop {
    constructor (scene, x, y, layerCrops) {
        let lootConfig = {
            'avocado': 1,
            'avocadoSeed': 1,
        };
        super(scene, x, y, layerCrops, 20, 112, lootConfig);
    }
}