import * as log from "loglevel";

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
import { MarketOfferData } from "../interfaces/marketOfferData.interface";
import { ScenesManager } from "./scenesManager";
import { CodeFarmScene } from "./codeFarmScene";
import { BehaviorSubject } from "rxjs";

/**
 * This Scene manages the logic of the game behind the scene. It contains the
 * inventory and the amount of money and some utility methods to query and
 * manipulate them. The Scene is also in charge of loading all the assets and,
 * once finished, launch the other Scenes : WorldScene and UiScene.
 */
export class ControllerScene extends CodeFarmScene {
  public static INVENTORY_SIZE: number = 70;

  private inventory: Inventory;
  private inventorySlotUpdateStreams: Array<
    BehaviorSubject<InventoryItem>
  > = [];

  private _moneyAmount: number;
  private moneyStream: BehaviorSubject<number>;

  private _debugEnabled: boolean = process.env.NODE_ENV === "development";

  public constructor(scenesManager: ScenesManager) {
    super(
      {
        key: "ControllerScene",
      },
      scenesManager
    );
  }

  // Getter for _debugEnabled
  public get debugEnabled(): boolean {
    return this._debugEnabled;
  }

  // Getter for _moneyAmount
  public get moneyAmount(): number {
    return this._moneyAmount;
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
          /**
           * Grabs the new selected item in the inventory and display it in the
           * logs.
           */
          const itemType: ItemType = this.inventory[selectedItemInventoryIndex]
            .item;
          log.debug(
            `Item selected : ${itemType} (slot: ${selectedItemInventoryIndex})`
          );
        } else {
          log.debug("Item deselected");
        }
      }
    );

    // Creates the 'inventory' key in the Scene's data module
    this.initializeInventory();
    // Does the same with the money amount
    this.initializeMoney();
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  /**
   * Returns an the item stored in the selected item slot
   * @returns {number} - The selected item
   */
  public getSelectedInventoryItemData(): InventoryItem {
    return this.inventory[this.data.get("selectedItemInventoryIndex")];
  }

  /**
   * Iterates through the Inventory to get the quantity of the ItemType passed
   * as a parameter.
   * @param {ItemType} itemType - The ItemType to search for
   * @returns {number} - The quantity of the ItemType
   */
  public getInventoryItemQuantity(itemType: ItemType): number {
    const quantity: number = this.inventory
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
      if (
        this.inventory[itemIdx1] &&
        this.inventory[itemIdx2] &&
        this.inventory[itemIdx1].item === this.inventory[itemIdx2].item
      ) {
        this.inventory[itemIdx2].quantity += this.inventory[itemIdx1].quantity;
        this.inventory[itemIdx1] = undefined;
      } else {
        [this.inventory[itemIdx1], this.inventory[itemIdx2]] = [
          this.inventory[itemIdx2],
          this.inventory[itemIdx1],
        ];
      }
      this.inventorySlotUpdateStreams[itemIdx1].next(this.inventory[itemIdx1]);
      this.inventorySlotUpdateStreams[itemIdx2].next(this.inventory[itemIdx2]);
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
    if (this.inventoryContains(itemType)) {
      const firstSameItemInventorySlotIdx: number = this.inventory.findIndex(
        (inventoryItem: InventoryItem): boolean =>
          inventoryItem.item === itemType
      );
      this.inventory[firstSameItemInventorySlotIdx].quantity += quantityChange;

      this.inventorySlotUpdateStreams[firstSameItemInventorySlotIdx].next(
        this.inventory[firstSameItemInventorySlotIdx]
      );
    } else {
      const firstEmptyInventorySlotIdx: number = this.inventory.findIndex(
        (inventoryItem: InventoryItem): boolean => !inventoryItem
      );
      if (firstEmptyInventorySlotIdx !== -1) {
        this.inventory[firstEmptyInventorySlotIdx] = {
          item: itemType,
          quantity: quantityChange,
        };

        this.inventorySlotUpdateStreams[firstEmptyInventorySlotIdx].next(
          this.inventory[firstEmptyInventorySlotIdx]
        );
      }
    }
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
    let remainingAmount: number = quantityChange;
    const newInventory: Inventory = this.inventory.map(
      (
        inventoryItem: InventoryItem,
        itemInventoryIndex: number
      ): InventoryItem => {
        if (
          remainingAmount > 0 &&
          inventoryItem &&
          inventoryItem.item === itemType
        ) {
          if (inventoryItem.quantity <= remainingAmount) {
            remainingAmount -= inventoryItem.quantity;
            inventoryItem = undefined;
          } else {
            inventoryItem.quantity -= remainingAmount;
            remainingAmount = 0;
          }

          this.inventorySlotUpdateStreams[itemInventoryIndex].next(
            this.inventory[itemInventoryIndex]
          );
        }
        return inventoryItem;
      }
    );
    this.inventory = newInventory;
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
    this.inventory[itemInventoryIndex].quantity += quantityChange;
    if (this.inventory[itemInventoryIndex].quantity <= 0) {
      this.inventory[itemInventoryIndex] = undefined;
    }

    this.inventorySlotUpdateStreams[itemInventoryIndex].next(
      this.inventory[itemInventoryIndex]
    );
  }

  /**
   * Modifies the money amount
   * @param {number} change - The amount to modify
   */
  public modifyMoneyAmount(change: number): void {
    this._moneyAmount = Math.max(0, this.moneyAmount + change);
    this.moneyStream.next(this.moneyAmount);
  }

  /**
   * The ControllerScene is initialized before the UiScene, therefore the data
   * change events (inventory, money) won't be received by the UiScene if they
   * are sent during ControllerScene's initialization. This method handles that
   * and is called once the UiScene's create method ends.
   */
  public uiSceneReady(): void {
    this.startMarketConfigGenerator();
  }

  public createInventorySlotUpdateCallback(
    slotIdx: number,
    callback: (inventoryItem: InventoryItem) => void
  ): void {
    this.inventorySlotUpdateStreams[slotIdx].subscribe(callback);
  }

  public createMoneyAmountUpdateCallback(
    callback: (moneyAmount: number) => void
  ): void {
    this.moneyStream.subscribe(callback);
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
    const listSellingOffers: Array<MarketOfferData> = cropsOrder.map(
      (crop: ItemType, idx: number): MarketOfferData => ({
        item: crop,
        price: (idx + 1) * 2,
      })
    );
    const listBuyingOffers: Array<MarketOfferData> = cropsSeedOrder.map(
      (crop: ItemType, idx: number): MarketOfferData => ({
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
   */
  private startMarketConfigGenerator(): void {
    const delayRefreshMarket: number = 10;
    this.time.addEvent({
      delay: delayRefreshMarket * 1000,
      startAt: delayRefreshMarket * 1000 - 1,
      callback: (): void => {
        this.scenesManager.uiScene.changeMarketConfig(
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
    if (this.debugEnabled) {
      this.inventory = new Array(ControllerScene.INVENTORY_SIZE).fill({}).map(
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
      this.inventory = new Array(ControllerScene.INVENTORY_SIZE).fill({}).map(
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
     * TODO
     */
    for (let i: number = 0; i < ControllerScene.INVENTORY_SIZE; i += 1) {
      this.inventorySlotUpdateStreams.push(
        new BehaviorSubject<InventoryItem>(this.inventory[i])
      );
    }
  }

  /**
   * TODO
   */
  private initializeMoney(): void {
    const startingMoneyAmount: number = this.debugEnabled ? 1000 : 0;
    this._moneyAmount = startingMoneyAmount;
    this.moneyStream = new BehaviorSubject<number>(this.moneyAmount);
  }
}
