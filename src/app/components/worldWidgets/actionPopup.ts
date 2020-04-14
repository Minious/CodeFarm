import * as Phaser from "phaser";

import { WorldScene } from "../../scenes/worldScene";

export class ActionPopup extends Phaser.GameObjects.Container {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    displayWidth: number,
    externalCallback: () => void,
    texture: string,
    frame: number
  ) {
    super(scene, x, y);

    const backgroundImage1: Phaser.GameObjects.Image = this.scene.add.image(
      0,
      0,
      "ui_button"
    );
    this.add(backgroundImage1);
    const backgroundImage1Bounds: Phaser.Geom.Rectangle = backgroundImage1.getBounds();
    backgroundImage1.setPosition(0, -backgroundImage1Bounds.height);

    const backgroundImage2: Phaser.GameObjects.Image = this.scene.add.image(
      0,
      -backgroundImage1Bounds.height / 2,
      "ui_button"
    );
    backgroundImage2.setDisplaySize(
      backgroundImage1Bounds.width / Math.sqrt(2),
      backgroundImage1Bounds.width / Math.sqrt(2)
    );
    backgroundImage2.rotation = Math.PI / 4;
    this.add(backgroundImage2);

    this.bringToTop(backgroundImage1);

    const marginIcon: number = 14;
    const itemIcon: Phaser.GameObjects.Sprite = this.scene.add.sprite(
      0,
      -backgroundImage1Bounds.height,
      texture,
      frame
    );
    itemIcon.setDisplaySize(
      backgroundImage1Bounds.width - marginIcon,
      backgroundImage1Bounds.height - marginIcon
    );
    this.add(itemIcon);

    const actionPopupBounds: Phaser.Geom.Rectangle = this.getBounds();
    this.setSize(actionPopupBounds.width, actionPopupBounds.height);

    this.scale = 0;

    const scale: number = displayWidth / backgroundImage1Bounds.width;
    this.scene.tweens.add({
      targets: this,
      ease: "Elastic.easeOut",
      duration: 400,
      delay: 0,
      easeParams: [0.1, 0.7],
      // y: {
      //     getStart: () => y,
      //     getEnd: () => y - 10
      // },
      scale: {
        getStart: (): number => 0,
        getEnd: (): number => scale,
      },
      onComplete: (): void => {
        if (this.scene) {
          const hitArea: Phaser.Geom.Rectangle = Phaser.Geom.Rectangle.Clone(
            actionPopupBounds
          );
          hitArea.setPosition(
            hitArea.x - this.x + hitArea.width / 2,
            hitArea.y - this.y + hitArea.height / 2
          );

          this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

          this.scene.input.enableDebug(this);
          this.on("pointerdown", (): void => {
            externalCallback();
            this.scene.input.removeDebug(this);
            (this.scene as WorldScene).popupClicked = true;
            this.destroy();
          });
        }
      },
    });
  }
}
