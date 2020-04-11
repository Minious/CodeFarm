import * as Phaser from "phaser";

import { ItemType } from "../../enums/itemType.enum";
import { getItemData } from "../../interfaces/itemData.interface";

export class LootAnim extends Phaser.GameObjects.Container {
    constructor (scene: Phaser.Scene, x: number, y: number, displayWidth: number, displayHeight: number, angle: number, itemType: ItemType, quantity: number) {
        super(scene, x, y);

        let itemTypeData = getItemData(itemType);

        let itemIcon = this.scene.add.sprite(0, 0, itemTypeData.texture, itemTypeData.frame);
        this.add(itemIcon);

        let itemIconBounds = itemIcon.getBounds();
        let itemCountText = this.scene.add.text(
            0,
            itemIconBounds.height / 2,
            quantity.toString(),
            {
                fontSize: '12px',
                fontFamily: '"Roboto Condensed"',
                align: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                resolution: 3
            }
        );
        itemCountText.setOrigin(0.5, 0.5);
        this.add(itemCountText);

        let dir = new Phaser.Math.Vector2().setToPolar(angle);

        let distance = 40;
        this.scene.tweens.add({
            targets: this,
            ease: 'Sine.easeOut',
            duration: 1000,
            delay: 0,
            x: {
                getStart: () => x,
                getEnd: () => x + dir.x * distance
            },
            y: {
                getStart: () => y,
                getEnd: () => y + dir.y * distance
            },
            alpha: {
                getStart: () => 1,
                getEnd: () => 0
            },
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
