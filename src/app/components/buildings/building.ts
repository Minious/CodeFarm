import * as Phaser from "phaser";

import { Vector2 } from "../../types/vector2.type";
import { BoundingBox } from "../../interfaces/boundingBox.interface";
import { WorldScene } from "../../scenes/worldScene";

export class Building extends Phaser.Physics.Arcade.Sprite {
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

    this.scene.physics.add.existing(this, true);

    const mapPosition: Vector2 = new Phaser.Math.Vector2(x, y);

    this.setDisplaySize(size.x * 32, size.y * 32);

    this.updateTiles(mapPosition, size, foreground, baseTileIdx);

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
    this.setOrigin(0, 0);
    this.setVisible(false);

    this.setInteractive();
    this.input.alwaysEnabled = true;
    this.scene.input.enableDebug(this);
    this.on("pointerup", (): void => {
      externalCallback();
    });

    this.body.x = worldPosition.x;
    this.body.y = worldPosition.y;
    this.body.setSize(colliderPosition.width, colliderPosition.height);
    this.body.setOffset(colliderPosition.x, colliderPosition.y);
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

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
