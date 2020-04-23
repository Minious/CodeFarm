import * as Phaser from "phaser";

import { MarketInterface } from "../components/ui/marketInterface";
import { InventoryInterface } from "../components/ui/inventoryInterface";
import { Inventory } from "../types/inventory.type";
import { MarketConfig } from "../interfaces/marketConfig.interface";
import { Vector2 } from "../types/vector2.type";
import { ControllerScene } from "./controllerScene";

export class UiScene extends Phaser.Scene {
  private marketInterface: MarketInterface;
  private inventoryInterface: InventoryInterface;
  private joystickBase: Phaser.GameObjects.Image;
  private joystickHead: Phaser.GameObjects.Image;
  private moneyAmountText: Phaser.GameObjects.Text;

  public constructor() {
    super({
      key: "UiScene",
    });
  }

  // tslint:disable-next-line: no-empty
  public preload(): void {}

  public create(): void {
    this.marketInterface = new MarketInterface(
      this,
      this.cameras.main.displayWidth / 2,
      this.cameras.main.displayHeight / 2,
      (): void => {
        this.closeMarket();
      }
    );

    this.add.existing(this.marketInterface);
    this.marketInterface.setVisible(false);

    this.inventoryInterface = new InventoryInterface(this, 0, 0);
    this.add.existing(this.inventoryInterface);

    (this.game.scene.getScene("ControllerScene") as ControllerScene).events.on(
      "setdata",
      (parent: any, key: string, inventory: Inventory): void => {
        if (key === "inventory") {
          this.refreshInventory(inventory);
        }
      }
    );
    (this.game.scene.getScene("ControllerScene") as ControllerScene).events.on(
      "changedata-inventory",
      (parent: any, inventory: Inventory): void => {
        this.refreshInventory(inventory);
      }
    );
    this.refreshInventory(
      (this.game.scene.getScene("ControllerScene") as ControllerScene).data.get(
        "inventory"
      ) as Inventory
    );

    this.joystickBase = this.add.image(0, 0, "joystickBase");
    this.joystickBase.name = "joystickBase";
    this.joystickHead = this.add.image(0, 0, "joystickHead");
    this.joystickHead.name = "joystickHead";
    this.hideJoystick();

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
    const { width, height }: Phaser.Geom.Rectangle = moneyContainer.getBounds();
    moneyContainer.setSize(width, height).setInteractive();

    (this.game.scene.getScene("ControllerScene") as ControllerScene).events.on(
      "changedata-money",
      (parent: any, money: number): void => {
        console.log("New money amount : " + money);
        this.updateMoney(money);
      }
    );
    this.updateMoney(
      (this.game.scene.getScene("ControllerScene") as ControllerScene).data.get(
        "money"
      )
    );
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  public changeMarketConfig(marketConfig: MarketConfig): void {
    this.marketInterface.loadOffers(marketConfig);
  }

  public hideJoystick(): void {
    this.joystickBase.visible = false;
    this.joystickHead.visible = false;
  }

  public showJoystick(): void {
    this.joystickBase.visible = true;
    this.joystickHead.visible = true;
  }

  public setPositionJoystick(posBase: Vector2, posHead: Vector2): void {
    this.joystickBase.setPosition(posBase.x, posBase.y);
    this.joystickHead.setPosition(posHead.x, posHead.y);
  }

  public openMarket(): void {
    this.inventoryInterface.setVisible(false);
    this.marketInterface.setVisible(true);
  }

  private closeMarket(): void {
    this.inventoryInterface.setVisible(true);
    this.marketInterface.setVisible(false);
  }

  private updateMoney(moneyAmount: number): void {
    this.moneyAmountText.setText(moneyAmount.toString());
  }

  private refreshInventory(inventory: Inventory): void {
    this.inventoryInterface.buildInventory(inventory);
  }
}
