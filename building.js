class Building extends Phaser.Physics.Arcade.Sprite {
    constructor (scene, x, y, baseTileIdx, size, foreground, colliderPosition, externalCallback) {
        super(scene, 0, 0, null, null);

        this.scene.physics.add.existing(this, true);

        this.mapPosition = new Phaser.Math.Vector2(x, y);
        this.baseTileIdx = baseTileIdx;
        this.size = size;
        this.foreground = foreground;

        this.setDisplaySize(this.size.x * 32, this.size.y * 32);

        this.updateTiles();

        let originTile = this.scene.layerObjectsBackground.getTileAt(this.mapPosition.x, this.mapPosition.y, true);
        this.worldPosition = new Phaser.Math.Vector2(originTile.getLeft(this.scene.cameras.main), originTile.getTop(this.scene.cameras.main));
        this.setPosition(this.worldPosition.x, this.worldPosition.y);
        this.setOrigin(0, 0);
        this.setVisible(false);

        this.setInteractive();
        this.input.alwaysEnabled = true;
        this.scene.input.enableDebug(this);
        this.on('pointerup', () => {
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
                let layer = i >= this.foreground.minX && i <= this.foreground.maxX && j >= this.foreground.minY && j <= this.foreground.maxY ? this.scene.layerObjectsForeground : this.scene.layerObjectsBackground;
                layer.putTileAt(this.baseTileIdx + i + j * 32, this.mapPosition.x + i, this.mapPosition.y + j);
            }
        }
    }
}