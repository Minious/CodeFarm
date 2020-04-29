import * as Phaser from "phaser";

import { UiScene } from "../../scenes/uiScene";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOfferData } from "../../interfaces/marketOfferData.interface";
import { getItemData, ItemData } from "../../interfaces/itemData.interface";

export class MarketOffer extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  /**
   * The MarketOffer game object trade's money against items. The data of this
   * transaction is grabbed as the MarketOfferData. A Selling offer trades money
   * against the player's items and a Buying offer trades item against the
   * payer's money. Its type is defined by the MarketOfferType. The MarketOffer
   * contains three parts : the arrowContainer, the itemContainer and the
   * moneyContainer. The itemContainer displays the item icon Image and a Text
   * of the item's quantity in the player's Inventory. The moneyContainer
   * displays a money icon Image and a Text of the item cost. The arrowContainer
   * displays an arrow icon Image with the text "BUY" or "SELL" depending on the
   * MarketOfferType.
   * @param {UiScene} uiScene - The UiScene this MarketOffer belongs to
   * @param {number} x - The x position of the center of the MarketOffer
   * @param {number} y - The y position of the center of the MarketOffer
   * @param {MarketOfferType} type - The type of this MarketOffer (either BUY or
   * SELL)
   * @param {MarketOfferData} offer - The MarketOffer data : item and price
   */
  public constructor(
    uiScene: UiScene,
    x: number,
    y: number,
    type: MarketOfferType,
    offer: MarketOfferData
  ) {
    super(uiScene, x, y);

    // The Container holding the item Image and the item's quantity Text
    const itemContainer: Phaser.GameObjects.Container = this.createItemContainer(
      offer
    );
    this.add(itemContainer);

    // The Container holding the money Image and the money quantity Text
    const moneyContainer: Phaser.GameObjects.Container = this.createMoneyContainer(
      offer
    );
    this.add(moneyContainer);

    // The Container holding the arrow Image and the arrow Text
    const arrowContainer: Phaser.GameObjects.Container = this.createArrowContainer(
      type,
      offer
    );
    this.add(arrowContainer);
  }

  private createItemContainer(
    offer: MarketOfferData
  ): Phaser.GameObjects.Container {
    const itemContainer: Phaser.GameObjects.Container = this.scene.add.container(
      -70,
      0
    );
    const itemTypeData: ItemData = getItemData(offer.item);
    const itemIcon: Phaser.GameObjects.Sprite = this.scene.add
      .sprite(0, 0, itemTypeData.texture, itemTypeData.frame)
      .setScale(3);
    itemContainer.add(itemIcon);
    const inventoryItemQuantity: number = this.scene.scenesManager.controllerScene.getInventoryItemQuantity(
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

    return itemContainer;
  }

  private createMoneyContainer(
    offer: MarketOfferData
  ): Phaser.GameObjects.Container {
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

    return moneyContainer;
  }

  private createArrowContainer(
    type: MarketOfferType,
    offer: MarketOfferData
  ): Phaser.GameObjects.Container {
    const arrowContainer: Phaser.GameObjects.Container = this.scene.add.container(
      0,
      0
    );

    // Creates the arrow Image and adds it to the arrowContainer
    const arrow: Phaser.GameObjects.Image = this.scene.add
      .image(0, 0, "arrow")
      .setScale(2)
      .setInteractive();
    // Change arrow's appearance depending on the MarketOfferType
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
    this.enableArrowClickCallback(arrow, type, offer);
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

    return arrowContainer;
  }

  private enableArrowClickCallback(
    arrow: Phaser.GameObjects.Image,
    type: MarketOfferType,
    offer: MarketOfferData
  ): void {
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
    /**
     * Exchange the money with the item when arrow clicked
     * (Note : If item's quantity changed first, the Inventory's data change
     * event callback is called and the MarketOffer is destroyed and recreated
     * by the MarketInterface)
     */
    arrow.on("pointerdown", (): void => {
      if (type === MarketOfferType.Buying) {
        if (
          this.scene.scenesManager.controllerScene.data.get("money") >=
          offer.price
        ) {
          this.scene.scenesManager.controllerScene.modifyMoneyAmount(
            -offer.price
          );
          this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
            offer.item,
            1
          );
        }
      }
      if (type === MarketOfferType.Selling) {
        if (
          this.scene.scenesManager.controllerScene.inventoryContains(offer.item)
        ) {
          this.scene.scenesManager.controllerScene.modifyMoneyAmount(
            offer.price
          );
          this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
            offer.item,
            -1
          );
        }
      }
    });
  }
}
