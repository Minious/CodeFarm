import * as Phaser from "phaser";

import { MarketInterface } from "../components/ui/marketInterface";
import { InventoryInterface } from "../components/ui/inventoryInterface";
import { Joystick } from "../components/ui/joystick";
import { CodeFarmScene } from "./codeFarmScene";
import { ScenesManager } from "./scenesManager";

/**
 * This Scene is displayed above the WorldScene and is in control of the UI like
 * displaying the joystick, the money amount, the InventoryInterface and the
 * MarketInterface.
 */
export class UiScene extends CodeFarmScene {
  // The MarketInteface
  private marketInterface: MarketInterface;
  // The InventoryInterface
  private inventoryInterface: InventoryInterface;
  // The Joystick
  private _joystick: Joystick;
  // The money amount Text
  private moneyAmountText: Phaser.GameObjects.Text;

  public constructor(scenesManager: ScenesManager) {
    super(
      {
        key: "UiScene",
      },
      scenesManager
    );
  }

  // Getter for _joystick
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
     * Subscribe to the ControllerScene's stream moneyAmount$ to refresh the
     * money amount Text each time a new money amount is emitted.
     */
    this.scenesManager.controllerScene.moneyAmount$.subscribe(
      (moneyAmount: number): void => {
        this.updateMoney(moneyAmount);
      }
    );
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

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
}
