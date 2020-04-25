import * as Phaser from "phaser";

import { Vector2 } from "../../types/vector2.type";
import { BoundingBox } from "../../interfaces/boundingBox.interface";
import { WorldScene } from "../../scenes/worldScene";

/**
 * Abstract class representing any Building in the game world. The Building is
 * displayed as a rectangle of Tiles with Tiles dimension defined by size
 * (Example : size = {x: 2, y: 3} means a Building composed of 2 columns and 3
 * rows of Tiles). Tiles are displayed on the WorldScene's two Tilemap layers
 * _layerObjectsBackground and _layerObjectsForeground in order to display Tiles
 * before or below the player to create depth. Tiles displayed in the foreground
 * are those whose Tilemap coordinates are inside the foreground BoudingBox
 * parameter (Example : foreground = {x: 1, y: 2, width: 2, height: 1} means the
 * foreground Tiles are those with x position between 1 and 3 included (3 is x +
 * width) and y between 2 and 3 included). An other BoundingBox defines the
 * Building collider in world position relative to the Building top left corner
 * world position. A callback has to be provided to be called when the Building
 * is clicked by the player.
 */
export abstract class Building extends Phaser.Physics.Arcade.Sprite {
  /**
   * Creates the Building object.
   * @param {Phaser.Scene} scene - The Phaser Scene this Popup belongs to
   * (should be WorldScene)
   * @param {number} x - The x position of the top left Tile of the Building in
   * the WorldScene's Tilemap
   * @param {number} y - The y position of the top left Tile of the Building in
   * the WorldScene's Tilemap
   * @param {number} baseTileIdx - The index of the top left Tile Sprite in the
   * Tileset image
   * @param {Vector2} size - The number of Tile columns and rows (respectively
   * properties x and y)
   * @param {BoundingBox} foreground - All the Tiles with coordinates located
   * inside this BoundingBox are displayed on the WorldScene's
   * _layerObjectsForeground, the rest on _layerObjectsBackground.
   * @param {BoundingBox} colliderPosition - The BoundingBox representing the
   * collider of the Building (relative to the Building's top left corner world
   * position)
   * @param {() => void} externalCallback - The callback to call when the
   * Building is clicked by the player
   */
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    baseTileIdx: number,
    size: Vector2,
    foreground: BoundingBox,
    colliderPosition: BoundingBox,
    externalCallback: () => void
  ) {
    super(scene, 0, 0, undefined, undefined);

    /**
     * Adds the Building to the WorldScene's physics engine and set it to static
     * (immovable).
     */
    this.scene.physics.add.existing(this, true);

    const mapPosition: Vector2 = new Phaser.Math.Vector2(x, y);

    // Updates the WorldScene's objects layers with the Building tiles.
    this.updateTiles(mapPosition, size, foreground, baseTileIdx);

    // Positions and sizes the Building click BoundingBox.
    const originTile: Phaser.Tilemaps.Tile = (this
      .scene as WorldScene).layerObjectsBackground.getTileAt(
      mapPosition.x,
      mapPosition.y,
      true
    );
    const worldPosition: Vector2 = new Phaser.Math.Vector2(
      originTile.getLeft(this.scene.cameras.main),
      originTile.getTop(this.scene.cameras.main)
    );
    this.setPosition(worldPosition.x, worldPosition.y);
    this.setDisplaySize(size.x * 32, size.y * 32);
    this.setOrigin(0, 0);
    this.setVisible(false);

    /**
     * Sets the Building's click callback.
     * (Note : Not working without "this.input.alwaysEnabled = true;" why ?)
     */
    this.setInteractive();
    // this.input.alwaysEnabled = true;
    this.scene.input.enableDebug(this);
    this.on("pointerdown", (): void => {
      externalCallback();
    });

    // Positions and sizes the Building's physics body
    this.body.x = worldPosition.x;
    this.body.y = worldPosition.y;
    this.body.setSize(colliderPosition.width, colliderPosition.height);
    this.body.setOffset(colliderPosition.x, colliderPosition.y);
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  /**
   * Set the Building tiles in the WorldScene's _layerObjectsBackground and
   * _layerObjectsForeground.
   * @param {Vector2} mapPosition - Tilemap's position of the top left Tile of
   * the Building
   * @param {Vector2} size - Tilemap's dimensions of the Building in Tiles
   * number
   * @param {BoundingBox} foreground - All the Tiles with coordinates located
   * inside this BoundingBox are displayed on the WorldScene's
   * _layerObjectsForeground, the rest on _layerObjectsBackground.
   * @param {number} baseTileIdx - The index of the top left Tile Sprite in the
   * Tileset image
   */
  private updateTiles(
    mapPosition: Vector2,
    size: Vector2,
    foreground: BoundingBox,
    baseTileIdx: number
  ): void {
    for (let i: number = 0; i < size.x; i += 1) {
      for (let j: number = 0; j < size.y; j += 1) {
        const layer: Phaser.Tilemaps.DynamicTilemapLayer =
          i >= foreground.x &&
          i <= foreground.x + foreground.width &&
          j >= foreground.y &&
          j <= foreground.y + foreground.height
            ? (this.scene as WorldScene).layerObjectsForeground
            : (this.scene as WorldScene).layerObjectsBackground;
        layer.putTileAt(
          baseTileIdx + i + j * 32,
          mapPosition.x + i,
          mapPosition.y + j
        );
      }
    }
  }
}
