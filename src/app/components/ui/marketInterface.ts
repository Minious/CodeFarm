import * as Phaser from "phaser";

import { MarketConfig } from "../../interfaces/marketConfig.interface";
import { ControllerScene } from "../../scenes/controllerScene";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOffer } from "../../interfaces/marketOffer.interface";
import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Vector2 } from "../../types/vector2.type";

export class MarketInterface extends Phaser.GameObjects.Container {
  private offers: Phaser.GameObjects.Container;
  private marketConfig: MarketConfig;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    externalCallback: () => void
  ) {
    super(scene, x, y);
    this.name = "marketInterface";

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

    this.scene.game.scene
      .getScene("ControllerScene")
      .events.on(
        "changedata-inventory",
        (parent: any, newInventory: any, oldInventory: any): void => {
          this.reloadOffers();
        }
      );
  }

  public loadOffers(marketConfig: MarketConfig): void {
    this.marketConfig = marketConfig;

    this.offers.removeAll(true);
    this.createMarketOffers(marketConfig);
  }

  private reloadOffers(): void {
    if (this.marketConfig) {
      this.loadOffers(this.marketConfig);
    }
  }

  private createMarketOffers(marketConfig: MarketConfig): void {
    const marginColumn: number = 120;
    const marginOffer: number = 60;

    const controllerScene: ControllerScene = this.scene.game.scene.getScene(
      "ControllerScene"
    ) as ControllerScene;

    const createOffer = (
      type: MarketOfferType,
      offer: MarketOffer,
      idx: number
    ): void => {
      const offerContainer: Phaser.GameObjects.Container = this.scene.add.container(
        (type === MarketOfferType.Buying ? -1 : 1) * marginColumn,
        idx * marginOffer - 130
      );

      const arrowContainer: Phaser.GameObjects.Container = this.scene.add.container(
        0,
        0
      );
      const arrow: Phaser.GameObjects.Image = this.scene.add
        .image(0, 0, "arrow")
        .setScale(2)
        .setInteractive();
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
      arrow.on("pointerover", (): void => {
        arrow.setFlipY(!arrow.flipY);
      });
      arrow.on("pointerout", (): void => {
        arrow.setFlipY(!arrow.flipY);
      });
      arrow.on("pointerdown", (): void => {
        if (type === MarketOfferType.Buying) {
          if (controllerScene.data.get("money") >= offer.price) {
            controllerScene.modifyInventoryItemQuantity(offer.item, 1);
            controllerScene.changeMoneyAmount(-offer.price);
          }
        }
        if (type === MarketOfferType.Selling) {
          if (controllerScene.inventoryContains(offer.item)) {
            controllerScene.modifyInventoryItemQuantity(offer.item, -1);
            controllerScene.changeMoneyAmount(offer.price);
          }
        }
      });
      arrowContainer.add(arrow);
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
    marketConfig.buyingOffers.forEach((offer: MarketOffer, idx: number): void =>
      createOffer(MarketOfferType.Buying, offer, idx)
    );
    marketConfig.sellingOffers.forEach(
      (offer: MarketOffer, idx: number): void =>
        createOffer(MarketOfferType.Selling, offer, idx)
    );
  }
}
