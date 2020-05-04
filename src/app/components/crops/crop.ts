import * as Phaser from "phaser";

import { LootConfig } from "../../types/lootConfig.type";
import { Vector2 } from "../../types/vector2.type";
import { WorldScene } from "../../scenes/worldScene";
import { Loot } from "../../interfaces/loot.interface";
import { LootAnim } from "../worldWidgets/lootAnim";

/**
 * Abstract class representing a Crop planted in a field by the player. It
 * handles the time-based growth of the Crop and the update of its Tile in the
 * WorldScene's _layerCrops. It also holds the LootConfig of the Crop once
 * harvested.
 */
export abstract class Crop extends Phaser.GameObjects.GameObject {
  // The total number of growth states.
  private static NB_GROWTH_STEPS: number = 5;

  // Specifies the type of this game object's scene as WorldScene
  public scene: WorldScene;

  // The Tile's position in the Tilemap
  private _tilePos: Vector2;
  // The crop Tile on the WorldScene's _layerCrops
  private cropTile: Phaser.Tilemaps.Tile;
  // The field Tile on the WorldScene's _layerFields
  private fieldTile: Phaser.Tilemaps.Tile;
  /**
   * The Crop's growthState represented by an integer going from 0 to 4 (nbSteps
   * - 1) included (0 is seed planted and 4 fully grown).
   */
  private growthState: number;
  /**
   * The progress of the Crop in it's current growthState represented as an
   * integer going from 0 to 1. When reaching 1, resets the growth to 0 and
   * increments the growthState by 1 until it reaches NB_GROWTH_STEPS.
   */
  private growth: number;
  // The speed at which the Crop grows. It is calculated from the growthDuration.
  private growthRate: number;
  // The index of the Tile Sprite in the Tileset image.
  private baseTileIdx: number;
  // The LootConfig that the Crop produces when harvested.
  private _lootConfig: LootConfig;
  // Is the Crop watered (meaning it can grow)
  private isWatered: boolean = false;

  /**
   * Creates the Crop object.
   * @param {WorldScene} worldScene - The WorldScene this Crop belongs to
   * @param {number} x - The x position of the Tile of the Crop in the
   * WorldScene's Tilemap
   * @param {number} y - The y position of the Tile of the Crop in the
   * WorldScene's Tilemap
   * @param {number} growthDuration - The time it takes to the Crop to reach it's last
   * growthState
   * @param {number} baseTileIdx - The index of the Tile Sprite in the Tileset image
   * @param {LootConfig} lootConfig - The LootConfig that the Crop produces when harvested.
   */
  public constructor(
    worldScene: WorldScene,
    x: number,
    y: number,
    growthDuration: number,
    baseTileIdx: number,
    lootConfig: LootConfig
  ) {
    super(worldScene, undefined);

    // Sets the member variables
    this._tilePos = { x, y };
    this.growthState = 0;
    this.growth = 0;
    this.growthRate = (Crop.NB_GROWTH_STEPS - 1) / growthDuration;
    this.baseTileIdx = baseTileIdx;
    this._lootConfig = lootConfig;

    // Update the Tile in the WorldScene's _layerCrops
    this.updateTile();
    this.cropTile = this.scene.layerCrops.getTileAt(
      this.tilePos.x,
      this.tilePos.y
    );
    this.fieldTile = this.scene.layerFields.getTileAt(
      this.tilePos.x,
      this.tilePos.y
    );
  }

  /**
   * Returns true if the Crop has reached it's last growthState.
   * @returns {boolean} - Is the Crop ready to be harvested
   */
  public get isReadyToHarvest(): boolean {
    return this.growthState === Crop.NB_GROWTH_STEPS - 1;
  }

  // Getter for _lootConfig
  public get lootConfig(): LootConfig {
    return this._lootConfig;
  }

  // Getter for _tilePos
  public get tilePos(): Vector2 {
    return this._tilePos;
  }

  /**
   * Water the Crop to allow it to grow.
   */
  public water(): void {
    this.isWatered = true;
    this.fieldTile.tint = 0xddddff;
  }

  /**
   * Harvests the Crop. Adds the loots from the Crop's LootConfig and creates
   * the LootAnims. Remove the tile and destroy the Crop object.
   */
  public harvest(): void {
    const diffuseConeAngle: number = Math.PI / 4;
    this.lootConfig.forEach((loot: Loot, i: number, arr: Array<Loot>): void => {
      const angle: number =
        -Math.PI / 2 +
        diffuseConeAngle / 2 -
        diffuseConeAngle * (i / (arr.length - 1));
      const lootAnim: LootAnim = new LootAnim(
        this.scene,
        this.cropTile.getCenterX(this.scene.cameras.main),
        this.cropTile.getCenterY(this.scene.cameras.main),
        angle,
        loot.item,
        loot.quantity
      );
      lootAnim.setScale(2);
      this.scene.add.existing(lootAnim);

      this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
        loot.item,
        loot.quantity
      );
    });
    this.scene.layerCrops.removeTileAt(this.tilePos.x, this.tilePos.y);
    this.fieldTile.tint = 0xffffff;
    this.destroy();
  }

  /**
   * This method is called once per game step by the Scene. Handles the realtime
   * updates.
   * @param {number} time - The current time sent by the Scene
   * @param {number} delta - The delta time sent by the Scene
   */
  public update(time: number, delta: number): void {
    /**
     * Updates the growth of the Crop and the growthState and the Tile if the
     * growth reaches 1.
     */
    if (this.isWatered && this.growthState < Crop.NB_GROWTH_STEPS - 1) {
      this.growth += (this.growthRate * delta) / 1000;
      if (this.growth >= 1) {
        this.growth -= 1;
        this.growthState += 1;
        this.updateTile();
      }
    }
  }

  /**
   * Updates the _layerCrops in the WorldScene's Tilemap with the Crop Tile.
   */
  private updateTile(): void {
    this.scene.layerCrops.putTileAt(
      this.baseTileIdx + this.growthState,
      this.tilePos.x,
      this.tilePos.y
    );
  }
}
