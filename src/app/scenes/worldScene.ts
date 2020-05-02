import * as Phaser from "phaser";

import { Utils } from "../utils/utils";
import { ActionPopup } from "../components/worldWidgets/actionPopup";
import { LootAnim } from "../components/worldWidgets/lootAnim";

import { CodeFarmScene } from "./codeFarmScene";
import { Vector2 } from "../types/vector2.type";
import { ScenesManager } from "./scenesManager";
import { BuildingType, buildingFactory } from "../enums/buildingType.enum";
import { Crop } from "../components/crops/crop";
import { cropFactory, ItemType } from "../enums/itemType.enum";
import { getItemData } from "../interfaces/itemData.interface";
import { Building } from "../components/buildings/building";
import { InventorySlotData } from "../interfaces/inventorySlotData.interface";
import { Loot } from "../interfaces/loot.interface";
import { HarvestPopup } from "../components/worldWidgets/harvestPopup";
import { PlantPopup } from "../components/worldWidgets/PlantPopup";
import { PlowPopup } from "../components/worldWidgets/plowPopup";

export class WorldScene extends CodeFarmScene {
  /**
   * Trick variable to disable the actionClick if a popup has been clicked.
   * Since the popup is destroyed when click, the click is passing through to
   * the tilemap, this variable is the current fix to stop the propagation of
   * the click.
   * (NOTE : Find better solution)
   */
  private _popupClicked: boolean;
  // Player's moving speed
  private speed: number = 240;
  // Phaser Group holding the Crop objects
  private crops: Phaser.GameObjects.Group;
  /**
   * Phaser Group holding the objects (Building, etc), enables the collision
   * between the group and the player and calls the update method of its
   * children.
   */
  private objects: Phaser.GameObjects.Group;
  // The game's Tilemap
  private map: Phaser.Tilemaps.Tilemap;
  // Tilemap layer holding the ground tiles
  private layerGround: Phaser.Tilemaps.DynamicTilemapLayer;
  // Tilemap layer holding the field tiles (above layerGround)
  private layerFields: Phaser.Tilemaps.DynamicTilemapLayer;
  // Tilemap layer holding the crop tiles (above layerFields)
  private _layerCrops: Phaser.Tilemaps.DynamicTilemapLayer;
  /**
   * Tilemap layers holding the objects (buildings, etc) tiles (above
   * _layerCrops). The use of a background and foreground allow to use depth with
   * the player, _layerObjectsBackground stands behind the player and
   * _layerObjectsBackground above.
   */
  private _layerObjectsBackground: Phaser.Tilemaps.DynamicTilemapLayer;
  private _layerObjectsForeground: Phaser.Tilemaps.DynamicTilemapLayer;
  // The player Sprite
  private player: Phaser.Physics.Arcade.Sprite;
  /**
   * Is the player moving. Used when the pointerup event fires to know if the
   * player dragged (the player stop moving) or clicked (the actionClick method
   * is called)
   */
  private moving: boolean;
  /**
   * If there's an ActionPopup instantiated (when player clicks on the ground),
   * holds it.
   */
  private actionPopup: ActionPopup;

  public constructor(scenesManager: ScenesManager) {
    super(
      {
        key: "WorldScene",
      },
      scenesManager
    );
  }

  // Getter for _layerObjectsBackground
  public get layerObjectsBackground(): Phaser.Tilemaps.DynamicTilemapLayer {
    return this._layerObjectsBackground;
  }

  // Getter for _layerObjectsForeground
  public get layerObjectsForeground(): Phaser.Tilemaps.DynamicTilemapLayer {
    return this._layerObjectsForeground;
  }

  // Getter for _layerCrops
  public get layerCrops(): Phaser.Tilemaps.DynamicTilemapLayer {
    return this._layerCrops;
  }

  // Setter for _popupClicked
  public set popupClicked(popupClicked: boolean) {
    this._popupClicked = popupClicked;
  }

  // tslint:disable-next-line: no-empty
  public preload(): void {}

