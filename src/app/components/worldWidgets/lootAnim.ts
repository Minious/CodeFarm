import * as Phaser from "phaser";

import { ItemType } from "../../enums/itemType.enum";
import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Vector2 } from "../../types/vector2.type";

export class LootAnim extends Phaser.GameObjects.Container {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    itemType: ItemType,
    quantity: number
  ) {
    super(scene, x, y);

    const itemTypeData: ItemData = getItemData(itemType);

    const itemIcon: Phaser.GameObjects.Sprite = this.scene.add.sprite(
      0,
      0,
      itemTypeData.texture,
      itemTypeData.frame
    );
    this.add(itemIcon);

    const itemIconBounds: Phaser.Geom.Rectangle = itemIcon.getBounds();
    const itemCountText: Phaser.GameObjects.Text = this.scene.add.text(
      0,
      itemIconBounds.height / 2,
      quantity.toString(),
      {
        fontSize: "12px",
        fontFamily: '"Roboto Condensed"',
        align: "center",
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        resolution: 3,
      }
    );
    itemCountText.setOrigin(0.5, 0.5);
    this.add(itemCountText);

    const dir: Vector2 = new Phaser.Math.Vector2().setToPolar(angle);

    const distance: number = 40;
    this.scene.tweens.add({
      targets: this,
      ease: "Sine.easeOut",
      duration: 1000,
      delay: 0,
      x: {
        getStart: (): number => x,
        getEnd: (): number => x + dir.x * distance,
      },
      y: {
        getStart: (): number => y,
        getEnd: (): number => y + dir.y * distance,
      },
      alpha: {
        getStart: (): number => 1,
        getEnd: (): number => 0,
      },
      onComplete: (): void => {
        this.destroy();
      },
    });
  }
}
