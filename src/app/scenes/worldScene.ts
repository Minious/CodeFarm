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
import { getItemData, ItemData } from "../interfaces/itemData.interface";
import { Building } from "../components/buildings/building";
import { Market } from "../components/buildings/market";
import { Avocado } from "../components/crops/avocado";
import { Grapes } from "../components/crops/grapes";
import { Lemon } from "../components/crops/lemon";
import { Melon } from "../components/crops/melon";
import { Orange } from "../components/crops/orange";
import { Potato } from "../components/crops/potato";
import { Rose } from "../components/crops/rose";
import { Strawberry } from "../components/crops/strawberry";
import { Tomato } from "../components/crops/tomato";
import { Wheat } from "../components/crops/wheat";
import { InventoryItem } from "../interfaces/inventoryItem.interface";
import { Loot } from "../interfaces/loot.interface";

export class WorldScene extends Phaser.Scene {
  private _layerObjectsBackground: Phaser.Tilemaps.DynamicTilemapLayer;
  private _layerObjectsForeground: Phaser.Tilemaps.DynamicTilemapLayer;
  private _popupClicked: boolean;
  private speed: number = 240;
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

  public constructor() {
    super({
      key: "WorldScene",
    });
  }

  public get layerObjectsBackground(): Phaser.Tilemaps.DynamicTilemapLayer {
    return this._layerObjectsBackground;
  }

  public get layerObjectsForeground(): Phaser.Tilemaps.DynamicTilemapLayer {
    return this._layerObjectsForeground;
  }

  public set popupClicked(popupClicked: boolean) {
    this._popupClicked = popupClicked;
  }

  // tslint:disable-next-line: no-empty
  public preload(): void {}