  /**
   * Initializes the Tilemap layers (objects, fields, crops and ground), the
   * player and the player inputs.
   */
  public create(): void {
    // Disables right click
    this.game.canvas.oncontextmenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    // Creates the Phaser Groups
    this.crops = this.add.group();
    this.objects = this.add.group();

    /**
     * Places the camera centered to the origin (default is left upper corner is
     * at origin)
     */
    this.cameras.main.centerOn(0, 0);
    /**
     * Is supposed to round camera position coordinates to integer
     * (Note : Check if it works)
     */
    this.cameras.main.roundPixels = true;

    /**
     * Creates the worlds Tilemap of 100x100 tiles with the size of 16 pixels
     * (the size of the tile in the png)
     */
    this.map = this.make.tilemap({
      tileWidth: 16,
      tileHeight: 16,
      width: 100,
      height: 100,
    });
    // Adds the tilesets (texture) to the Tilemap
    const tileset: Phaser.Tilemaps.Tileset = this.map.addTilesetImage(
      "tileset"
    );
    const cropsTileset: Phaser.Tilemaps.Tileset = this.map.addTilesetImage(
      "crops"
    );

    // Initializes the layerGround
    this.layerGround = this.map.createBlankDynamicLayer("Ground", tileset);
    this.layerGround.setScale(2);
    this.layerGround.setPosition(-1000, -1000);
    // Fills the layerGround with random tiles with different probabilities
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
    // Enable the ground for interaction with the Tiles (Popups)
    this.layerGround.setInteractive();

    // Initializes the layerFields
    this.layerFields = this.map.createBlankDynamicLayer("Fields", tileset);
    this.layerFields.setScale(2);
    this.layerFields.setPosition(-1000, -1000);

    // Initializes the layerCrops
    this._layerCrops = this.map.createBlankDynamicLayer("Crops", cropsTileset);
    this._layerCrops.setScale(2);
    this._layerCrops.setPosition(-1000, -1000);

    // Initializes the _layerObjectsBackground
    this._layerObjectsBackground = this.map.createBlankDynamicLayer(
      "Objects",
      tileset
    );
    this._layerObjectsBackground.setScale(2);
    this._layerObjectsBackground.setPosition(-1000, -1000);

    /**
     * Initializes the _layerObjectsForeground and places it above the player by
     * setting its depth value.
     * (Note : Research on how depth work in Phaser)
     */
    this._layerObjectsForeground = this.map.createBlankDynamicLayer(
      "ObjectsForeground",
      tileset
    );
    this._layerObjectsForeground.setScale(2);
    this._layerObjectsForeground.setPosition(-1000, -1000);
    this._layerObjectsForeground.setDepth(100);

    // Creates the player and set its collider's dimensions and position
    this.player = this.physics.add.sprite(0, 0, "player");
    this.player.setSize(12, 12);
    this.player.setOffset(
      this.player.width / 2 - this.player.body.width / 2,
      this.player.height - this.player.body.height
    );
    this.player.setScale(2);
    this.player.setOrigin(0.5, 1);

    /**
     * Defines the player's animations cycle by setting tiles' positions in the
     * tileset
     */
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

    // Initializes _popupClicked
    this._popupClicked = false;

    /**
     * Defines the pointer events callbacks
     * (Note : Should be moved to its own function)
     */
    // Triggered when the pointer is pressed (Mouse button pressed or finger tap)
    this.layerGround.on(
      "pointerdown",
      (_pointer: Phaser.Input.Pointer): void => {
        // Retrieves the pointer's screen position
        const pointerScreenPos: Vector2 = new Phaser.Math.Vector2(
          this.input.activePointer.x,
          this.input.activePointer.y
        );

        // Resets the joystick in case the pointer is dragged (the player starts moving)
        this.scenesManager.uiScene.joystick.resetTo(pointerScreenPos);
      }
    );
    // Triggered when the pointer is released (Mouse button or finger released)
    this.layerGround.on("pointerup", (_pointer: Phaser.Input.Pointer): void => {
      // Stops the player's physic body (In case it was moving)
      this.player.body.stop();

      // If the player was moving (meaning pointer dragged)
      if (this.moving) {
        this.moving = false;
        this.scenesManager.uiScene.joystick.hide();
      } else {
        const pointerWorldPos: Vector2 = new Phaser.Math.Vector2(
          this.input.activePointer.worldX,
          this.input.activePointer.worldY
        );
        /**
         * If a popup was clicked and destroyed, the click has leaked to the
         * groundLayer, disables the click.
         */
        if (this._popupClicked) {
          this._popupClicked = false;
        } else {
          this.destroyPopup();
          this.actionClick(pointerWorldPos);
        }
      }
    });

    // Triggered when the pointer is moving
    this.layerGround.on("pointermove", (): void => {
      // If the pointer is down means the player is moving
      if (this.input.activePointer.isDown) {
        /**
         * If it is the first event triggering the current player's movement,
         * initializes the movement
         */
        if (!this.moving) {
          this.moving = true;
          this.scenesManager.uiScene.joystick.show();
        }

        const pointerScreenPos: Vector2 = new Phaser.Math.Vector2(
          this.input.activePointer.x,
          this.input.activePointer.y
        );

        this.scenesManager.uiScene.joystick.updatePosition(pointerScreenPos);

        const playerTarget: Vector2 = Utils.add(
          new Phaser.Math.Vector2(this.player.x, this.player.y),
          this.scenesManager.uiScene.joystick.getMove()
        );
        const speedFactor: number = this.scenesManager.uiScene.joystick.getRatio();

        this.movePlayerTo(playerTarget, speedFactor);
      }
    });

    // Creates a Market and put it in the game
    const posMarket: Vector2 = { x: 30, y: 30 };
    this.createBuilding(BuildingType.Market, posMarket);

    // Enables collision between objects and the player
    this.physics.add.collider(this.player, this.objects);

    if (this.scenesManager.controllerScene.debugEnabled) {
      // Displays the physic bodies for debug purposes
      this.physics.world.createDebugGraphic();
    }
  }

