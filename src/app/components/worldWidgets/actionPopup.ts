import * as Phaser from "phaser";

import { WorldScene } from "../../scenes/worldScene";
import { ControllerScene } from "../../scenes/controllerScene";

/**
 * A Popup icon displayed in the world view asking the player for a double click
 * confirmation to trigger an action (make field, plant crop, harvest crop).
 */
export class ActionPopup extends Phaser.GameObjects.Container {
  /**
   * Creates the ActionPopup object.
   * @param {Phaser.Scene} scene - The Phaser Scene this Popup belongs to
   * (should be WorldScene)
   * @param {number} x - The x position of the Popup in the world
   * @param {number} y - The y position of the Popup in the world
   * @param {number} displayWidth - The width of the Popup
   * @param {() => void} externalCallback - The callback to call when the Popup
   * is clicked
   * @param {string} texture - The texture name of the icon displayed in the Popup
   * @param {number} frame - The frame index of the icon in the texture
   */
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

    // Creates the background Images of the Popup.
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

    // Creates the icon displayed inside the Popup.
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

    // Defines the bounding box of the Popup for clicks
    const actionPopupBounds: Phaser.Geom.Rectangle = this.getBounds();
    this.setSize(actionPopupBounds.width, actionPopupBounds.height);

    const hitArea: Phaser.Geom.Rectangle = Phaser.Geom.Rectangle.Clone(
      actionPopupBounds
    );
    // Alors ça aucune idée de pourquoi j'ai fait ça
    // (Note : À investiguer)
    hitArea.setPosition(
      hitArea.x - this.x + hitArea.width / 2,
      hitArea.y - this.y + hitArea.height / 2
    );

    /**
     * Set the click callback which calls the externalCallback and destroys the
     * Popup
     */
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    if (
      (this.scene.game.scene.getScene("ControllerScene") as ControllerScene)
        .debugEnabled
    ) {
      this.scene.input.enableDebug(this);
    }

    this.on("pointerdown", (): void => {
      externalCallback();
      if (
        (this.scene.game.scene.getScene("ControllerScene") as ControllerScene)
          .debugEnabled
      ) {
        this.scene.input.removeDebug(this);
      }
      (this.scene as WorldScene).popupClicked = true;
      this.destroy();
    });

    // Start the creation animation
    const targetScale: number = displayWidth / backgroundImage1Bounds.width;
    this.scale = 0;
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
        getEnd: (): number => targetScale,
      },
    });
  }
}
