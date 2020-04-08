import * as Phaser from "phaser";

import { Market } from './market';
import { Utils } from './utils';
import { ActionPopup } from './actionPopup';
import { LootAnim } from './lootAnim';

import { Avocado } from './crops/avocado';
import { Grapes } from './crops/grapes';
import { Lemon } from './crops/lemon';
import { Melon } from './crops/melon';
import { Orange } from './crops/orange';
import { Potato } from './crops/potato';
import { Rose } from './crops/rose';
import { Strawberry } from './crops/strawberry';
import { Tomato } from './crops/tomato';
import { Wheat } from './crops/wheat';

export class WorldScene extends Phaser.Scene {
    constructor() {
        super({
            key: "WorldScene"
        })

        this.speed = 240;
        this.lengthJoystick = 25;
    }

    preload() {}

    create() {
        // game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.crops = this.add.group();
        this.objects = this.add.group();

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

        this.layerGround = this.map.createBlankDynamicLayer("Ground", tileset);
        this.layerGround.setScale(2);
        this.layerGround.setPosition(-1000, -1000);
        var deco = [501, 469, 470, 438];
        var level = Array(100).fill().map(() => 
            Array(100).fill().map(() => 
                Math.random() > 0.2 ? 502 : deco[Math.floor(Math.random() * deco.length)]
            )
        );
        this.layerGround.putTilesAt(level, 0, 0);

        this.layerFields = this.map.createBlankDynamicLayer("Fields", tileset);
        this.layerFields.setScale(2);
        this.layerFields.setPosition(-1000, -1000);

        this.layerCrops = this.map.createBlankDynamicLayer("Crops", cropsTileset);
        this.layerCrops.setScale(2);
        this.layerCrops.setPosition(-1000, -1000);

        this.layerObjectsBackground = this.map.createBlankDynamicLayer("Objects", tileset);
        this.layerObjectsBackground.setScale(2);
        this.layerObjectsBackground.setPosition(-1000, -1000);

        this.layerObjectsForeground = this.map.createBlankDynamicLayer("ObjectsForeground", tileset);
        this.layerObjectsForeground.setScale(2);
        this.layerObjectsForeground.setPosition(-1000, -1000);
        this.layerObjectsForeground.setDepth(100)

        this.player = this.physics.add.sprite(0, 0, 'player');
        this.player.setSize(12, 12);
        this.player.setOffset(this.player.width / 2 - this.player.body.width / 2, this.player.height - this.player.body.height);

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

        this.actionPopup;
        this.popupClicked = false;

        this.input.on('pointerdown', (pointer) => {
            let mousePos = new Phaser.Math.Vector2(
                this.input.activePointer.x,
                this.input.activePointer.y
            );

            this.joystickPos = mousePos;
        });
        this.input.on('pointerup', (pointer) => {
            this.player.body.stop();
            this.joystickPos = undefined;
            let mousePos = new Phaser.Math.Vector2(
                this.input.activePointer.x,
                this.input.activePointer.y
            );
            if(this.moving){
                this.moving = false;
                this.game.scene.getScene('UiScene').hideJoystick();
            } else {
                let mouseWorldPos = new Phaser.Math.Vector2(
                    this.input.activePointer.worldX,
                    this.input.activePointer.worldY
                );
                if(this.popupClicked){
                    this.popupClicked = false;
                } else {
                    this.destroyPopup();
                    this.actionClick(mouseWorldPos);
                }
            }
        });
        this.input.on('pointermove', () => {
            if(this.joystickPos){
                this.game.scene.getScene('UiScene').showJoystick();

                let mousePos = new Phaser.Math.Vector2(
                    this.input.activePointer.x,
                    this.input.activePointer.y
                );
                let distanceJoystick = mousePos.distance(this.joystickPos);
                if(distanceJoystick > this.lengthJoystick){
                    let newJoystickPos = mousePos.clone().add(this.joystickPos.clone().subtract(mousePos).scale(this.lengthJoystick).scale(1 / distanceJoystick))
                    this.joystickPos = newJoystickPos;
                }
                let joystickMove = mousePos.clone().subtract(this.joystickPos);
                let playerTarget = new Phaser.Math.Vector2(this.player.x, this.player.y).add(joystickMove);
                let speedFactor = Utils.clamp(distanceJoystick / this.lengthJoystick, 0, 1);

                this.moving = true;
                this.movePlayerTo(playerTarget, speedFactor);

                this.game.scene.getScene('UiScene').setPositionJoystick(this.joystickPos, mousePos);
            }
        })

        let posMarket = {x: 30, y: 30};
        this.createBuilding('market', posMarket);

        this.physics.add.collider(this.player, this.objects);

        this.physics.world.createDebugGraphic();
    }

