import * as Phaser from "phaser";
import * as log from "loglevel";

import { MarketInterface } from "../components/ui/marketInterface";
import { InventoryInterface } from "../components/ui/inventoryInterface";
import { Inventory } from "../types/inventory.type";
import { MarketConfig } from "../interfaces/marketConfig.interface";
import { ControllerScene } from "./controllerScene";
import { Joystick } from "../components/ui/joystick";

/**
 * This Scene is displayed above the WorldScene and is in control of the UI like
 * displaying the joystick, the money amount, the InventoryInterface and the
 * MarketInterface.
 */
export class UiScene extends Phaser.Scene {
  private marketInterface: MarketInterface;
  private inventoryInterface: InventoryInterface;
  private _joystick: Joystick;
  private moneyAmountText: Phaser.GameObjects.Text;

  public constructor() {
    super({
      key: "UiScene",
    });
  }

  public get joystick(): Joystick {
    return this._joystick;
  }

  // tslint:disable-next-line: no-empty
  public preload(): void {}

  /**
   * Creates and initializes interfaces
   */
  public create(): void {
    /**
     * Creates the joystick. The joystick is hidden when created, it is only
     * displayed when the player is moving.
     */
    this._joystick = new Joystick(this, 20);
    this.add.existing(this._joystick);

    // Creates the MarketInterface and hides it
    this.marketInterface = new MarketInterface(
      this,
      this.cameras.main.displayWidth / 2,
      this.cameras.main.displayHeight / 2,
      // Called when MarketInterface's close icon clicked
      (): void => {
        this.closeMarket();
      }
    );
    this.add.existing(this.marketInterface);
    this.marketInterface.setVisible(false);

    // Create the InventoryInterface
    this.inventoryInterface = new InventoryInterface(this);
    this.add.existing(this.inventoryInterface);
    /**
     * When the ControllerScene's 'inventory' data is modified, triggers the
     * refreshing of the InventoryInterface
     */
    (this.game.scene.getScene("ControllerScene") as ControllerScene).events.on(
      "changedata-inventory",
      (parent: any, inventory: Inventory): void => {
        this.updateInventory(inventory);
      }
    );

    /**
     * Creates the money amount icon and text
     */
    const moneyContainer: Phaser.GameObjects.Container = this.add.container(
      this.cameras.main.displayWidth - 45,
      40
    );
    moneyContainer.name = "moneyContainer";
    const moneyImage: Phaser.GameObjects.Image = this.add
      .image(0, 0, "money")
      .setScale(2);
    moneyContainer.add(moneyImage);
    this.moneyAmountText = this.add
      .text(0, 0, "0", {
        fontSize: "26px",
        fontFamily: '"Roboto Condensed"',
        resolution: 3,
      })
      .setOrigin(0.5, 0.5);
    moneyContainer.add(this.moneyAmountText);
    /**
     * When the ControllerScene's 'money' data is modified, triggers the
     * refreshing of the money amount text.
     */
    (this.game.scene.getScene("ControllerScene") as ControllerScene).events.on(
      "changedata-money",
      (parent: any, money: number): void => {
        log.debug("New money amount : " + money);
        this.updateMoney(money);
      }
    );

    /**
     * Notifies the ControllerScene that the UiScene is ready so it can
     * initialize its data which is going to trigger the update of the
     * interfaces.
     */
    (this.game.scene.getScene(
      "ControllerScene"
    ) as ControllerScene).uiSceneReady();
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  /**
   * Updates the MarketConfig in the MarketInterface.
   * @param {MarketConfig} marketConfig - The new MarketConfig
   */
  public changeMarketConfig(marketConfig: MarketConfig): void {
    this.marketInterface.loadOffers(marketConfig);
  }

  /**
   * Shows the MarketInterface and hides the InventoryInterface.
   */
  public openMarket(): void {
    this.inventoryInterface.setVisible(false);
    this.marketInterface.setVisible(true);
  }

  /**
   * Hides the MarketInterface and shows the InventoryInterface.
   */
  private closeMarket(): void {
    this.inventoryInterface.setVisible(true);
    this.marketInterface.setVisible(false);
  }

  /**
   * Changes the money amount text component's value
   * @param {number} moneyAmount - The new money amount
   */
  private updateMoney(moneyAmount: number): void {
    this.moneyAmountText.setText(moneyAmount.toString());
  }

  /**
   * Updates the InventoryInterface with a new Inventory sent as a parameter.
   * @param {Inventory} inventory - The new Inventory
   */
  private updateInventory(inventory: Inventory): void {
    this.inventoryInterface.buildInventory(inventory);
  }
}
