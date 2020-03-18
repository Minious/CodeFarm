class Building extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, baseTileIdx, size, colliderPosition, externalCallback) {
        super(scene, 0, 0, null, null);

        this.scene.physics.add.existing(this, true);

        this.mapPosition = new Phaser.Math.Vector2(x, y);
        this.baseTileIdx = baseTileIdx;
        this.size = size;

        this.setDisplaySize(this.size.x * 32, this.size.y * 32);

        this.updateTiles();

        let originTile = this.scene.layerObjects.getTileAt(this.mapPosition.x, this.mapPosition.y);
        this.worldPosition = new Phaser.Math.Vector2(originTile.getLeft(this.scene.cameras.main), originTile.getTop(this.scene.cameras.main));
        this.setPosition(this.worldPosition.x, this.worldPosition.y);
        this.setOrigin(0, 0);
        this.setVisible(false);

        this.setInteractive();
        this.input.alwaysEnabled = true;
        this.scene.input.enableDebug(this);
        this.on('pointerdown', () => {
            externalCallback();
        });

        this.body.x = this.worldPosition.x;
        this.body.y = this.worldPosition.y;
        this.body.setOffset(colliderPosition.x, colliderPosition.y);
        this.body.width = colliderPosition.width;
        this.body.height = colliderPosition.height;
    }

    update(time, delta) {}

    updateTiles(){
        for(let i=0;i<this.size.x;i+=1){
            for(let j=0;j<this.size.y;j+=1){
                this.scene.layerObjects.putTileAt(this.baseTileIdx + i + j * 32, this.mapPosition.x + i, this.mapPosition.y + j);
            }
        }
    }
}