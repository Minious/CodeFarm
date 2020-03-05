class Scene1 extends Phaser.Scene {
    constructor() {
      super("codefarmScene");

      this.playerDest = new Phaser.Math.Vector2();
      this.speed = 400;
    }

    preload() {
        this.load.image('test', 'assets/test.png');
        this.load.image('tileset', 'assets/tileset.png');
        this.load.image('crops', 'assets/crops_tileset.png');
        this.load.image('ui_button', 'assets/ui_button.png');
        this.load.spritesheet('player', 
            'assets/tileset.png',
            { frameWidth: 32, frameHeight: 32 }
        );
    }

    create() {
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        // this.data.set('crops', []);
        this.crops = this.add.group();

        // this.cameras.main.setBackgroundColor('#DDDDDD')
        this.cameras.main.centerOn(0, 0);
        this.cameras.main.roundPixels = true;

        var map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: 100,
            height: 100
        });
        var tileset = map.addTilesetImage('tileset', null, 16, 16);
        var cropsTileset = map.addTilesetImage('crops', null, 16, 16);

        const layerGround = map.createBlankDynamicLayer("Ground", tileset);
        layerGround.setScale(2);
        layerGround.setPosition(-1000, -1000);
        var deco = [501, 469, 470, 438];
        var level = Array(100).fill().map(() => 
            Array(100).fill().map(() => 
                Math.random() > 0.2 ? 502 : deco[Math.floor(Math.random() * deco.length)]
            )
        );
        layerGround.putTilesAt(level, 0, 0);

        const layerFields = map.createBlankDynamicLayer("Fields", tileset);
        layerFields.setScale(2);
        layerFields.setPosition(-1000, -1000);

        const layerCrops = map.createBlankDynamicLayer("Crops", cropsTileset);
        layerCrops.setScale(2);
        layerCrops.setPosition(-1000, -1000);

        const layerObjects = map.createBlankDynamicLayer("Objects", tileset);
        layerObjects.setScale(2);
        layerObjects.setPosition(-1000, -1000);

        // sprite = this.physics.add.sprite(0, 0, 'test');
        this.player = this.physics.add.sprite(0, 0, 'player');

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'player', frame: 9 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 57, end: 60 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 41, end: 44 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 25, end: 28 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
            frameRate: 10,
            repeat: -1
        });

        this.player.setScale(2);
        this.player.setOrigin(0.5, 1);

        this.input.on('pointerdown', (pointer) => {
            let mousePos = new Phaser.Math.Vector2(
                this.input.activePointer.worldX,
                this.input.activePointer.worldY
            );
            if (pointer.leftButtonDown()) {
                this.playerDest = mousePos;
            } else if (pointer.rightButtonDown()) {
                let tilePos = map.worldToTileXY(mousePos.x, mousePos.y);

                let emptyField = !this.crops.getChildren().some(crop => tilePos.x == crop.mapPosition.x && tilePos.y == crop.mapPosition.y)

                if(emptyField){
                    let wheatCrop = new Wheat(this, tilePos.x, tilePos.y, layerCrops);
                    this.crops.add(wheatCrop);

                    layerFields.putTileAt(192, tilePos.x, tilePos.y);
                }
            }
        });

        let uiButton = new UiButton(this, 0, 0);
        this.add.existing(uiButton);
    }

    update(time, delta) {
        let playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y)
        if (!this.playerDest.equals(playerPos)){
            let move = new Phaser.Math.Vector2(this.playerDest).subtract(playerPos);
            let distance = Phaser.Math.Distance.BetweenPoints(this.playerDest, this.player);
            let travelledDistance = this.speed * delta / 1000;
            let newPlayerPos;
            if (travelledDistance > distance){
                newPlayerPos = new Phaser.Math.Vector2(this.playerDest);
            } else {
                let travelledRatio = travelledDistance / distance;
                newPlayerPos = new Phaser.Math.Vector2(move).scale(travelledRatio).add(playerPos);
            }
            this.player.setPosition(newPlayerPos.x, newPlayerPos.y);
    
            let normalizedMove = new Phaser.Math.Vector2(move).normalize();
    
            if (Math.abs(normalizedMove.x) > Math.abs(normalizedMove.y)){
                if(normalizedMove.x > 0) {
                    this.player.anims.play('right', true);
                } else {
                    this.player.anims.play('left', true);
                }
            } else {
                if (normalizedMove.y > 0) {
                    this.player.anims.play('down', true);
                } else {
                    this.player.anims.play('up', true);
                }
            }
        } else {
            this.player.anims.play('turn', true);
        }

        this.cameras.main.centerOn(Math.round(this.player.x), Math.round(this.player.y - 15));

        // this.data.get('crops').forEach(crop => crop.update(time, delta));
        this.crops.getChildren().forEach(crop => crop.update(time, delta));

        // console.log(this.make.updateList)
        // this.game.scene.pause('mainScene');
    }

}
