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

/**
 * This Scene manages the logic of the game behind the scene. It contains the
 * inventory and the amount of money and some utility methods to query and
 * manipulate them. The Scene is also in charge of loading all the assets and,
 * once finished, launch the other Scenes : WorldScene and UiScene.
 */
export class ControllerScene extends Phaser.Scene {
  private _debugEnabled: boolean = process.env.NODE_ENV === "development";

  public constructor() {
    super({
      key: "ControllerScene",
    });
  }

  // Getter for _debugEnabled
  public get debugEnabled(): boolean {
    return this._debugEnabled;
  }

  /**
   * The preload method loads all the assets. It is executed before the create
   * method.
   */
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

  /**
   * Once the assets have been loaded in preload, update launches the Scenes
   * WorldScene and UiScene and initialize the inventory and the money amount.
   */
  public create(): void {
    // Launch the "actual game" Scenes
    this.scene.launch("WorldScene");
    this.scene.launch("UiScene");

    /**
     * The selectedItemInventoryIndex held by the data module of the Scene is an
     * integer the holds the value of the currently selected item in the
     * inventory bar (see app/components/ui/inventoryInterface.ts)
     */
    this.data.set("selectedItemInventoryIndex", undefined);
    /**
     * Event fired everytime the selectedItemInventoryIndex is modified
     * (only for logging purposes)
     */
    this.events.on(
      "changedata-selectedItemInventoryIndex",
      (parent: any, selectedItemInventoryIndex: number): void => {
        if (selectedItemInventoryIndex) {
          if (this.debugEnabled) {
            /**
             * Grabs the new selected item in the inventory and display it in the
             * console.
             */
            const itemType: ItemType = (this.data.get(
              "inventory"
            ) as Inventory)[selectedItemInventoryIndex].item;
            console.log(
              `Item selected : ${itemType} (slot: ${selectedItemInventoryIndex})`
            );
          } else {
            console.log("Item deselected");
          }
        }
      }
    );

    // Creates the 'inventory' key in the Scene's data module
    this.data.set("inventory", undefined);
    // Does the same with the money amount
    this.data.set("money", undefined);
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  /**
   * Returns an the item stored in the selected item slot
   * @returns {number} - The selected item
   */
  public getSelectedInventoryItemData(): InventoryItem {
    return (this.data.get("inventory") as Inventory)[
      this.data.get("selectedItemInventoryIndex")
    ];
  }

  /**
   * Iterates through the Inventory to get the quantity of the ItemType passed
   * as a parameter.
   * @param {ItemType} itemType - The ItemType to search for
   * @returns {number} - The quantity of the ItemType
   */
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

  /**
   * Returns a boolean which is true if the inventory contains the ItemType in
   * the quantity required (default 1) sent as parameters
   * @param {ItemType} itemType - The ItemType to search for
   * @param {boolean} quantity - The quantity required
   * @returns {boolean} - Wether there is the quantity of ItemType in the
   * inventory
   */
  public inventoryContains(itemType: ItemType, quantity: number = 1): boolean {
    const itemQuantity: number = this.getInventoryItemQuantity(itemType);
    return itemQuantity >= quantity;
  }

  /**
   * Swaps two slots in the inventory. If one slot empty, just moves the item.
   * If both items of the same ItemType, then merges them.
   * @param {number} - The first slot index
   * @param {number} itemIdx2 - The second slot index
   */
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

  /**
   * Modifies the quantity of the selected item in the inventory by a required
   * amount.
   * @param {number} quantityChange - The amount to change
   */
  public modifySelectedInventoryItemQuantity(quantityChange: number): void {
    this.modifyInventoryItemQuantityByIndex(
      this.data.get("selectedItemInventoryIndex"),
      quantityChange
    );
  }

  /**
   * Adds or reduces the quantity of a specified ItemType by a required amount.
   * @param {ItemType} itemType - The ItemType to look for
   * @param {number} quantityChange - The amount to change
   */
  public modifyItemTypeQuantityInInventory(
    itemType: ItemType,
    quantityChange: number
  ): void {
    if (quantityChange > 0) {
      this.increaseItemTypeQuantityInInventory(itemType, quantityChange);
    } else if (quantityChange < 0) {
      this.decreaseItemTypeQuantityInInventory(itemType, -quantityChange);
    }
  }

  /**
   * This method increases the quantity of an ItemType in the Inventory. It
   * finds the first slot with the same ItemType and sum the quantity of the
   * item with the quantity to add. Adds it in the first empty slot if the
   * ItemType is not already in an Inventory slot. If no empty slot, then
   * nothing happens.
   * @param itemType
   * @param quantityChange
   */
  public increaseItemTypeQuantityInInventory(
    itemType: ItemType,
    quantityChange: number
  ): void {
    if (quantityChange < 0) {
      throw new Error("The quantity cannot be negative.");
    }
    const inventory: Inventory = this.data.get("inventory") as Inventory;
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
    this.data.set("inventory", inventory);
  }

  /**
   * This method decreases the quantity of an ItemType in the Inventory. It
   * iterates through the inventory items and reduce their quantity until the
   * required amount is reached. If there's not enough items, the remaining
   * amount is ignored.
   * @param itemType
   * @param quantityChange
   */
  public decreaseItemTypeQuantityInInventory(
    itemType: ItemType,
    quantityChange: number
  ): void {
    if (quantityChange < 0) {
      throw new Error("The quantity cannot be negative.");
    }
    const inventory: Inventory = this.data.get("inventory") as Inventory;
    let remainingAmount: number = quantityChange;
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
    this.data.set("inventory", inventory);
  }

  /**
   * Modifies the quantity of the item in the inventory at the provided slot
   * index. If required quantity is bigger then the item quantity, then the
   * quantity is set to 0.
   * @param {number} itemInventoryIndex - The index of the slot in the Inventory
   * @param {number} quantityChange - The quantity to modify
   */
  public modifyInventoryItemQuantityByIndex(
    itemInventoryIndex: number,
    quantityChange: number
  ): void {
    const inventory: Inventory = this.data.get("inventory") as Inventory;
    inventory[itemInventoryIndex].quantity += quantityChange;
    if (inventory[itemInventoryIndex].quantity <= 0) {
      inventory[itemInventoryIndex] = undefined;
    }
    this.data.set("inventory", inventory);
  }

  /**
   * Modifies the money amount
   * @param {number} change - The amount to modify
   */
  public modifyMoneyAmount(change: number): void {
    this.data.set("money", this.data.get("money") + change);
  }

  /**
   * The ControllerScene is initialized before the UiScene, therefore the data
   * change events (inventory, money) won't be received by the UiScene if they
   * are sent during ControllerScene's initialization. This method handles that
   * and is called once the UiScene's create method ends.
   */
  public uiSceneReady(): void {
    this.startMarketConfigGenerator();
    this.initializeInventory();
    this.initializeMoney();
  }

  /**
   * Creates a MarketConfig with random MarketOffers and returns it. Each crop
   * type is ordered based on its value. Crop can be sold and seeds bought. The
   * buying prices of seeds start at 1 and increase by 1 for each seed. The
   * selling prices of crops are twice the price of their respective seeds
   * buying price. Five crops selling offers and five seeds buying offers are
   * randomly selected to be part of the MarketConfig.
   *
   * Buying prices  : WheatSeed = 1, TomatoSeed = 2, etc
   * Selling prices : Wheat     = 2, Tomato     = 4, etc
   *
   * (NOTE : It is temporary and is going to be reworked by adding
   * randomization)
   *
   *  @returns {MarketConfig} - The MarketConfig generated
   */
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

  /**
   * Creates an event triggered every so often (10 seconds) which generate a new
   * MarketConfig and update the UiScene's MarketConfig with the newly created
   * one.
   *
   * (NOTE : Should maybe be moved to UiScene)
   */
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
      loop: true,
    });
  }

  /**
   * TODO
   */
  private initializeInventory(): void {
    // Creates the inventory as an array of InventoryItem
    let startingInventory: Inventory;

    if (this.debugEnabled) {
      startingInventory = new Array(70).fill({}).map(
        (obj: any, i: number): InventoryItem => {
          // Fills the first 10 slots with each type of seed
          if (i < 10) {
            const enumValues: Array<ItemType> = Object.values(ItemType);
            return {
              item: enumValues[10 + i],
              quantity: 10,
            };
          }
          // undefined means no object in the slot
          return undefined;
        }
      );
    } else {
      startingInventory = new Array(70).fill({}).map(
        (obj: any, i: number): InventoryItem => {
          // Gives 5 WheatSeed to the player
          if (i === 0) {
            return {
              item: ItemType.WheatSeed,
              quantity: 5,
            };
          }
          // undefined means no object in the slot
          return undefined;
        }
      );
    }
    /**
     * Sets the 'inventory' key as the startingInventory in the data module of
     * the Scene.
     */
    this.data.set("inventory", startingInventory);
  }

  /**
   * TODO
   */
  private initializeMoney(): void {
    const startingMoneyAmount: number = this.debugEnabled ? 1000 : 0;
    this.data.set("money", startingMoneyAmount);
  }
}
