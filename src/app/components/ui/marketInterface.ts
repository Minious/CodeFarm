import * as Phaser from "phaser";

import { MarketConfig } from "../../interfaces/marketConfig.interface";
import { ControllerScene } from "../../scenes/controllerScene";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOffer } from "../../interfaces/marketOffer.interface";
import { getItemData } from "../../interfaces/itemData.interface";

export class MarketInterface extends Phaser.GameObjects.Container {
  private offers: Phaser.GameObjects.Container;
  private marketConfig: MarketConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    externalCallback: Function
  ) {
    super(scene, x, y);
    this.name = "marketInterface";

    let backgroundImage = this.scene.add.image(0, 0, "ui_button");
    let backgroundMargin = 40;
    backgroundImage.setDisplaySize(
      this.scene.cameras.main.displayWidth - 2 * backgroundMargin,
      this.scene.cameras.main.displayHeight - 2 * backgroundMargin
    );
    this.add(backgroundImage);

    let closeIconOffset = 28;
    let closeIconPos = {
      x:
        -this.scene.cameras.main.displayWidth / 2 +
        backgroundMargin +
        closeIconOffset,
      y:
        -this.scene.cameras.main.displayHeight / 2 +
        backgroundMargin +
        closeIconOffset,
    };
    let closeIcon = this.scene.add
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

    this.scene.game.scene
      .getScene("ControllerScene")
      .events.on(
        "changedata-inventory",
        (parent: any, newInventory: any, oldInventory: any) => {
          this.reloadOffers();
        }
      );
  }

  reloadOffers() {
    if (this.marketConfig) {
      this.loadOffers(this.marketConfig);
    }
  }

  loadOffers(marketConfig: MarketConfig) {
    this.marketConfig = marketConfig;

    this.offers.removeAll(true);
    this.createMarketOffers(marketConfig);
  }

  createMarketOffers(marketConfig: MarketConfig) {
    let marginColumn = 120;
    let marginOffer = 60;

    let controllerScene = this.scene.game.scene.getScene(
      "ControllerScene"
    ) as ControllerScene;

    let createOffer = (
      type: MarketOfferType,
      offer: MarketOffer,
      idx: number
    ) => {
      let offerContainer = this.scene.add.container(
        (type == MarketOfferType.Buying ? -1 : 1) * marginColumn,
        idx * marginOffer - 130
      );

      let arrowContainer = this.scene.add.container(0, 0);
      let arrow = this.scene.add
        .image(0, 0, "arrow")
        .setScale(2)
        .setInteractive();
      if (type == MarketOfferType.Buying) {
        arrow.setRotation(Math.PI);
        arrow.setOrigin(0.4, 0.5);
        arrow.setTint(0x66ff66);
      }
      if (type == MarketOfferType.Selling) {
        arrow.setFlipY(true);
        arrow.setOrigin(0.6, 0.5);
        arrow.setTint(0xff6666);
      }
      arrow.on("pointerover", () => {
        arrow.setFlipY(!arrow.flipY);
      });
      arrow.on("pointerout", () => {
        arrow.setFlipY(!arrow.flipY);
      });
      arrow.on("pointerdown", () => {
        if (type == MarketOfferType.Buying) {
          if (controllerScene.data.get("money") >= offer.price) {
            controllerScene.modifyInventoryItemQuantity(offer.item, 1);
            controllerScene.changeMoneyAmount(-offer.price);
          }
        }
        if (type == MarketOfferType.Selling) {
          if (controllerScene.inventoryContains(offer.item)) {
            controllerScene.modifyInventoryItemQuantity(offer.item, -1);
            controllerScene.changeMoneyAmount(offer.price);
          }
        }
      });
      arrowContainer.add(arrow);
      let arrowTextPosX = type == MarketOfferType.Buying ? 5 : -15;
      let arrowTextContent = type == MarketOfferType.Buying ? "BUY" : "SELL";
      let arrowText = this.scene.add
        .text(arrowTextPosX, 0, arrowTextContent, {
          fontSize: "16px",
          fontFamily: '"Roboto Condensed"',
          resolution: 3,
        })
        .setOrigin(0.5, 0.5);
      arrowContainer.add(arrowText);
      offerContainer.add(arrowContainer);

      let itemContainer = this.scene.add.container(-70, 0);
      let itemTypeData = getItemData(offer.item);
      let itemIcon = this.scene.add
        .sprite(0, 0, itemTypeData.texture, itemTypeData.frame)
        .setScale(3);
      itemContainer.add(itemIcon);
      let inventoryItemQuantity = controllerScene.getInventoryItemQuantity(
        offer.item
      );
      let itemQuantityText = this.scene.add
        .text(-25, 0, inventoryItemQuantity.toString(), {
          fontSize: "16px",
          fontFamily: '"Roboto Condensed"',
          resolution: 3,
        })
        .setOrigin(1, 0.5);
      itemContainer.add(itemQuantityText);
      offerContainer.add(itemContainer);

      let moneyContainer = this.scene.add.container(70, 0);
      let moneyImage = this.scene.add.image(0, 0, "money").setScale(2);
      moneyContainer.add(moneyImage);
      let moneyAmountText = this.scene.add
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
    marketConfig.buyingOffers.forEach((offer, idx) =>
      createOffer(MarketOfferType.Buying, offer, idx)
    );
    marketConfig.sellingOffers.forEach((offer, idx) =>
      createOffer(MarketOfferType.Selling, offer, idx)
    );
  }
}