  public create(): void {
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
    const tileset: Phaser.Tilemaps.Tileset = this.map.addTilesetImage(
      "tileset"
    );
    const cropsTileset: Phaser.Tilemaps.Tileset = this.map.addTilesetImage(
      "crops"
    );

    this.layerGround = this.map.createBlankDynamicLayer("Ground", tileset);
    this.layerGround.setScale(2);
    this.layerGround.setPosition(-1000, -1000);
    const deco: Array<number> = [501, 469, 470, 438];
    const level: Array<Array<number>> = Array(100)
      .fill(undefined)
      .map(
        (): Array<number> =>
          Array(100)
            .fill(undefined)
            .map((): number =>
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

    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer): void => {
      const mousePos: Vector2 = new Phaser.Math.Vector2(
        this.input.activePointer.x,
        this.input.activePointer.y
      );

      this.joystickPos = mousePos;
    });
    this.input.on("pointerup", (_pointer: Phaser.Input.Pointer): void => {
      this.player.body.stop();
      this.joystickPos = undefined;
      if (this.moving) {
        this.moving = false;
        (this.game.scene.getScene("UiScene") as UiScene).hideJoystick();
      } else {
        const mouseWorldPos: Vector2 = new Phaser.Math.Vector2(
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
    this.input.on("pointermove", (): void => {
      if (this.joystickPos) {
        (this.game.scene.getScene("UiScene") as UiScene).showJoystick();

        const mousePos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
          this.input.activePointer.x,
          this.input.activePointer.y
        );
        const joystickPosPhaserVector2: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
          this.joystickPos.x,
          this.joystickPos.y
        );
        const distanceJoystick: number = mousePos.distance(
          joystickPosPhaserVector2
        );
        if (distanceJoystick > this.lengthJoystick) {
          const newJoystickPos: Vector2 = mousePos.clone().add(
            joystickPosPhaserVector2
              .clone()
              .subtract(mousePos)
              .scale(this.lengthJoystick)
              .scale(1 / distanceJoystick)
          );
          this.joystickPos = newJoystickPos;
        }
        const joystickMove: Phaser.Math.Vector2 = mousePos
          .clone()
          .subtract(joystickPosPhaserVector2);
        const playerTarget: Vector2 = new Phaser.Math.Vector2(
          this.player.x,
          this.player.y
        ).add(joystickMove);
        const speedFactor: number = Utils.clamp(
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

    const posMarket: Vector2 = { x: 30, y: 30 };
    this.createBuilding(BuildingType.Market, posMarket);

    this.physics.add.collider(this.player, this.objects);

    this.physics.world.createDebugGraphic();
  }

  public update(time: number, delta: number): void {
    if (this.player.body.velocity.length() > 0) {
      const moveDirection: Vector2 = new Phaser.Math.Vector2(
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

    this.crops
      .getChildren()
      .forEach((crop: Crop): void => crop.update(time, delta));
    this.objects
      .getChildren()
      .forEach((object: any): void => object.update(time, delta));

    // this.game.scene.pause('mainScene');
  }

  private createBuilding(buildingType: BuildingType, pos: Vector2): void {
    const buildingConstructor: typeof Market = getBuildingConstructor(
      buildingType
    );
    const building: Building = new buildingConstructor(this, pos.x, pos.y);
    this.objects.add(building);
    this.add.existing(building);
  }

  private movePlayerTo(target: Vector2, speedFactor: number): void {
    this.physics.moveToObject(this.player, target, this.speed * speedFactor);
  }

  private getNeighborTiles(
    layer: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ): Array<Phaser.Tilemaps.Tile> {
    const neighborTiles: Array<Phaser.Tilemaps.Tile> = this.getNeighbors(
      tilePos,
      layer.layer.width - 1,
      layer.layer.height - 1
    ).map(
      (neighborPos: Vector2): Phaser.Tilemaps.Tile =>
        layer.getTileAt(neighborPos.x, neighborPos.y, true)
    );
    return neighborTiles;
  }

  private getNeighbors(
    pos: Vector2,
    maxColumns: number,
    maxRows: number,
    diamond: boolean = true,
    radius: number = 1
  ): Array<Vector2> {
    const neighbors: Array<Vector2> = [];
    for (
      let i: number = Math.max(0, pos.x - radius);
      i <= Math.min(pos.x + 1, maxRows);
      i += 1
    ) {
      for (
        let j: number = Math.max(0, pos.y - 1);
        j <= Math.min(pos.y + 1, maxColumns);
        j += 1
      ) {
        if (i !== pos.x || j !== pos.y) {
          if (
            diamond === false ||
            Math.abs(pos.x - i) + Math.abs(pos.y - j) <= radius
          ) {
            neighbors.push({ x: i, y: j });
          }
        }
      }
    }
    return neighbors;
  }

  private createFieldTile(
    layerFields: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ): void {
    this.updateFieldTile(layerFields, tilePos);
    this.getNeighborTiles(layerFields, tilePos)
      .filter(
        (neighborTile: Phaser.Tilemaps.Tile): boolean =>
          neighborTile.index !== -1
      )
      .forEach((neighborTilePos: Vector2): void =>
        this.updateFieldTile(layerFields, {
          x: neighborTilePos.x,
          y: neighborTilePos.y,
        })
      );
  }

  private updateFieldTile(
    layerFields: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ): void {
    const currentTile: Phaser.Tilemaps.Tile = layerFields.getTileAt(
      tilePos.x,
      tilePos.y,
      true
    );
    currentTile.rotation = 0;

    const neighborTilesPosOrder: Array<Vector2> = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    const neighborTiles: Array<Phaser.Tilemaps.Tile> = neighborTilesPosOrder.map(
      (neighborTilePos: Vector2): Phaser.Tilemaps.Tile =>
        layerFields.getTileAt(
          tilePos.x + neighborTilePos.x,
          tilePos.y + neighborTilePos.y,
          true
        )
    );
    const areNeighborTilesFields: Array<boolean> = neighborTiles.map(
      (neighborTile: Phaser.Tilemaps.Tile): boolean => neighborTile.index !== -1
    );

    let tileIdx: number;
    if (
      areNeighborTilesFields.filter((e: boolean): boolean => e).length === 4
    ) {
      tileIdx = 197;
    } else if (
      areNeighborTilesFields.filter((e: boolean): boolean => e).length === 3
    ) {
      tileIdx = 196;
      currentTile.rotation =
        (Math.PI * areNeighborTilesFields.indexOf(false)) / 2;
    } else if (
      areNeighborTilesFields.filter((e: boolean): boolean => e).length === 2
    ) {
      if (areNeighborTilesFields[0] === areNeighborTilesFields[2]) {
        tileIdx = 195;
        if (areNeighborTilesFields.indexOf(true) === 0) {
          currentTile.rotation = Math.PI / 2;
        }
      } else {
        tileIdx = 194;
        const currentTileRotation: number =
          areNeighborTilesFields.indexOf(false) === 1
            ? 3
            : areNeighborTilesFields.indexOf(true);
        currentTile.rotation = (Math.PI * currentTileRotation) / 2;
      }
    } else if (
      areNeighborTilesFields.filter((e: boolean): boolean => e).length === 1
    ) {
      tileIdx = 193;
      currentTile.rotation =
        (Math.PI * areNeighborTilesFields.indexOf(true)) / 2;
    } else {
      tileIdx = 192;
    }
    if (tileIdx) {
      layerFields.putTileAt(tileIdx, tilePos.x, tilePos.y);
    }
  }

  private destroyPopup(): void {
    if (this.actionPopup) {
      this.input.removeDebug(this.actionPopup);
      this.actionPopup.destroy();
    }
  }

  private harvestCrop(tilePos: Vector2, crop: Crop): void {
    const tile: Phaser.Tilemaps.Tile = this.layerCrops.getTileAt(
      tilePos.x,
      tilePos.y
    );

    const diffuseConeAngle: number = Math.PI / 4;
    crop.lootConfig.forEach((loot: Loot, i: number, arr: Array<Loot>): void => {
      const angle: number =
        -Math.PI / 2 +
        diffuseConeAngle / 2 -
        diffuseConeAngle * (i / (arr.length - 1));
      const lootAnim: LootAnim = new LootAnim(
        this,
        tile.getCenterX(this.cameras.main),
        tile.getCenterY(this.cameras.main),
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

  private actionClick(mouseWorldPos: Vector2): void {
    const tilePos: Vector2 = this.map.worldToTileXY(
      mouseWorldPos.x,
      mouseWorldPos.y
    );
    const layerFieldsTile: Phaser.Tilemaps.Tile = this.layerFields.getTileAt(
      tilePos.x,
      tilePos.y,
      true
    );

    const noField: boolean = !this.layerFields.hasTileAt(tilePos.x, tilePos.y);
    if (noField) {
      this.actionPopup = new ActionPopup(
        this,
        layerFieldsTile.getCenterX(this.cameras.main),
        layerFieldsTile.getCenterY(this.cameras.main),
        40,
        (): void => this.createFieldTile(this.layerFields, tilePos),
        "tools",
        1
      );
      this.add.existing(this.actionPopup);
    } else {
      const emptyField: boolean = !this.crops
        .getChildren()
        .some(
          (crop: Crop): boolean =>
            tilePos.x === crop.mapPosition.x && tilePos.y === crop.mapPosition.y
        );

      const selectedInventoryItemData: InventoryItem = (this.game.scene.getScene(
        "ControllerScene"
      ) as ControllerScene).getSelectedInventoryItemData();
      if (emptyField && selectedInventoryItemData) {
        const cropConstructor:
          | typeof Avocado
          | typeof Grapes
          | typeof Lemon
          | typeof Melon
          | typeof Orange
          | typeof Potato
          | typeof Rose
          | typeof Strawberry
          | typeof Tomato
          | typeof Wheat = getCropFromSeed(selectedInventoryItemData.item);

        if (cropConstructor) {
          const callback = (): void => {
            const crop: Crop = new cropConstructor(
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

          const itemData: ItemData = getItemData(
            selectedInventoryItemData.item
          );
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
        const crop: Crop = (this.crops.getChildren() as Array<Crop>).find(
          (currentCrop: Crop): boolean =>
            currentCrop.mapPosition.x === tilePos.x &&
            currentCrop.mapPosition.y === tilePos.y
        );
        if (crop && crop.isReadyToHarvest) {
          this.actionPopup = new ActionPopup(
            this,
            layerFieldsTile.getCenterX(this.cameras.main),
            layerFieldsTile.getCenterY(this.cameras.main),
            40,
            (): void => this.harvestCrop(tilePos, crop),
            "tools",
            0
          );
          this.add.existing(this.actionPopup);
        }
      }
    }
  }
}
