import * as Phaser from "phaser";

import { MarketConfig } from "../../interfaces/marketConfig.interface";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOfferData } from "../../interfaces/marketOfferData.interface";
import { Vector2 } from "../../types/vector2.type";
import { UiScene } from "../../scenes/uiScene";
import { MarketOffer } from "./marketOffer";

/**
 * The Interface displayed in the UiScene showing the Market's offers. It
 * contains two columns, one displaying the Selling MarketOfferType offers and
 * the other the Buying MarketOfferType offers. A Selling offer trades money
 * against the player's items and a Buying offer trades item against the payer's
 * money. The MarketInterface contains a close button to which a callback can be
 * provided.
 */
export class MarketInterface extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  // A Phaser Container holding all the offers
  private offers: Phaser.GameObjects.Container;

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

    this.offers = this.scene.add.container(0, 0);
    this.add(this.offers);

    /**
     * Doesn't reload the MarketInterface's offers when the Inventory changes to
     * modify the quantity of the item posessed in the offers.
     * This is broken on purpose, the MarketOffers won't refresh until the event
     * changedata-inventoty-item-quantity-update is implemented in marketOffer.
     */
  }

  /**
   * Loads a new MarketConfig to be displayed by the MarketInterface.
   * @param {MarketConfig} marketConfig - The MarketConfig to display
   */
  public loadOffers(marketConfig: MarketConfig): void {
    // Destroy all the existing offers and recreate them
    this.offers.removeAll(true);
    this.createMarketOffers(marketConfig);
  }

  /**
   * Creates MarketOffers from a MarketConfig and adds them to the
   * MarketInterface
   * @param marketConfig - The MarketConfig holding the offers data
   */
  private createMarketOffers(marketConfig: MarketConfig): void {
    const marginColumn: number = 120;
    const marginOffer: number = 60;

    // Creates the offers for each MarketOfferData in the MarketConfig
    marketConfig.buyingOffers.forEach(
      (offer: MarketOfferData, idx: number): void => {
        const marketOffer: MarketOffer = new MarketOffer(
          this.scene,
          -marginColumn,
          idx * marginOffer - 130,
          MarketOfferType.Buying,
          offer
        );
        this.offers.add(marketOffer);
      }
    );
    marketConfig.sellingOffers.forEach(
      (offer: MarketOfferData, idx: number): void => {
        const marketOffer: MarketOffer = new MarketOffer(
          this.scene,
          marginColumn,
          idx * marginOffer - 130,
          MarketOfferType.Selling,
          offer
        );
        this.offers.add(marketOffer);
      }
    );
  }
}