  /**
   * This method is called once per game step while the scene is running.
   * Handles the realtime updates.
   * @param {number} time - The current time
   * @param {number} delta - The delta time in ms since the last frame. This is
   * a smoothed and capped value based on the FPS rate.
   */
  public update(time: number, delta: number): void {
    // Sets the player animation based on its velocity
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

    /**
     * Centers the camera on the player
     * (Note : Could use Phaser follow method instead ?)
     */
    this.cameras.main.centerOn(
      Math.round(this.player.x),
      Math.round(this.player.y - 15)
    );

    // Calls the update method on all crops and objects
    this.crops
      .getChildren()
      .forEach((crop: Crop): void => crop.update(time, delta));
    this.objects
      .getChildren()
      .forEach((object: any): void => object.update(time, delta));
  }

  /**
   * Create an instance of the Crop associated to the crop seed ItemType passed
   * as an argument, adds it to the WorldScene.
   * @param {number} x - The x position of the Tile of the Crop in the
   * WorldScene's Tilemap
   * @param {number} y - The y position of the Tile of the Crop in the
   * WorldScene's Tilemap
   * @param {ItemType} seed - The seed ItemType associated to the Crop class
   */
  public createCrop(x: number, y: number, seed: ItemType): void {
    const crop: Crop = cropFactory(this, x, y, seed);
    this.crops.add(crop);
  }

