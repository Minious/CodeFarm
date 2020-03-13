class Crop extends Phaser.GameObjects.GameObject {
    constructor (scene, x, y, layerCrops, growthDuration, baseTileIdx, lootConfig) {
        super(scene, null);

        this.mapPosition = new Phaser.Math.Vector2(x, y);
        this.layerCrops = layerCrops;
        this.state = 0;
        this.growth = 0;
        this.growthDuration = growthDuration;
        this.nbSteps = 5;
        this.growthRate = (this.nbSteps - 1) / growthDuration;
        this.baseTileIdx = baseTileIdx;
        this.lootConfig = lootConfig;

        this.updateTile();
    }

    update(time, delta) {
        if(this.state < 4){
            this.growth += this.growthRate * delta / 1000;
            if(this.growth >= 1){
                this.growth -= 1;
                this.state += 1;
                this.updateTile();
            }
        }
    }

    updateTile(){
        this.layerCrops.putTileAt(this.baseTileIdx + this.state, this.mapPosition.x, this.mapPosition.y);
    }
}