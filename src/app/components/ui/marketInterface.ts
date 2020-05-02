import * as Phaser from "phaser";

import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { Vector2 } from "../../types/vector2.type";
import { UiScene } from "../../scenes/uiScene";
import { MarketOffer } from "./marketOffer";
import { ControllerScene } from "../../scenes/controllerScene";

/**
 * The Interface displayed in the UiScene showing the Market's offers. It
 * contains two columns, one displaying the Selling MarketOfferType offers and
 * the other the Buying MarketOfferType offers. A Selling offer trades money
 * against the player's items and a Buying offer trades item against the
 * p/ayer's money. The MarketInterface contains a close button to which a click
 * callback can be provided.
 */
export class MarketInterface extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  // A Phaser Group holding all the offers
  private offers: Phaser.GameObjects.Group;

  /**
   * Creates the MarketInterface object.
   * @param {UiScene} uiScene - The UiScene this Interface belongs to
   * @param {number} x - The x position of the center of the MarketInterface
   * @param {number} y - The y position of the center of the MarketInterface
   * @param {() => void} externalCallback - The callback to call when the close
   * icon is clicked.
   */
  public constructor(
    uiScene: UiScene,
    x: number,
    y: number,
    externalCallback: () => void
  ) {
    super(uiScene, x, y);
    this.name = "marketInterface";

    // Creates the background Image
    const backgroundImage: Phaser.GameObjects.Image = this.scene.add.image(
      0,
      0,
      "ui_button"
    );
    const backgroundMargin: number = 40;
    backgroundImage.setDisplaySize(
      this.scene.cameras.main.displayWidth - 2 * backgroundMargin,
      this.scene.cameras.main.displayHeight - 2 * backgroundMargin
    );
    this.add(backgroundImage);

    /**
     * Creates the close icon Image and enable the call to the callback when
     * clicked.
     */
    const closeIconOffset: number = 28;
    const closeIconPos: Vector2 = {
      x:
        -this.scene.cameras.main.displayWidth / 2 +
        backgroundMargin +
        closeIconOffset,
      y:
        -this.scene.cameras.main.displayHeight / 2 +
        backgroundMargin +
        closeIconOffset,
    };
    const closeIcon: Phaser.GameObjects.Image = this.scene.add
      .image(closeIconPos.x, closeIconPos.y, "closeIcon")
      .setScale(2)
      .setInteractive();
    this.add(closeIcon);
    closeIcon.name = "marketInterfaceCloseIcon";

    closeIcon.on("pointerup", externalCallback);

    if (this.scene.scenesManager.controllerScene.debugEnabled) {
      this.scene.input.enableDebug(closeIcon);
      closeIcon.input.hitAreaDebug.name = "marketCloseIconDebug";
    }

    // Creates the MarketOffers
    this.offers = this.scene.add.group();
    this.createMarketOffers();
  }

  /**
   * Creates MarketOffers from a MarketConfig and adds them to the
   * MarketInterface
   * @param marketConfig - The MarketConfig holding the offers data
   */
  private createMarketOffers(): void {
    /**
     * (Note : Should MarketOffer's position be calculated in the MarketOffer
     * with idx, marginColumn and marginOffer - rename marginOffer))
     */
    const marginColumn: number = 120;
    const marginOffer: number = 60;

    // Creates the offers for each MarketOfferData in the MarketConfig
    for (
      let idx: number = 0;
      idx < ControllerScene.BUYING_OFFERS_COUNT;
      idx += 1
    ) {
      const marketOffer: MarketOffer = new MarketOffer(
        this.scene,
        -marginColumn,
        idx * marginOffer - 130,
        MarketOfferType.Buying,
        idx
      );
      this.offers.add(marketOffer);
      this.add(marketOffer);
    }
    for (
      let idx: number = 0;
      idx < ControllerScene.SELLING_OFFERS_COUNT;
      idx += 1
    ) {
      const marketOffer: MarketOffer = new MarketOffer(
        this.scene,
        marginColumn,
        idx * marginOffer - 130,
        MarketOfferType.Selling,
        idx
      );
      this.offers.add(marketOffer);
      this.add(marketOffer);
    }
  }
}
