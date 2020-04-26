import * as Phaser from "phaser";

import { MarketConfig } from "../../interfaces/marketConfig.interface";
import { ControllerScene } from "../../scenes/controllerScene";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOffer } from "../../interfaces/marketOffer.interface";
import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Vector2 } from "../../types/vector2.type";

/**
 * The Interface displayed in the UiScene showing the Market's offers. It
 * contains two columns, one displaying the Selling MarketOfferType offers and
 * the other the Buying MarketOfferType offers. A Selling offer trades money
 * against the player's items and a Buying offer trades item against the payer's
 * money. The MarketInterface contains a close button to which a callback can be
 * provided.
 */
export class MarketInterface extends Phaser.GameObjects.Container {
  // A Phaser Container holding all the offers
  private offers: Phaser.GameObjects.Container;
  // The list of offers of the Market
  private marketConfig: MarketConfig;

  /**
   * Creates the MarketInterface object.
   * @param {Phaser.Scene} scene - The Phaser Scene this Interface belongs to
   * (should be UiScene)
   * @param {number} x - The x position of the center of the MarketInterface
   * @param {number} y - The y position of the center of the MarketInterface
   * @param {() => void} externalCallback - The callback to call when the close
   * icon is clicked.
   */
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    externalCallback: () => void
  ) {
    super(scene, x, y);
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
    this.scene.input.enableDebug(closeIcon);
    closeIcon.input.hitAreaDebug.name = "marketCloseIconDebug";

    this.offers = this.scene.add.container(0, 0);
    this.add(this.offers);

    /**
     * Reloads the MarketInterface's offers when the Inventory changes to modify
     * the quantity of the item posessed in the offers.
     */
    this.scene.game.scene
      .getScene("ControllerScene")
      .events.on(
        "changedata-inventory",
        (parent: any, newInventory: any, oldInventory: any): void => {
          this.reloadOffers();
        }
      );
  }

  /**
   * Loads a new MarketConfig to be displayed by the MarketInterface.
   * @param {MarketConfig} marketConfig - The MarketConfig to display
   */
  public loadOffers(marketConfig: MarketConfig): void {
    this.marketConfig = marketConfig;

    // Destroy all the existing offers and recreate them
    this.offers.removeAll(true);
    this.createMarketOffers(marketConfig);
  }

  /**
   * Reloads the offers without changing the MarketConfig (Example : Used when
   * Inventory changes)
   */
  private reloadOffers(): void {
    // (Note : The condition should maybe be removed)
    if (this.marketConfig) {
      this.loadOffers(this.marketConfig);
    }
  }

  /**
   * Creates the offers Container and populate them with the data of the
   * MarketConfig.
   * @param marketConfig - The MarketConfig holding the offers data
   */
  private createMarketOffers(marketConfig: MarketConfig): void {
    const marginColumn: number = 120;
    const marginOffer: number = 60;

    const controllerScene: ControllerScene = this.scene.game.scene.getScene(
      "ControllerScene"
    ) as ControllerScene;

    /**
     * Creates an offer Container and populate it with the MarketOffer and adds
     * it to the MarketInterface.
     * @param {MarketOfferType} type - The MarketOfferType of the offer
     * @param {MarketOffer} offer - The MarketOffer containing the data of the offer
     * @param {number} idx - The index of the offer for positionning purposes
     */
    const createOffer = (
      type: MarketOfferType,
      offer: MarketOffer,
      idx: number
    ): void => {
      /**
       * The offerContainer contains the arrowContainer, the itemContainer and
       * the moneyContainer.
       */
      const offerContainer: Phaser.GameObjects.Container = this.scene.add.container(
        (type === MarketOfferType.Buying ? -1 : 1) * marginColumn,
        idx * marginOffer - 130
      );

      // The Container holding the arrow Image and the arrow Text
      const arrowContainer: Phaser.GameObjects.Container = this.scene.add.container(
        0,
        0
      );

      // Creates the arrow Image and adds it to the arrowContainer
      const arrow: Phaser.GameObjects.Image = this.scene.add
        .image(0, 0, "arrow")
        .setScale(2)
        .setInteractive();
      // Change arrow's appearance depending on its MarketOfferType
      if (type === MarketOfferType.Buying) {
        arrow.setRotation(Math.PI);
        arrow.setOrigin(0.4, 0.5);
        arrow.setTint(0x66ff66);
      }
      if (type === MarketOfferType.Selling) {
        arrow.setFlipY(true);
        arrow.setOrigin(0.6, 0.5);
        arrow.setTint(0xff6666);
      }
      /**
       * Flip the arrow when pointer enters or exits it to switch shadow's side
       * to mimic the arrow button being pressed.
       */
      arrow.on("pointerover", (): void => {
        arrow.setFlipY(!arrow.flipY);
      });
      arrow.on("pointerout", (): void => {
        arrow.setFlipY(!arrow.flipY);
      });
      // Exchange the money with the item when arrow clicked
      arrow.on("pointerdown", (): void => {
        if (type === MarketOfferType.Buying) {
          if (controllerScene.data.get("money") >= offer.price) {
            controllerScene.modifyItemTypeQuantityInInventory(offer.item, 1);
            controllerScene.modifyMoneyAmount(-offer.price);
          }
        }
        if (type === MarketOfferType.Selling) {
          if (controllerScene.inventoryContains(offer.item)) {
            controllerScene.modifyItemTypeQuantityInInventory(offer.item, -1);
            controllerScene.modifyMoneyAmount(offer.price);
          }
        }
      });
      arrowContainer.add(arrow);

      // Creates the arrow Text and adds it to the arrowContainer
      const arrowTextPosX: number = type === MarketOfferType.Buying ? 5 : -15;
      const arrowTextContent: string =
        type === MarketOfferType.Buying ? "BUY" : "SELL";
      const arrowText: Phaser.GameObjects.Text = this.scene.add
        .text(arrowTextPosX, 0, arrowTextContent, {
          fontSize: "16px",
          fontFamily: '"Roboto Condensed"',
          resolution: 3,
        })
        .setOrigin(0.5, 0.5);
      arrowContainer.add(arrowText);

      offerContainer.add(arrowContainer);

      // The Container holding the item Image and the item's quantity Text
      const itemContainer: Phaser.GameObjects.Container = this.scene.add.container(
        -70,
        0
      );
      const itemTypeData: ItemData = getItemData(offer.item);
      const itemIcon: Phaser.GameObjects.Sprite = this.scene.add
        .sprite(0, 0, itemTypeData.texture, itemTypeData.frame)
        .setScale(3);
      itemContainer.add(itemIcon);
      const inventoryItemQuantity: number = controllerScene.getInventoryItemQuantity(
        offer.item
      );
      const itemQuantityText: Phaser.GameObjects.Text = this.scene.add
        .text(-25, 0, inventoryItemQuantity.toString(), {
          fontSize: "16px",
          fontFamily: '"Roboto Condensed"',
          resolution: 3,
        })
        .setOrigin(1, 0.5);
      itemContainer.add(itemQuantityText);
      offerContainer.add(itemContainer);

      // The Container holding the money Image and the money quantity Text
      const moneyContainer: Phaser.GameObjects.Container = this.scene.add.container(
        70,
        0
      );
      const moneyImage: Phaser.GameObjects.Image = this.scene.add
        .image(0, 0, "money")
        .setScale(2);
      moneyContainer.add(moneyImage);
      const moneyAmountText: Phaser.GameObjects.Text = this.scene.add
        .text(0, 0, offer.price.toString(), {
          fontSize: "26px",
          fontFamily: '"Roboto Condensed"',
          resolution: 3,
        })
        .setOrigin(0.5, 0.5);
      moneyContainer.add(moneyAmountText);
      offerContainer.add(moneyContainer);

      this.offers.add(offerContainer);
    };

    // Creates the offers for each MarketOffer's offers
    marketConfig.buyingOffers.forEach((offer: MarketOffer, idx: number): void =>
      createOffer(MarketOfferType.Buying, offer, idx)
    );
    marketConfig.sellingOffers.forEach(
      (offer: MarketOffer, idx: number): void =>
        createOffer(MarketOfferType.Selling, offer, idx)
    );
  }
}
