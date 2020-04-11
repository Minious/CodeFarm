import * as Phaser from "phaser";

import { WorldScene } from "../../scenes/worldScene";

export class ActionPopup extends Phaser.GameObjects.Container {
    constructor (scene: Phaser.Scene, x: number, y: number, displayWidth: number, externalCallback: Function, texture: string, frame: number) {
        super(scene, x, y);

        let backgroundImage1 = this.scene.add.image(0, 0, 'ui_button');
        this.add(backgroundImage1);
        let backgroundImage1Bounds = backgroundImage1.getBounds();
        backgroundImage1.setPosition(0, - backgroundImage1Bounds.height);
        
        let backgroundImage2 = this.scene.add.image(0, - backgroundImage1Bounds.height / 2, 'ui_button');
        backgroundImage2.setDisplaySize(backgroundImage1Bounds.width / Math.sqrt(2), backgroundImage1Bounds.width / Math.sqrt(2));
        backgroundImage2.rotation = Math.PI / 4;
        this.add(backgroundImage2);

        this.bringToTop(backgroundImage1);

        let marginIcon = 14;
        let itemIcon = this.scene.add.sprite(0, - backgroundImage1Bounds.height, texture, frame);
        itemIcon.setDisplaySize(
            backgroundImage1Bounds.width - marginIcon,
            backgroundImage1Bounds.height - marginIcon
        );
        this.add(itemIcon);

        const actionPopupBounds = this.getBounds();
        this.setSize(actionPopupBounds.width, actionPopupBounds.height);

        this.scale = 0;

        let scale = displayWidth / backgroundImage1Bounds.width;
        this.scene.tweens.add({
            targets: this,
            ease: 'Elastic.easeOut',
            duration: 400,
            delay: 0,
            easeParams: [0.1, 0.7],
            // y: {
            //     getStart: () => y,
            //     getEnd: () => y - 10
            // },
            scale: {
                getStart: () => 0,
                getEnd: () => scale
            },
            onComplete: () => {
                if(this.scene) {
                    let hitArea = Phaser.Geom.Rectangle.Clone(actionPopupBounds);
                    hitArea.setPosition(
                        hitArea.x - this.x + hitArea.width / 2,
                        hitArea.y - this.y + hitArea.height / 2,
                    )

                    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

                    this.scene.input.enableDebug(this);
                    this.on('pointerdown', () => {
                        externalCallback();
                        this.scene.input.removeDebug(this);
                        (this.scene as WorldScene).popupClicked = true;
                        this.destroy();
                    });
                }
            }
        });
    }
}
