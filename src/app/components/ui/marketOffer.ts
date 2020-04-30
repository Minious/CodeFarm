import * as Phaser from "phaser";

import { UiScene } from "../../scenes/uiScene";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOfferData } from "../../interfaces/marketOfferData.interface";
import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Subscription } from "rxjs";

export class MarketOffer extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  private itemQuantityText: Phaser.GameObjects.Text;
  private inventoryItemTypeQuantityUpdateSubscription: Subscription;
  private moneyAmountText: Phaser.GameObjects.Text;
  private marketOfferType: MarketOfferType;
  private itemIcon: Phaser.GameObjects.Sprite;
  private arrowImage: Phaser.GameObjects.Image;

  // The index of the MarketOffer in the MarketConfig displayed
  private marketOfferIndex: number;

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
   * @param {MarketOfferType} marketOfferType - The type of this MarketOffer (either BUY or
   * SELL)
   * @param {number} marketOfferIndex - TODO
   */
  public constructor(
    uiScene: UiScene,
    x: number,
    y: number,
    marketOfferType: MarketOfferType,
    marketOfferIndex: number
  ) {
    super(uiScene, x, y);

    this.marketOfferIndex = marketOfferIndex;
    this.marketOfferType = marketOfferType;

    // The Container holding the item Image and the item's quantity Text
    const itemContainer: Phaser.GameObjects.Container = this.createItemContainer();
    this.add(itemContainer);

    // The Container holding the money Image and the money quantity Text
    const moneyContainer: Phaser.GameObjects.Container = this.createMoneyContainer();
    this.add(moneyContainer);

    // The Container holding the arrow Image and the arrow Text
    const arrowContainer: Phaser.GameObjects.Container = this.createArrowContainer();
    this.add(arrowContainer);

    this.scene.scenesManager.controllerScene
      .getMarketOfferUpdate$(this.marketOfferIndex, this.marketOfferType)
      .subscribe((marketOfferData: MarketOfferData): void => {
        this.updateContent(marketOfferData);
      });
  }

  public updateContent(marketOfferData: MarketOfferData): void {
    this.moneyAmountText.setText(marketOfferData.price.toString());

    const itemTypeData: ItemData = getItemData(marketOfferData.item);
    this.itemIcon.setTexture(itemTypeData.texture);
    this.itemIcon.setFrame(itemTypeData.frame);

    if (this.inventoryItemTypeQuantityUpdateSubscription) {
      this.inventoryItemTypeQuantityUpdateSubscription.unsubscribe();
    }
    this.inventoryItemTypeQuantityUpdateSubscription = this.scene.scenesManager.controllerScene
      .getInventoryItemTypeQuantityUpdate$(marketOfferData.item)
      .subscribe((newQuantity: number): void => {
        this.itemQuantityText.setText(newQuantity.toString());
      });

    this.setArrowClickCallback(marketOfferData);
  }

  private createItemContainer(): Phaser.GameObjects.Container {
    const itemContainer: Phaser.GameObjects.Container = this.scene.add.container(
      -70,
      0
    );
    this.itemIcon = this.scene.add
      .sprite(0, 0, undefined, undefined)
      .setScale(3);
    itemContainer.add(this.itemIcon);
    this.itemQuantityText = this.scene.add
      .text(-25, 0, "", {
        fontSize: "16px",
        fontFamily: '"Roboto Condensed"',
        resolution: 3,
      })
      .setOrigin(1, 0.5);
    itemContainer.add(this.itemQuantityText);

    return itemContainer;
  }

  private createMoneyContainer(): Phaser.GameObjects.Container {
    const moneyContainer: Phaser.GameObjects.Container = this.scene.add.container(
      70,
      0
    );
    const moneyImage: Phaser.GameObjects.Image = this.scene.add
      .image(0, 0, "money")
      .setScale(2);
    moneyContainer.add(moneyImage);
    this.moneyAmountText = this.scene.add
      .text(0, 0, "", {
        fontSize: "26px",
        fontFamily: '"Roboto Condensed"',
        resolution: 3,
      })
      .setOrigin(0.5, 0.5);
    moneyContainer.add(this.moneyAmountText);

    return moneyContainer;
  }

  private createArrowContainer(): Phaser.GameObjects.Container {
    const arrowContainer: Phaser.GameObjects.Container = this.scene.add.container(
      0,
      0
    );

    // Creates the arrow Image and adds it to the arrowContainer
    this.arrowImage = this.scene.add
      .image(0, 0, "arrow")
      .setScale(2)
      .setInteractive();
    // Change arrow's appearance depending on the MarketOfferType
    if (this.marketOfferType === MarketOfferType.Buying) {
      this.arrowImage.setRotation(Math.PI);
      this.arrowImage.setOrigin(0.4, 0.5);
      this.arrowImage.setTint(0x66ff66);
    }
    if (this.marketOfferType === MarketOfferType.Selling) {
      this.arrowImage.setFlipY(true);
      this.arrowImage.setOrigin(0.6, 0.5);
      this.arrowImage.setTint(0xff6666);
    }
    arrowContainer.add(this.arrowImage);

    // Creates the arrow Text and adds it to the arrowContainer
    const arrowTextPosX: number =
      this.marketOfferType === MarketOfferType.Buying ? 5 : -15;
    const arrowTextContent: string =
      this.marketOfferType === MarketOfferType.Buying ? "BUY" : "SELL";
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

  private setArrowClickCallback(marketOfferData: MarketOfferData): void {
    /**
     * Flip the arrow when pointer enters or exits it to switch shadow's side
     * to mimic the arrow button being pressed.
     */
    this.arrowImage.off("pointerover");
    this.arrowImage.on("pointerover", (): void => {
      this.arrowImage.setFlipY(!this.arrowImage.flipY);
    });
    this.arrowImage.off("pointerout");
    this.arrowImage.on("pointerout", (): void => {
      this.arrowImage.setFlipY(!this.arrowImage.flipY);
    });
    /**
     * Exchange the money with the item when arrow clicked
     * (Note : If item's quantity changed first, the Inventory's data change
     * event callback is called and the MarketOffer is destroyed and recreated
     * by the MarketInterface)
     */
    this.arrowImage.off("pointerdown");
    this.arrowImage.on("pointerdown", (): void => {
      if (this.marketOfferType === MarketOfferType.Buying) {
        if (
          this.scene.scenesManager.controllerScene.moneyAmount >=
          marketOfferData.price
        ) {
          this.scene.scenesManager.controllerScene.modifyMoneyAmount(
            -marketOfferData.price
          );
          this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
            marketOfferData.item,
            1
          );
        }
      }
      if (this.marketOfferType === MarketOfferType.Selling) {
        if (
          this.scene.scenesManager.controllerScene.inventoryContains(
            marketOfferData.item
          )
        ) {
          this.scene.scenesManager.controllerScene.modifyMoneyAmount(
            marketOfferData.price
          );
          this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
            marketOfferData.item,
            -1
          );
        }
      }
    });
  }
}