  /**
   * Harvests a Crop Tile. Adds the loots from the Crop's LootConfig and creates
   * the LootAnims. Remove the tile and destroy the Crop object.
   * @param {Crop} crop - The Crop to harvest
   * (Note : Should be moved to the Crop class)
   */
  public harvestCrop(crop: Crop): void {
    const diffuseConeAngle: number = Math.PI / 4;
    crop.lootConfig.forEach((loot: Loot, i: number, arr: Array<Loot>): void => {
      const angle: number =
        -Math.PI / 2 +
        diffuseConeAngle / 2 -
        diffuseConeAngle * (i / (arr.length - 1));
      const lootAnim: LootAnim = new LootAnim(
        this,
        crop.tile.getCenterX(this.cameras.main),
        crop.tile.getCenterY(this.cameras.main),
        angle,
        loot.item,
        loot.quantity
      );
      lootAnim.setScale(2);
      this.add.existing(lootAnim);

      this.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
        loot.item,
        loot.quantity
      );
    });
    this._layerCrops.removeTileAt(crop.tilePos.x, crop.tilePos.y);
    crop.destroy();
  }

  /**
   * Sets the Tile at tilePos as a field. Updates the neighbors fields if they
   * exist.
   * @param tilePos - The Tile coordinate
   */
  public createFieldTile(tilePos: Vector2): void {
    this.updateFieldTile(tilePos);
    this.getNeighborTiles(this.layerFields, tilePos)
      // Filter empty Tiles
      .filter(
        (neighborTile: Phaser.Tilemaps.Tile): boolean =>
          neighborTile.index !== -1
      )
      .forEach((neighborTilePos: Vector2): void =>
        this.updateFieldTile({
          x: neighborTilePos.x,
          y: neighborTilePos.y,
        })
      );
  }

  /**
   * Creates a building of the BuildingType specified at the Tilemap pos.
   * @param {BuildingType} buildingType - BuildingType of the building
   * @param {Vector2} pos - Tilemap position of the building
   */
  private createBuilding(buildingType: BuildingType, pos: Vector2): void {
    const building: Building = buildingFactory(
      this,
      pos.x,
      pos.y,
      buildingType
    );
    this.objects.add(building);
    this.add.existing(building);
  }

  /**
   * Uses the Phaser physic engine to move the player to the specified target
   * world position.
   * @param {Vector2} target - Player movement target position
   * @param {number} speedFactor - Factor of the player maximum speed to use
   * (between 0 and 1 - default 1)
   */
  private movePlayerTo(target: Vector2, speedFactor: number = 1): void {
    this.physics.moveToObject(this.player, target, this.speed * speedFactor);
  }

  /**
   * Returns an array containing the neighbor Tiles of the Tile located at
   * tilePos in the Tilemap layer provided.
   * @param {Phaser.Tilemaps.DynamicTilemapLayer} layer - Tilemap layer to grab the Tiles from
   * @param {Vector2} tilePos - The coordinates of the Tile to grab neighbors from
   * @returns {Array<Phaser.Tilemaps.Tile>} - An array of the neighbor Tiles
   */
  private getNeighborTiles(
    layer: Phaser.Tilemaps.DynamicTilemapLayer,
    tilePos: Vector2
  ): Array<Phaser.Tilemaps.Tile> {
    const neighborTiles: Array<Phaser.Tilemaps.Tile> = this.getNeighbors(
      tilePos,
      { x: layer.layer.width - 1, y: layer.layer.height - 1 }
    ).map(
      (neighborPos: Vector2): Phaser.Tilemaps.Tile =>
        layer.getTileAt(neighborPos.x, neighborPos.y, true)
    );
    return neighborTiles;
  }

  /**
   * In the context of a 2D array, returns an array containing the coordinates
   * of neighbors of the cell at the coordinates provided by the pos parameter.
   * The dimensions of the 2D array has to be provided to exclude cells outside
   * of the bounds of the array. The neighborhood type can be specified, either
   * 4-neighborhood (Von Neumann - default value) or 8-neighborhood (Moore). A
   * radius can also be specified to return more than direct neighbors.
   * @param {Vector2} pos - The coordinates of the cell to returns neighbors of
   * @param {Vector2} arraySize - The size of the array
   * @param {boolean} useVonNeumann - Use 4-neighborhood (Von Neumann) if true,
   * 8-neighborhood (Moore) otherwize
   * @param {number} radius - Integer representing the maximum distance between
   * the cell at coordinates pos and its neighbors
   * @returns {Array<Vector2>} - Array containing the coordinates of neighbors
   */
  private getNeighbors(
    pos: Vector2,
    arraySize: Vector2,
    useVonNeumann: boolean = true,
    radius: number = 1
  ): Array<Vector2> {
    const neighbors: Array<Vector2> = [];
    for (
      let i: number = Math.max(0, pos.x - radius);
      i <= Math.min(pos.x + 1, arraySize.x);
      i += 1
    ) {
      for (
        let j: number = Math.max(0, pos.y - 1);
        j <= Math.min(pos.y + 1, arraySize.y);
        j += 1
      ) {
        if (i !== pos.x || j !== pos.y) {
          if (
            !useVonNeumann ||
            Math.abs(pos.x - i) + Math.abs(pos.y - j) <= radius
          ) {
            neighbors.push({ x: i, y: j });
          }
        }
      }
    }
    return neighbors;
  }

  /**
   * Checks if the neighbors of the Tile at the position tilePos in the
   * layerFields are fields or empty and set the field tile sprite accordingly
   * to match the pattern for the Tile at tilePos.
   * @param tilePos - The position of the Tile to look neighbors of
   * (Note : This function is a bit messy)
   */
  private updateFieldTile(tilePos: Vector2): void {
    const currentTile: Phaser.Tilemaps.Tile = this.layerFields.getTileAt(
      tilePos.x,
      tilePos.y,
      true
    );

    const neighborTilesPosOrder: Array<Vector2> = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
    const neighborTiles: Array<Phaser.Tilemaps.Tile> = neighborTilesPosOrder.map(
      (neighborTilePos: Vector2): Phaser.Tilemaps.Tile =>
        this.layerFields.getTileAt(
          tilePos.x + neighborTilePos.x,
          tilePos.y + neighborTilePos.y,
          true
        )
    );
    const areNeighborTilesFields: Array<boolean> = neighborTiles.map(
      (neighborTile: Phaser.Tilemaps.Tile): boolean => neighborTile.index !== -1
    );
    const neighborTilesFieldsCount: number = areNeighborTilesFields.filter(
      (b: boolean): boolean => b
    ).length;

    let tileIdx: number;
    switch (neighborTilesFieldsCount) {
      case 4:
        tileIdx = 197;
        break;
      case 3:
        tileIdx = 196;
        currentTile.rotation =
          (Math.PI * areNeighborTilesFields.indexOf(false)) / 2;
        break;
      case 2:
        if (areNeighborTilesFields[0] === areNeighborTilesFields[2]) {
          // Bar field sprite
          tileIdx = 195;
          currentTile.rotation =
            areNeighborTilesFields.indexOf(true) === 0 ? Math.PI / 2 : 0;
          break;
        } else {
          // Corner field sprite
          tileIdx = 194;
          const currentTileRotation: number =
            areNeighborTilesFields.indexOf(false) === 1
              ? 3
              : areNeighborTilesFields.indexOf(true);
          currentTile.rotation = (Math.PI * currentTileRotation) / 2;
        }
        break;
      case 1:
        tileIdx = 193;
        currentTile.rotation =
          (Math.PI * areNeighborTilesFields.indexOf(true)) / 2;
        break;
      default:
        tileIdx = 192;
        break;
    }
    this.layerFields.putTileAt(tileIdx, tilePos.x, tilePos.y);
  }

  /**
   * Destroys the current Popup object.
   */
  private destroyPopup(): void {
    if (this.actionPopup) {
      this.input.removeDebug(this.actionPopup);
      this.actionPopup.destroy();
    }
  }

  /**
   * Method called when the player clicks the ground and triggers an action.
   * Creates a Popup to inform him of the possible action and confirm it. If
   * there's no field yet, the Popup creates a field. If there's already a
   * field, it creates a crop if a Crop seed is selected in the inventory bar.
   * If there's already a Crop and the Corp is ready to harvest, it harvests the
   * Crop;
   * @param {Vector2} pointerWorldPos - The world position of the pointer
   * (click)
   * (Note : Split into other methods for each Popup type)
   */
  private actionClick(pointerWorldPos: Vector2): void {
    const tilePos: Vector2 = this.map.worldToTileXY(
      pointerWorldPos.x,
      pointerWorldPos.y
    );
    const layerFieldsTile: Phaser.Tilemaps.Tile = this.layerFields.getTileAt(
      tilePos.x,
      tilePos.y,
      true
    );

    const noField: boolean = !this.layerFields.hasTileAt(tilePos.x, tilePos.y);
    if (noField) {
      this.actionPopup = new PlowPopup(
        this,
        layerFieldsTile.getCenterX(this.cameras.main),
        layerFieldsTile.getCenterY(this.cameras.main),
        40,
        tilePos
      );
      this.add.existing(this.actionPopup);
    } else {
      const emptyField: boolean = !this.crops
        .getChildren()
        .some(
          (crop: Crop): boolean =>
            tilePos.x === crop.tilePos.x && tilePos.y === crop.tilePos.y
        );

      const selectedInventorySlotData: InventorySlotData = this.scenesManager.controllerScene.getSelectedInventorySlotData();
      if (emptyField && selectedInventorySlotData) {
        const selectedObjectIsSeed: boolean = getItemData(
          selectedInventorySlotData.item
        ).isSeed;

        if (selectedObjectIsSeed) {
          this.actionPopup = new PlantPopup(
            this,
            layerFieldsTile.getCenterX(this.cameras.main),
            layerFieldsTile.getCenterY(this.cameras.main),
            40,
            tilePos,
            selectedInventorySlotData.item
          );
          this.add.existing(this.actionPopup);
        }
      } else {
        const crop: Crop = (this.crops.getChildren() as Array<Crop>).find(
          (currentCrop: Crop): boolean =>
            currentCrop.tilePos.x === tilePos.x &&
            currentCrop.tilePos.y === tilePos.y
        );
        if (crop && crop.isReadyToHarvest) {
          this.actionPopup = new HarvestPopup(
            this,
            layerFieldsTile.getCenterX(this.cameras.main),
            layerFieldsTile.getCenterY(this.cameras.main),
            40,
            crop
          );
          this.add.existing(this.actionPopup);
        }
      }
    }
  }
}
