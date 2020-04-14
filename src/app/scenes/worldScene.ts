import * as Phaser from "phaser";

import { Utils } from "../utils/utils";
import { ActionPopup } from "../components/worldWidgets/actionPopup";
import { LootAnim } from "../components/worldWidgets/lootAnim";

import { Vector2 } from "../types/vector2.type";
import { UiScene } from "./uiScene";
import {
  BuildingType,
  getBuildingConstructor,
} from "../enums/buildingType.enum";
import { Crop } from "../components/crops/crop";
import { ControllerScene } from "./controllerScene";
import { getCropFromSeed } from "../enums/itemType.enum";
import { getItemData } from "../interfaces/itemData.interface";

export class WorldScene extends Phaser.Scene {
  private _layerObjectsBackground: Phaser.Tilemaps.DynamicTilemapLayer;
  private _layerObjectsForeground: Phaser.Tilemaps.DynamicTilemapLayer;
  private _popupClicked: boolean;
  private speed = 240;
  private crops: Phaser.GameObjects.Group;
  private objects: Phaser.GameObjects.Group;
  private map: Phaser.Tilemaps.Tilemap;
  private layerGround: Phaser.Tilemaps.DynamicTilemapLayer;
  private layerFields: Phaser.Tilemaps.DynamicTilemapLayer;
  private layerCrops: Phaser.Tilemaps.DynamicTilemapLayer;
  private player: Phaser.Physics.Arcade.Sprite;
  private lengthJoystick: number = 25;
  private joystickPos: Vector2;
  private moving: boolean;
  private actionPopup: ActionPopup;

  get layerObjectsBackground() {
    return this._layerObjectsBackground;
  }

  get layerObjectsForeground() {
    return this._layerObjectsForeground;
  }

  set popupClicked(popupClicked: boolean) {
    this._popupClicked = popupClicked;
  }

