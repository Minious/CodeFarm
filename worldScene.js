class WorldScene extends Phaser.Scene {
    constructor() {
        super({
            key: "WorldScene"
        })

        this.speed = 400;
    }

    preload() {}

    create() {
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.crops = this.add.group();

        // this.cameras.main.setBackgroundColor('#DDDDDD')
        this.cameras.main.centerOn(0, 0);
        this.cameras.main.roundPixels = true;

        this.map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: 100,
            height: 100
        });
        var tileset = this.map.addTilesetImage('tileset', null);
        var cropsTileset = this.map.addTilesetImage('crops', null);

        const layerGround = this.map.createBlankDynamicLayer("Ground", tileset);
        layerGround.setScale(2);
        layerGround.setPosition(-1000, -1000);
        var deco = [501, 469, 470, 438];
        var level = Array(100).fill().map(() => 
            Array(100).fill().map(() => 
                Math.random() > 0.2 ? 502 : deco[Math.floor(Math.random() * deco.length)]
            )
        );
        layerGround.putTilesAt(level, 0, 0);

        const layerFields = this.map.createBlankDynamicLayer("Fields", tileset);
        layerFields.setScale(2);
        layerFields.setPosition(-1000, -1000);

        const layerCrops = this.map.createBlankDynamicLayer("Crops", cropsTileset);
        layerCrops.setScale(2);
        layerCrops.setPosition(-1000, -1000);

        const layerObjects = this.map.createBlankDynamicLayer("Objects", tileset);
        layerObjects.setScale(2);
        layerObjects.setPosition(-1000, -1000);

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
            this.actionClick(mousePos, layerFields, layerCrops);
        });
        this.input.on('pointerup', (pointer) => {
            this.player.body.stop();
            this.moving = false;
        });
        this.input.on('pointermove', () => {
            if(this.moving){
                let mousePos = new Phaser.Math.Vector2(
                    this.input.activePointer.worldX,
                    this.input.activePointer.worldY
                );
                this.actionClick(mousePos, layerFields, layerCrops);
            }
        })
    }

    movePlayerTo(target){
        this.moving = true;
        this.physics.moveToObject(this.player, target, 240);
    }

    getNeighborTiles(layer, tilePos){
        return this.getNeighbors(tilePos, layer.layer.width - 1, layer.layer.height - 1).map(neighborPos =>
            layer.getTileAt(neighborPos.x, neighborPos.y, true)
        );
    }

    getNeighbors(pos, maxColumns, maxRows, diamond=true, radius=1){
        let neighbors = [];
        for(let i = Math.max(0, pos.x - radius); i <= Math.min(pos.x + 1, maxRows); i += 1){
            for(let j = Math.max(0, pos.y - 1); j <= Math.min(pos.y + 1, maxColumns); j += 1){
                if(i != pos.x || j != pos.y){
                    if(diamond == false || Math.abs(pos.x - i) + Math.abs(pos.y - j) <= radius) {
                        neighbors.push({x: i, y: j});
                    }
                }
            }
        }
        return neighbors;
    }

    createFieldTile(layerFields, tilePos){
        this.updateFieldTile(layerFields, tilePos);
        this.getNeighborTiles(layerFields, tilePos)
        .filter(neighborTile => neighborTile.index != -1)
        .forEach(
            neighborTilePos => this.updateFieldTile(
                layerFields,
                {
                    x: neighborTilePos.x,
                    y: neighborTilePos.y
                }
            )
        );
    }

    updateFieldTile(layerFields, tilePos){
        let currentTile = layerFields.getTileAt(tilePos.x, tilePos.y, true)
        currentTile.rotation = 0;

        let neighborTilesPosOrder = [
            {x:  0, y: -1},
            {x:  1, y:  0},
            {x:  0, y:  1},
            {x: -1, y:  0},
        ];
        let neighborTiles = neighborTilesPosOrder.map(
            neighborTilePos => layerFields.getTileAt(tilePos.x + neighborTilePos.x, tilePos.y + neighborTilePos.y, true)
        );
        let areNeighborTilesFields = neighborTiles.map(
            neighborTile => neighborTile.index != -1
        );

        let tileIdx;
        if (areNeighborTilesFields.filter(e => e).length == 4){
            tileIdx = 197;
        } else if (areNeighborTilesFields.filter(e => e).length == 3){
            tileIdx = 196;
            currentTile.rotation = Math.PI * areNeighborTilesFields.indexOf(false) / 2;
        } else if (areNeighborTilesFields.filter(e => e).length == 2){
            if(areNeighborTilesFields[0] == areNeighborTilesFields[2]){
                tileIdx = 195;
                if(areNeighborTilesFields.indexOf(true) == 0) {
                    currentTile.rotation = Math.PI / 2;
                }
            } else {
                tileIdx = 194;
                let currentTileRotation = areNeighborTilesFields.indexOf(false) == 1 ? 3 : areNeighborTilesFields.indexOf(true);
                currentTile.rotation = Math.PI * currentTileRotation / 2;
            }
        } else if (areNeighborTilesFields.filter(e => e).length == 1){
            tileIdx = 193;
            currentTile.rotation = Math.PI * areNeighborTilesFields.indexOf(true) / 2;
        } else {
            tileIdx = 192
        }
        if(tileIdx)
            layerFields.putTileAt(tileIdx, tilePos.x, tilePos.y);
    }

    actionClick(mousePos, layerFields, layerCrops){
        if(this.moving){
            this.movePlayerTo(mousePos);
            return
        }
        let selectedItemInventoryIndex = this.game.scene.getScene('ControllerScene').data.get('selectedItemInventoryIndex');
        if(selectedItemInventoryIndex == undefined){
            this.wrongAction('no item selected', mousePos);
        } else {
            let tilePos = this.map.worldToTileXY(mousePos.x, mousePos.y);
            let selectedItemData = this.game.scene.getScene('ControllerScene').data.get('inventory')[selectedItemInventoryIndex];
            if(selectedItemData.name){
                let noField = layerFields.getTileAt(tilePos.x, tilePos.y, true).index == -1;
                if(noField){
                    if(selectedItemData.name == 'hoe'){
                        this.createFieldTile(layerFields, tilePos);
                    } else {
                        this.wrongAction("can't plant here", mousePos);
                    }
                } else {
                    if(selectedItemData.name == 'hoe'){
                        this.wrongAction("tile already a plot", mousePos);
                    } else if(selectedItemData.name == 'scythe'){
                        let crop = this.crops.getChildren().filter(crop => crop.mapPosition.x == tilePos.x && crop.mapPosition.y == tilePos.y)[0];
                        if(crop && crop.state == 4){
                            layerCrops.removeTileAt(tilePos.x, tilePos.y);

                            let inventory = this.game.scene.getScene('ControllerScene').data.get('inventory');

                            let diffuseConeAngle = Math.PI / 4;
                            Object.entries(crop.lootConfig).forEach(([item, quantity], i, arr) => {
                                let angle = - Math.PI / 2 + diffuseConeAngle / 2 - (diffuseConeAngle * (i / (arr.length - 1)));
                                let lootAnim = new LootAnim(this, mousePos.x, mousePos.y, 0, 0, angle, item, quantity);
                                lootAnim.setScale(2);
                                this.add.existing(lootAnim);

                                if(inventory.map(inventoryItemData => inventoryItemData.name).includes(item)){
                                    let sameItemInInventoryIdx = inventory.findIndex(inventoryItemData => inventoryItemData.name == item);
                                    this.game.scene.getScene('ControllerScene').modifyInventoryItemQuantity(sameItemInInventoryIdx, quantity);
                                } else {
                                    let firstEmptyCellIdx = inventory.findIndex(inventoryItemData => Object.keys(inventoryItemData).length == 0);
                                    if(firstEmptyCellIdx) {
                                        let itemData = {
                                            name: item,
                                            quantity: quantity
                                        };
                                        this.game.scene.getScene('ControllerScene').setInventoryItemAt(firstEmptyCellIdx, itemData);
                                    } else {
                                        console.log("no space available in inventory")
                                    }
                                }
                            });
                            crop.destroy(this);
                        } else {
                            this.wrongAction("crop not ready", mousePos);
                        }
                    } else {
                        let emptyField = !this.crops.getChildren().some(crop => tilePos.x == crop.mapPosition.x && tilePos.y == crop.mapPosition.y)
                        if(emptyField){
                            let selectedCropToCropConstructor = {
                                avocadoSeed:  Avocado,
                                grapesSeed:  Grapes,
                                lemonSeed:  Lemon,
                                melonSeed:  Melon,
                                orangeSeed:  Orange,
                                potatoSeed:  Potato,
                                roseSeed:  Rose,
                                strawberrySeed:  Strawberry,
                                tomatoSeed:  Tomato,
                                wheatSeed:  Wheat,
                            }
                            if(selectedItemData.name in selectedCropToCropConstructor ){
                                let cropConstructor = selectedCropToCropConstructor[selectedItemData.name];
                                let crop = new cropConstructor(this, tilePos.x, tilePos.y, layerCrops);
                                this.crops.add(crop);
                                this.game.scene.getScene('ControllerScene').modifyInventoryItemQuantity(selectedItemInventoryIndex, -1);
                            }
                        } else {
                            this.wrongAction("field already occupied", mousePos);
                        }
                    }
                }
            } else {
                this.wrongAction('no item in slot', mousePos);
            }
        }
    }

    wrongAction(message, mousePos){
        console.log(message);
        this.game.scene.getScene('UiScene').deselectButtonInventoryBar();
        this.movePlayerTo(mousePos);
    }

    update(time, delta) {
        let playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y)
        if (this.player.body.velocity.length() > 0){
            let moveDirection = new Phaser.Math.Vector2(this.player.body.velocity).normalize();
    
            if (Math.abs(moveDirection.x) > Math.abs(moveDirection.y)){
                if(moveDirection.x > 0) {
                    this.player.anims.play('right', true);
                } else {
                    this.player.anims.play('left', true);
                }
            } else {
                if (moveDirection.y > 0) {
                    this.player.anims.play('down', true);
                } else {
                    this.player.anims.play('up', true);
                }
            }
        } else {
            this.player.anims.play('turn', true);
        }

        this.cameras.main.centerOn(Math.round(this.player.x), Math.round(this.player.y - 15));

        this.crops.getChildren().forEach(crop => crop.update(time, delta));

        // this.game.scene.pause('mainScene');
    }

}