    createBuilding(buildingName, pos){
        let buildingNameToConstructor = {
            market: Market
        }
        if(buildingName in buildingNameToConstructor){
            let buildingConstructor = buildingNameToConstructor[buildingName];
            let building = new buildingConstructor(this, pos.x, pos.y);
            this.objects.add(building);
            this.add.existing(building);
        }
    }

    movePlayerTo(target, speedFactor){
        this.physics.moveToObject(this.player, target, this.speed * speedFactor);
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

    destroyPopup(){
        if(this.actionPopup){
            this.input.removeDebug(this.actionPopup);
            this.actionPopup.destroy();
        }
    }

    harvestCrop(tilePos, crop){
        let tile = this.layerCrops.getTileAt(tilePos.x, tilePos.y);

        let inventory = this.game.scene.getScene('ControllerScene').data.get('inventory');

        let diffuseConeAngle = Math.PI / 4;
        Object.entries(crop.lootConfig).forEach(([item, quantity], i, arr) => {
            let angle = - Math.PI / 2 + diffuseConeAngle / 2 - (diffuseConeAngle * (i / (arr.length - 1)));
            let lootAnim = new LootAnim(this, tile.getCenterX(this.cameras.main), tile.getCenterY(this.cameras.main), 0, 0, angle, item, quantity);
            lootAnim.setScale(2);
            this.add.existing(lootAnim);

            if(inventory.map(inventoryItemData => inventoryItemData.name).includes(item)){
                this.game.scene.getScene('ControllerScene').modifyInventoryItemQuantity(item, quantity);
            } else {
                let firstEmptyCellIdx = inventory.findIndex(inventoryItemData => Object.keys(inventoryItemData).length == 0);
                if(firstEmptyCellIdx != -1) {
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
        this.layerCrops.removeTileAt(tilePos.x, tilePos.y);
        crop.destroy();
    }

    actionClick(mouseWorldPos){
        let tilePos = this.map.worldToTileXY(mouseWorldPos.x, mouseWorldPos.y);
        let layerFieldsTile = this.layerFields.getTileAt(tilePos.x, tilePos.y, true);

        let noField = !this.layerFields.hasTileAt(tilePos.x, tilePos.y);
        if(noField){
            this.actionPopup = new ActionPopup(this, layerFieldsTile.getCenterX(this.cameras.main), layerFieldsTile.getCenterY(this.cameras.main), 40, () => this.createFieldTile(this.layerFields, tilePos), 'tools', 1);
            this.add.existing(this.actionPopup);

        } else {
            let emptyField = !this.crops.getChildren().some(crop => tilePos.x == crop.mapPosition.x && tilePos.y == crop.mapPosition.y)

            let selectedItemInventoryIndex = this.game.scene.getScene('ControllerScene').data.get('selectedItemInventoryIndex');
            let selectedItemData = this.game.scene.getScene('ControllerScene').data.get('inventory')[selectedItemInventoryIndex];
            
            if(emptyField && selectedItemData && selectedItemData.name){
                let selectedItemData = this.game.scene.getScene('ControllerScene').data.get('inventory')[selectedItemInventoryIndex];
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

                    let callback = () => {
                        let crop = new cropConstructor(this, tilePos.x, tilePos.y, this.layerCrops);
                        this.crops.add(crop);
                        this.game.scene.getScene('ControllerScene').modifyInventoryItemQuantityByIndex(selectedItemInventoryIndex, -1);
                    }

                    let itemData = this.game.scene.getScene('ControllerScene').LIST_ITEM[selectedItemData.name];
                    this.actionPopup = new ActionPopup(this, layerFieldsTile.getCenterX(this.cameras.main), layerFieldsTile.getCenterY(this.cameras.main), 40, callback, itemData.texture, itemData.frame);
                    this.add.existing(this.actionPopup);
                }
            } else {
                let crop = this.crops.getChildren().filter(crop => crop.mapPosition.x == tilePos.x && crop.mapPosition.y == tilePos.y)[0];
                if(crop && crop.state == 4){
                    this.actionPopup = new ActionPopup(this, layerFieldsTile.getCenterX(this.cameras.main), layerFieldsTile.getCenterY(this.cameras.main), 40, () => this.harvestCrop(tilePos, crop), 'tools', 0);
                    this.add.existing(this.actionPopup);
                }
            }
        }
    }

    update(time, delta) {
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
        this.objects.getChildren().forEach(object => object.update(time, delta));

        // this.game.scene.pause('mainScene');
    }

}
