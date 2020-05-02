import * as Phaser from "phaser";
import { Subscription } from "rxjs";

import { UiScene } from "../../scenes/uiScene";
import { MarketOfferType } from "../../enums/marketOfferType.enum";
import { MarketOfferData } from "../../interfaces/marketOfferData.interface";
import { getItemData, ItemData } from "../../interfaces/itemData.interface";

/**
 * A MarketOffer in the MarketInterface. The MarketOffer can be of two types :
 * BUYING or SELLING. A Selling offer trades money against the player's items
 * and a Buying offer trades item against the player's money. Displays the
 * content of a MarketOfferData. The displayed MarketOfferData is specified by
 * its MarketOfferType type and index in the MarketConfig. The MarketOffer
 * retrieves the latest MarketConfig with the ControllerScene's stream
 * _marketOfferUpdate$. Each time the stream emits, the MarketOffer subscribe to
 * the ControllerScene's stream _inventoryItemTypeQuantityUpdate$ to update the
 * displayed quantity of the MarketOfferData item's ItemType. The MarketOffer
 * contains three parts : the arrowContainer, the itemContainer and the
 * moneyContainer. The itemContainer displays the item icon Image and a Text of
 * the item's quantity in the player's Inventory. The moneyContainer displays a
 * money icon Image and a Text of the item cost. The arrowContainer displays an
 * arrow icon Image with the text "BUY" or "SELL" depending on the
 * MarketOfferType.
 */
export class MarketOffer extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  // The type of the MarketOffer (BUYING or SELLING)
  private marketOfferType: MarketOfferType;
  /**
   * The subscription to the stream emitting the total quantity of the item in
   * the MarketOfferData. Subscribe to the new ItemType stream when the item in
   * MarketOfferData changes.
   */
  private inventoryItemTypeQuantityUpdateSubscription: Subscription;

  private itemImage: Phaser.GameObjects.Image;
  private arrowImage: Phaser.GameObjects.Image;
  private itemQuantityText: Phaser.GameObjects.Text;
  private moneyAmountText: Phaser.GameObjects.Text;

  // The index of the MarketOffer in the MarketConfig displayed
  private marketOfferIndex: number;

  /**
   * Creates the MarketOffer object.
   * @param {UiScene} uiScene - The UiScene this MarketOffer belongs to
   * @param {number} x - The x position of the center of the MarketOffer
   * @param {number} y - The y position of the center of the MarketOffer
   * @param {MarketOfferType} marketOfferType - The type of this MarketOffer
   * (either BUY or SELL)
   * @param {number} marketOfferIndex - The index of the MarketOfferData in
   * the MarketConfig
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

    // Subscribe to the stream emitting the new MarketOfferData
    this.scene.scenesManager.controllerScene
      .getMarketOfferUpdate$(this.marketOfferIndex, this.marketOfferType)
      .subscribe((marketOfferData: MarketOfferData): void => {
        this.updateContent(marketOfferData);
      });
  }

  /**
   * Update the MarketOfferData of this MarketOffer and its content (item Image,
   * quantity and price Text). If the InventorySlotData is undefined, hides the
   * content game objects.
   * @param {MarketOfferData} marketOfferData - The new MarketOfferData
   */
  public updateContent(marketOfferData: MarketOfferData): void {
    this.moneyAmountText.setText(marketOfferData.price.toString());

    const itemTypeData: ItemData = getItemData(marketOfferData.item);
    this.itemImage.setTexture(itemTypeData.texture);
    this.itemImage.setFrame(itemTypeData.frame);

    // Subscribe to the new ItemType quantity stream
    if (this.inventoryItemTypeQuantityUpdateSubscription) {
      this.inventoryItemTypeQuantityUpdateSubscription.unsubscribe();
    }
    this.inventoryItemTypeQuantityUpdateSubscription = this.scene.scenesManager.controllerScene
      .getInventoryItemTypeQuantityUpdate$(marketOfferData.item)
      .subscribe((newQuantity: number): void => {
        this.itemQuantityText.setText(newQuantity.toString());
      });

    // Enable the arrow click callback which triggers the transaction
    this.setArrowClickCallback(marketOfferData);
  }

  /**
   * Creates the item Container.
   */
  private createItemContainer(): Phaser.GameObjects.Container {
    const itemContainer: Phaser.GameObjects.Container = this.scene.add.container(
      -70,
      0
    );
    this.itemImage = this.scene.add
      .sprite(0, 0, undefined, undefined)
      .setScale(3);
    itemContainer.add(this.itemImage);
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

  /**
   * Creates the money Container.
   */
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

  /**
   * Creates the arrow Container.
   */
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

  /**
   * Enable the arrow click callback which execute the transaction of the item
   * and the money (Disable the events callback first if they were already
   * initialized).
   * @param {MarketOfferData} marketOfferData - The MarketOfferData containing
   * the ItemType and the price
   */
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
    // Exchange the money with the item when arrow clicked
    this.arrowImage.off("pointerdown");
    this.arrowImage.on("pointerdown", (): void => {
      if (this.marketOfferType === MarketOfferType.Buying) {
        if (
          this.scene.scenesManager.controllerScene.moneyAmount >=
          marketOfferData.price
        ) {
          this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
            marketOfferData.item,
            1
          );
          this.scene.scenesManager.controllerScene.modifyMoneyAmount(
            -marketOfferData.price
          );
        }
      }
      if (this.marketOfferType === MarketOfferType.Selling) {
        if (
          this.scene.scenesManager.controllerScene.inventoryContains(
            marketOfferData.item
          )
        ) {
          this.scene.scenesManager.controllerScene.modifyItemTypeQuantityInInventory(
            marketOfferData.item,
            -1
          );
          this.scene.scenesManager.controllerScene.modifyMoneyAmount(
            marketOfferData.price
          );
        }
      }
    });
  }
}
