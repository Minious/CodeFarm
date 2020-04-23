import * as Phaser from "phaser";

import * as tileset from "../../assets/tileset.png";
import * as crops_tileset from "../../assets/crops_tileset.png";
import * as tools_tileset from "../../assets/tools_tileset.png";
import * as ui_button from "../../assets/ui_button.png";
import * as inventory_button from "../../assets/inventory_button.png";
import * as joystickBase from "../../assets/joystickBase.png";
import * as joystickHead from "../../assets/joystickHead.png";
import * as money from "../../assets/money.png";
import * as closeIcon from "../../assets/closeIcon.png";
import * as arrow from "../../assets/arrow.png";

import { Utils } from "../utils/utils";
import { MarketConfig } from "../interfaces/marketConfig.interface";
import { ItemType } from "../enums/itemType.enum";
import { InventoryItem } from "../interfaces/inventoryItem.interface";
import { Inventory } from "../types/inventory.type";
import { UiScene } from "./uiScene";
import { MarketOffer } from "../interfaces/marketOffer.interface";

export class ControllerScene extends Phaser.Scene {
  public constructor() {
    super({
      key: "ControllerScene",
    });
  }

  public preload(): void {
    this.load.image("tileset", tileset.default);
    this.load.spritesheet("crops", crops_tileset.default, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("player", tileset.default, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("tools", tools_tileset.default, {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("ui_button", ui_button.default);
    this.load.image("inventory_button", inventory_button.default);
    this.load.image("joystickBase", joystickBase.default);
    this.load.image("joystickHead", joystickHead.default);
    this.load.image("money", money.default);
    this.load.image("closeIcon", closeIcon.default);
    this.load.image("arrow", arrow.default);
  }

  public create(): void {
    this.scene.launch("WorldScene");
    this.scene.launch("UiScene");

    this.data.set("selectedItemInventoryIndex", undefined);
    this.events.on(
      "changedata-selectedItemInventoryIndex",
      (parent: any, selectedItemInventoryIndex: number): void => {
        if (selectedItemInventoryIndex) {
          const itemType: ItemType = (this.data.get("inventory") as Inventory)[
            selectedItemInventoryIndex
          ].item;
          console.log(
            `Item selected : ${itemType} (slot: ${selectedItemInventoryIndex})`
          );
        } else {
          console.log("Item deselected");
        }
      }
    );

    const startingInventory: Inventory = new Array(70).fill({}).map(
      (obj: any, i: number): InventoryItem => {
        if (i < 15) {
          const enumValues: Array<ItemType> = Object.values(ItemType);
          return {
            item: enumValues[Math.floor(Math.random() * 10) + 10],
            quantity: 1 + Math.floor(Math.random() * 9),
          };
        }
        return undefined;
      }
    );
    this.data.set("inventory", startingInventory);

    const startingMoneyAmount: number = 10;
    this.data.set("money", startingMoneyAmount);

    this.startMarketConfigGenerator();
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  public getSelectedInventoryItemData(): InventoryItem {
    return (this.data.get("inventory") as Inventory)[
      this.data.get("selectedItemInventoryIndex")
    ];
  }

  public getInventoryItemQuantity(itemType: ItemType): number {
    const quantity: number = (this.data.get("inventory") as Inventory)
      .filter(
        (inventoryItem: InventoryItem): boolean =>
          inventoryItem && inventoryItem.item === itemType
      )
      .map((inventoryItem: InventoryItem): number => inventoryItem.quantity)
      .reduce(
        (totalQuantity: number, curQuantity: number): number =>
          totalQuantity + curQuantity,
        0
      );
    return quantity;
  }

  public inventoryContains(itemType: ItemType, quantity?: number): boolean {
    if (quantity) {
      const itemQuantity: number = this.getInventoryItemQuantity(itemType);
      return itemQuantity >= quantity;
    } else {
      return (this.data.get("inventory") as Inventory)
        .filter((inventoryItem: InventoryItem): boolean => !!inventoryItem)
        .map((inventoryItem: InventoryItem): ItemType => inventoryItem.item)
        .includes(itemType);
    }
  }

  public swapInventoryItems(itemIdx1: number, itemIdx2: number): void {
    if (itemIdx1 !== itemIdx2) {
      const inventory: Inventory = this.data.get("inventory");
      if (
        inventory[itemIdx1] &&
        inventory[itemIdx2] &&
        inventory[itemIdx1].item === inventory[itemIdx2].item
      ) {
        inventory[itemIdx2].quantity += inventory[itemIdx1].quantity;
        inventory[itemIdx1] = undefined;
      } else {
        [inventory[itemIdx1], inventory[itemIdx2]] = [
          inventory[itemIdx2],
          inventory[itemIdx1],
        ];
      }
      this.data.set("inventory", inventory);
    }
  }

  public modifySelectedInventoryItemQuantity(quantityChange: number): void {
    this.modifyInventoryItemQuantityByIndex(
      this.data.get("selectedItemInventoryIndex"),
      quantityChange
    );
  }

  public modifyInventoryItemQuantity(
    itemType: ItemType,
    quantityChange: number
  ): void {
    const inventory: Inventory = (this.data.get(
      "inventory"
    ) as Inventory).slice();
    if (quantityChange > 0) {
      if (this.inventoryContains(itemType)) {
        inventory.find(
          (inventoryItem: InventoryItem): boolean =>
            inventoryItem.item === itemType
        ).quantity += quantityChange;
      } else {
        const firstEmptyInventorySlotIdx: number = inventory.findIndex(
          (inventoryItem: InventoryItem): boolean => !inventoryItem
        );
        if (firstEmptyInventorySlotIdx !== -1) {
          inventory[firstEmptyInventorySlotIdx] = {
            item: itemType,
            quantity: quantityChange,
          };
        }
      }
    } else {
      let remainingAmount: number = -quantityChange;
      inventory
        .filter(
          (inventoryItem: InventoryItem): boolean =>
            inventoryItem && inventoryItem.item === itemType
        )
        .forEach((inventoryItem: InventoryItem): void => {
          inventoryItem.quantity -= remainingAmount;
          if (inventoryItem.quantity <= 0) {
            remainingAmount = -inventoryItem.quantity;

            inventoryItem = undefined;
          } else {
            remainingAmount = 0;
          }
        });
    }
    this.data.set("inventory", inventory);
  }

  public changeMoneyAmount(change: number): void {
    this.data.set("money", this.data.get("money") + change);
  }

  private modifyInventoryItemQuantityByIndex(
    itemInventoryIndex: number,
    quantityChange: number
  ): void {
    const inventory: Inventory = (this.data.get(
      "inventory"
    ) as Inventory).slice();
    inventory[itemInventoryIndex].quantity += quantityChange;
    if (inventory[itemInventoryIndex].quantity <= 0) {
      inventory[itemInventoryIndex] = undefined;
    }
    this.data.set("inventory", inventory);
  }

  private generateMarketConfig(): MarketConfig {
    const cropsOrder: Array<ItemType> = [
      ItemType.Wheat,
      ItemType.Tomato,
      ItemType.Lemon,
      ItemType.Orange,
      ItemType.Potato,
      ItemType.Avocado,
      ItemType.Strawberry,
      ItemType.Melon,
      ItemType.Grapes,
      ItemType.Rose,
    ];
    const cropsSeedOrder: Array<ItemType> = [
      ItemType.WheatSeed,
      ItemType.TomatoSeed,
      ItemType.LemonSeed,
      ItemType.OrangeSeed,
      ItemType.PotatoSeed,
      ItemType.AvocadoSeed,
      ItemType.StrawberrySeed,
      ItemType.MelonSeed,
      ItemType.GrapesSeed,
      ItemType.RoseSeed,
    ];
    const listSellingOffers: Array<MarketOffer> = cropsOrder.map(
      (crop: ItemType, idx: number): MarketOffer => ({
        item: crop,
        price: (idx + 1) * 2,
      })
    );
    const listBuyingOffers: Array<MarketOffer> = cropsSeedOrder.map(
      (crop: ItemType, idx: number): MarketOffer => ({
        item: crop,
        price: idx + 1,
      })
    );
    const marketConfig: MarketConfig = {
      sellingOffers: Utils.getRandomSetInArray(listSellingOffers, 5),
      buyingOffers: Utils.getRandomSetInArray(listBuyingOffers, 5),
    };
    return marketConfig;
  }

  private startMarketConfigGenerator(): void {
    const delayRefreshMarket: number = 10;
    this.time.addEvent({
      delay: delayRefreshMarket * 1000,
      startAt: delayRefreshMarket * 1000 - 1,
      callback: (): void => {
        (this.game.scene.getScene("UiScene") as UiScene).changeMarketConfig(
          this.generateMarketConfig()
        );
      },
      callbackScope: this,
      loop: true,
    });
  }
}