  constructor() {
    super({
      key: "WorldScene",
    });
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
      height: 100,
    });
    var tileset = this.map.addTilesetImage("tileset", null);
    var cropsTileset = this.map.addTilesetImage("crops", null);

    this.layerGround = this.map.createBlankDynamicLayer("Ground", tileset);
    this.layerGround.setScale(2);
    this.layerGround.setPosition(-1000, -1000);
    var deco = [501, 469, 470, 438];
    var level = Array(100)
      .fill(undefined)
      .map(() =>
        Array(100)
          .fill(undefined)
          .map(() =>
            Math.random() > 0.2
              ? 502
              : deco[Math.floor(Math.random() * deco.length)]
          )
      );
    this.layerGround.putTilesAt(level, 0, 0);

    this.layerFields = this.map.createBlankDynamicLayer("Fields", tileset);
    this.layerFields.setScale(2);
    this.layerFields.setPosition(-1000, -1000);

    this.layerCrops = this.map.createBlankDynamicLayer("Crops", cropsTileset);
    this.layerCrops.setScale(2);
    this.layerCrops.setPosition(-1000, -1000);

    this._layerObjectsBackground = this.map.createBlankDynamicLayer(
      "Objects",
      tileset
    );
    this._layerObjectsBackground.setScale(2);
    this._layerObjectsBackground.setPosition(-1000, -1000);

    this._layerObjectsForeground = this.map.createBlankDynamicLayer(
      "ObjectsForeground",
      tileset
    );
    this._layerObjectsForeground.setScale(2);
    this._layerObjectsForeground.setPosition(-1000, -1000);
    this._layerObjectsForeground.setDepth(100);

    this.player = this.physics.add.sprite(0, 0, "player");
    this.player.setSize(12, 12);
    this.player.setOffset(
      this.player.width / 2 - this.player.body.width / 2,
      this.player.height - this.player.body.height
    );

    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 9 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 57, end: 60 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 41, end: 44 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", { start: 25, end: 28 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", { start: 9, end: 12 }),
      frameRate: 10,
      repeat: -1,
    });

    this.player.setScale(2);
    this.player.setOrigin(0.5, 1);

    this._popupClicked = false;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      let mousePos = new Phaser.Math.Vector2(
        this.input.activePointer.x,
        this.input.activePointer.y
      );

      this.joystickPos = mousePos;
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.player.body.stop();
      this.joystickPos = undefined;
      let mousePos = new Phaser.Math.Vector2(
        this.input.activePointer.x,
        this.input.activePointer.y
      );
      if (this.moving) {
        this.moving = false;
        (this.game.scene.getScene("UiScene") as UiScene).hideJoystick();
      } else {
        let mouseWorldPos = new Phaser.Math.Vector2(
          this.input.activePointer.worldX,
          this.input.activePointer.worldY
        );
        if (this._popupClicked) {
          this._popupClicked = false;
        } else {
          this.destroyPopup();
          this.actionClick(mouseWorldPos);
        }
      }
    });
    this.input.on("pointermove", () => {
      if (this.joystickPos) {
        (this.game.scene.getScene("UiScene") as UiScene).showJoystick();

        let mousePos = new Phaser.Math.Vector2(
          this.input.activePointer.x,
          this.input.activePointer.y
        );
        let joystickPosPhaserVector2 = new Phaser.Math.Vector2(
          this.joystickPos.x,
          this.joystickPos.y
        );
        let distanceJoystick = mousePos.distance(joystickPosPhaserVector2);
        if (distanceJoystick > this.lengthJoystick) {
          let newJoystickPos = mousePos.clone().add(
            joystickPosPhaserVector2
              .clone()
              .subtract(mousePos)
              .scale(this.lengthJoystick)
              .scale(1 / distanceJoystick)
          );
          this.joystickPos = newJoystickPos;
        }
        let joystickMove = mousePos.clone().subtract(joystickPosPhaserVector2);
        let playerTarget = new Phaser.Math.Vector2(
          this.player.x,
          this.player.y
        ).add(joystickMove);
        let speedFactor = Utils.clamp(
          distanceJoystick / this.lengthJoystick,
          0,
          1
        );

        this.moving = true;
        this.movePlayerTo(playerTarget, speedFactor);

        (this.game.scene.getScene("UiScene") as UiScene).setPositionJoystick(
          this.joystickPos,
          mousePos
        );
      }
    });

    let posMarket = { x: 30, y: 30 };
    this.createBuilding(BuildingType.Market, posMarket);

    this.physics.add.collider(this.player, this.objects);

    this.physics.world.createDebugGraphic();
  }

  createBuilding(buildingType: BuildingType, pos: Vector2) {
    let buildingConstructor = getBuildingConstructor(buildingType);
    let building = new buildingConstructor(this, pos.x, pos.y);
    this.objects.add(building);
    this.add.existing(building);
  }

  movePlayerTo(target: Vector2, speedFactor: number) {
    this.physics.moveToObject(this.player, target, this.speed * speedFactor);
  }

  getNeighborTiles(
    layer: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ) {
    return this.getNeighbors(
      tilePos,
      layer.layer.width - 1,
      layer.layer.height - 1
    ).map((neighborPos) => layer.getTileAt(neighborPos.x, neighborPos.y, true));
  }

  getNeighbors(
    pos: Vector2,
    maxColumns: number,
    maxRows: number,
    diamond = true,
    radius = 1
  ) {
    let neighbors = [];
    for (
      let i = Math.max(0, pos.x - radius);
      i <= Math.min(pos.x + 1, maxRows);
      i += 1
    ) {
      for (
        let j = Math.max(0, pos.y - 1);
        j <= Math.min(pos.y + 1, maxColumns);
        j += 1
      ) {
        if (i != pos.x || j != pos.y) {
          if (
            diamond == false ||
            Math.abs(pos.x - i) + Math.abs(pos.y - j) <= radius
          ) {
            neighbors.push({ x: i, y: j });
          }
        }
      }
    }
    return neighbors;
  }

  createFieldTile(
    layerFields: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ) {
    this.updateFieldTile(layerFields, tilePos);
    this.getNeighborTiles(layerFields, tilePos)
      .filter((neighborTile) => neighborTile.index != -1)
      .forEach((neighborTilePos) =>
        this.updateFieldTile(layerFields, {
          x: neighborTilePos.x,
          y: neighborTilePos.y,
        })
      );
  }

  updateFieldTile(
    layerFields: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ) {
    let currentTile = layerFields.getTileAt(tilePos.x, tilePos.y, true);
    currentTile.rotation = 0;

    let neighborTilesPosOrder = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    let neighborTiles = neighborTilesPosOrder.map((neighborTilePos) =>
      layerFields.getTileAt(
        tilePos.x + neighborTilePos.x,
        tilePos.y + neighborTilePos.y,
        true
      )
    );
    let areNeighborTilesFields = neighborTiles.map(
      (neighborTile) => neighborTile.index != -1
    );

    let tileIdx;
    if (areNeighborTilesFields.filter((e) => e).length == 4) {
      tileIdx = 197;
    } else if (areNeighborTilesFields.filter((e) => e).length == 3) {
      tileIdx = 196;
      currentTile.rotation =
        (Math.PI * areNeighborTilesFields.indexOf(false)) / 2;
    } else if (areNeighborTilesFields.filter((e) => e).length == 2) {
      if (areNeighborTilesFields[0] == areNeighborTilesFields[2]) {
        tileIdx = 195;
        if (areNeighborTilesFields.indexOf(true) == 0) {
          currentTile.rotation = Math.PI / 2;
        }
      } else {
        tileIdx = 194;
        let currentTileRotation =
          areNeighborTilesFields.indexOf(false) == 1
            ? 3
            : areNeighborTilesFields.indexOf(true);
        currentTile.rotation = (Math.PI * currentTileRotation) / 2;
      }
    } else if (areNeighborTilesFields.filter((e) => e).length == 1) {
      tileIdx = 193;
      currentTile.rotation =
        (Math.PI * areNeighborTilesFields.indexOf(true)) / 2;
    } else {
      tileIdx = 192;
    }
    if (tileIdx) layerFields.putTileAt(tileIdx, tilePos.x, tilePos.y);
  }

  destroyPopup() {
    if (this.actionPopup) {
      this.input.removeDebug(this.actionPopup);
      this.actionPopup.destroy();
    }
  }

  harvestCrop(tilePos: Vector2, crop: Crop) {
    let tile = this.layerCrops.getTileAt(tilePos.x, tilePos.y);

    let diffuseConeAngle = Math.PI / 4;
    crop.lootConfig.forEach((loot, i, arr) => {
      let angle =
        -Math.PI / 2 +
        diffuseConeAngle / 2 -
        diffuseConeAngle * (i / (arr.length - 1));
      let lootAnim = new LootAnim(
        this,
        tile.getCenterX(this.cameras.main),
        tile.getCenterY(this.cameras.main),
        0,
        0,
        angle,
        loot.item,
        loot.quantity
      );
      lootAnim.setScale(2);
      this.add.existing(lootAnim);

      (this.game.scene.getScene(
        "ControllerScene"
      ) as ControllerScene).modifyInventoryItemQuantity(
        loot.item,
        loot.quantity
      );
    });
    this.layerCrops.removeTileAt(tilePos.x, tilePos.y);
    crop.destroy();
  }

  actionClick(mouseWorldPos: Vector2) {
    let tilePos = this.map.worldToTileXY(mouseWorldPos.x, mouseWorldPos.y);
    let layerFieldsTile = this.layerFields.getTileAt(
      tilePos.x,
      tilePos.y,
      true
    );

    let noField = !this.layerFields.hasTileAt(tilePos.x, tilePos.y);
    if (noField) {
      this.actionPopup = new ActionPopup(
        this,
        layerFieldsTile.getCenterX(this.cameras.main),
        layerFieldsTile.getCenterY(this.cameras.main),
        40,
        () => this.createFieldTile(this.layerFields, tilePos),
        "tools",
        1
      );
      this.add.existing(this.actionPopup);
    } else {
      let emptyField = !this.crops
        .getChildren()
        .some(
          (crop: Crop) =>
            tilePos.x == crop.mapPosition.x && tilePos.y == crop.mapPosition.y
        );

      let selectedInventoryItemData = (this.game.scene.getScene(
        "ControllerScene"
      ) as ControllerScene).getSelectedInventoryItemData();
      if (emptyField && selectedInventoryItemData) {
        let cropConstructor = getCropFromSeed(selectedInventoryItemData.item);

        if (cropConstructor) {
          let callback = () => {
            let crop = new cropConstructor(
              this,
              tilePos.x,
              tilePos.y,
              this.layerCrops
            );
            this.crops.add(crop);
            (this.game.scene.getScene(
              "ControllerScene"
            ) as ControllerScene).modifySelectedInventoryItemQuantity(-1);
          };

          let itemData = getItemData(selectedInventoryItemData.item);
          this.actionPopup = new ActionPopup(
            this,
            layerFieldsTile.getCenterX(this.cameras.main),
            layerFieldsTile.getCenterY(this.cameras.main),
            40,
            callback,
            itemData.texture,
            itemData.frame
          );
          this.add.existing(this.actionPopup);
        }
      } else {
        let crop = (this.crops.getChildren() as Array<Crop>).find(
          (crop) =>
            crop.mapPosition.x == tilePos.x && crop.mapPosition.y == tilePos.y
        );
        if (crop && crop.isReadyToHarvest) {
          this.actionPopup = new ActionPopup(
            this,
            layerFieldsTile.getCenterX(this.cameras.main),
            layerFieldsTile.getCenterY(this.cameras.main),
            40,
            () => this.harvestCrop(tilePos, crop),
            "tools",
            0
          );
          this.add.existing(this.actionPopup);
        }
      }
    }
  }

  update(time: number, delta: number) {
    if (this.player.body.velocity.length() > 0) {
      let moveDirection = new Phaser.Math.Vector2(
        this.player.body.velocity
      ).normalize();

      if (Math.abs(moveDirection.x) > Math.abs(moveDirection.y)) {
        if (moveDirection.x > 0) {
          this.player.anims.play("right", true);
        } else {
          this.player.anims.play("left", true);
        }
      } else {
        if (moveDirection.y > 0) {
          this.player.anims.play("down", true);
        } else {
          this.player.anims.play("up", true);
        }
      }
    } else {
      this.player.anims.play("turn", true);
    }

    this.cameras.main.centerOn(
      Math.round(this.player.x),
      Math.round(this.player.y - 15)
    );

    this.crops.getChildren().forEach((crop) => crop.update(time, delta));
    this.objects.getChildren().forEach((object) => object.update(time, delta));

    // this.game.scene.pause('mainScene');
  }
}
