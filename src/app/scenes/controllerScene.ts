import * as log from "loglevel";
import { BehaviorSubject, ReplaySubject, timer, Observable } from "rxjs";
// tslint:disable-next-line: no-submodule-imports
import { map, skip } from "rxjs/operators";

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
import { InventorySlotData } from "../interfaces/inventorySlotData.interface";
import { Inventory } from "../types/inventory.type";
import { MarketOfferData } from "../interfaces/marketOfferData.interface";
import { ScenesManager } from "./scenesManager";
import { CodeFarmScene } from "./codeFarmScene";
import { MarketOfferType } from "../enums/marketOfferType.enum";

/**
 * This Scene manages the logic of the game behind the scene. It contains the
 * inventory and the amount of money and some utility methods to query and
 * manipulate them. The Scene is also in charge of loading all the assets and,
 * once finished, launch the other Scenes : WorldScene and UiScene.
 */
export class ControllerScene extends CodeFarmScene {
  public static INVENTORY_SIZE: number = 70;
  public static BUYING_OFFERS_COUNT: number = 5;
  public static SELLING_OFFERS_COUNT: number = 5;

  public _inventoryItemTypeQuantityUpdate$: {
    [key in ItemType]?: BehaviorSubject<number>;
  } = {};

  private inventory: Inventory;
  private _inventorySlotUpdate$: Array<BehaviorSubject<InventorySlotData>> = [];

  private _moneyAmount: number;
  private _moneyAmount$: BehaviorSubject<number>;

  private _marketConfig$: ReplaySubject<MarketConfig>;
  private _marketOfferUpdate$: {
    [key in MarketOfferType]?: Array<ReplaySubject<MarketOfferData>>;
  } = {};

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

  public get moneyAmount$(): Observable<number> {
    return this._moneyAmount$;
  }

  public get marketConfig$(): Observable<MarketConfig> {
    return this._marketConfig$;
  }

  public getInventorySlotUpdate$(
    slotIdx: number
  ): Observable<InventorySlotData> {
    return this._inventorySlotUpdate$[slotIdx];
  }

  public getMarketOfferUpdate$(
    marketOfferIdx: number,
    marketOfferType: MarketOfferType
  ): Observable<MarketOfferData> {
    return this._marketOfferUpdate$[marketOfferType][marketOfferIdx];
  }

  public getInventoryItemTypeQuantityUpdate$(
    itemType: ItemType
  ): Observable<number> {
    return this._inventoryItemTypeQuantityUpdate$[itemType];
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
     * The selectedInventorySlotIndex held by the data module of the Scene is an
     * integer the holds the value of the currently selected item in the
     * inventory bar (see app/components/ui/inventoryInterface.ts)
     */
    this.data.set("selectedInventorySlotIndex", undefined);
    /**
     * Event fired everytime the selectedInventorySlotIndex is modified
     * (only for logging purposes)
     */
    this.events.on(
      "changedata-selectedInventorySlotIndex",
      (parent: any, selectedInventorySlotIndex: number): void => {
        if (selectedInventorySlotIndex) {
          /**
           * Grabs the new selected item in the inventory and display it in the
           * logs.
           */
          if (this.inventory[selectedInventorySlotIndex]) {
            const itemType: ItemType = this.inventory[
              selectedInventorySlotIndex
            ].item;
            log.debug(
              `Item selected : ${itemType} (slot: ${selectedInventorySlotIndex})`
            );
          } else {
            log.debug("Selected slot empty");
          }
        } else {
          log.debug("Item deselected");
        }
      }
    );

    // Creates the 'inventory' key in the Scene's data module
    this.initializeInventory();
    // Does the same with the money amount
    this.initializeMoney();
    this.startMarketConfigGenerator();
  }

  // tslint:disable-next-line: no-empty
  public update(time: number, delta: number): void {}

  /**
   * Returns an the item stored in the selected item slot
   * @returns {number} - The selected item
   */
  public getSelectedInventorySlotData(): InventorySlotData {
    return this.inventory[this.data.get("selectedInventorySlotIndex")];
  }

  /**
   * Iterates through the Inventory to get the quantity of the ItemType passed
   * as a parameter.
   * @param {ItemType} itemType - The ItemType to search for
   * @returns {number} - The quantity of the ItemType
   */
  public getInventoryItemTypeQuantity(itemType: ItemType): number {
    const quantity: number = this.inventory
      .filter(
        (inventorySlotData: InventorySlotData): boolean =>
          inventorySlotData && inventorySlotData.item === itemType
      )
      .map(
        (inventorySlotData: InventorySlotData): number =>
          inventorySlotData.quantity
      )
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
    const itemQuantity: number = this.getInventoryItemTypeQuantity(itemType);
    return itemQuantity >= quantity;
  }

  /**
   * Swaps two slots in the inventory. If one slot empty, just moves the item.
   * If both items of the same ItemType, then merges them.
   * @param {number} - The first slot index
   * @param {number} itemIdx2 - The second slot index
   */
  public swapInventorySlots(slotIdx1: number, slotIdx2: number): void {
    if (slotIdx1 !== slotIdx2) {
      if (
        this.inventory[slotIdx1] &&
        this.inventory[slotIdx2] &&
        this.inventory[slotIdx1].item === this.inventory[slotIdx2].item
      ) {
        this.inventory[slotIdx2].quantity += this.inventory[slotIdx1].quantity;
        this.inventory[slotIdx1] = undefined;
      } else {
        [this.inventory[slotIdx1], this.inventory[slotIdx2]] = [
          this.inventory[slotIdx2],
          this.inventory[slotIdx1],
        ];
      }
      this._inventorySlotUpdate$[slotIdx1].next(this.inventory[slotIdx1]);
      this._inventorySlotUpdate$[slotIdx2].next(this.inventory[slotIdx2]);
    }
  }

  /**
   * Modifies the quantity of the selected item in the inventory by a required
   * amount.
   * @param {number} quantityChange - The amount to change
   */
  public modifySelectedInventoryItemQuantity(quantityChange: number): void {
    this.modifyInventoryItemQuantityByIndex(
      this.data.get("selectedInventorySlotIndex"),
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
        (inventorySlotData: InventorySlotData): boolean =>
          inventorySlotData.item === itemType
      );
      this.inventory[firstSameItemInventorySlotIdx].quantity += quantityChange;

      this._inventorySlotUpdate$[firstSameItemInventorySlotIdx].next(
        this.inventory[firstSameItemInventorySlotIdx]
      );
    } else {
      const firstEmptyInventorySlotIdx: number = this.inventory.findIndex(
        (inventorySlotData: InventorySlotData): boolean => !inventorySlotData
      );
      if (firstEmptyInventorySlotIdx !== -1) {
        this.inventory[firstEmptyInventorySlotIdx] = {
          item: itemType,
          quantity: quantityChange,
        };

        this._inventorySlotUpdate$[firstEmptyInventorySlotIdx].next(
          this.inventory[firstEmptyInventorySlotIdx]
        );
      }
    }
    this.emitInventoryItemTypeQuantity(itemType);
  }

  /**
   * This method decreases the quantity of an ItemType in the Inventory. It
   * iterates through the Inventory slots and reduce their quantity until the
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
        inventorySlotData: InventorySlotData,
        inventorySlotIdx: number
      ): InventorySlotData => {
        if (
          remainingAmount > 0 &&
          inventorySlotData &&
          inventorySlotData.item === itemType
        ) {
          if (inventorySlotData.quantity <= remainingAmount) {
            remainingAmount -= inventorySlotData.quantity;
            inventorySlotData = undefined;
          } else {
            inventorySlotData.quantity -= remainingAmount;
            remainingAmount = 0;
          }

          this._inventorySlotUpdate$[inventorySlotIdx].next(
            this.inventory[inventorySlotIdx]
          );
        }
        return inventorySlotData;
      }
    );
    this.inventory = newInventory;
    this.emitInventoryItemTypeQuantity(itemType);
  }

  /**
   * Modifies the quantity of the item in the inventory slot at the provided
   * index. If required quantity is bigger then the item quantity, then the
   * quantity is set to 0.
   * @param {number} inventorySlotIdx - The index of the slot in the Inventory
   * @param {number} quantityChange - The quantity to modify
   */
  public modifyInventoryItemQuantityByIndex(
    inventorySlotIdx: number,
    quantityChange: number
  ): void {
    this.inventory[inventorySlotIdx].quantity += quantityChange;
    if (this.inventory[inventorySlotIdx].quantity <= 0) {
      this.inventory[inventorySlotIdx] = undefined;
    }

    this._inventorySlotUpdate$[inventorySlotIdx].next(
      this.inventory[inventorySlotIdx]
    );
    this.emitInventoryItemTypeQuantity(this.inventory[inventorySlotIdx].item);
  }

  /**
   * Modifies the money amount
   * @param {number} change - The amount to modify
   */
  public modifyMoneyAmount(change: number): void {
    this._moneyAmount = Math.max(0, this.moneyAmount + change);
    this._moneyAmount$.next(this.moneyAmount);
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
      sellingOffers: Utils.getRandomSetInArray(
        listSellingOffers,
        ControllerScene.SELLING_OFFERS_COUNT
      ),
      buyingOffers: Utils.getRandomSetInArray(
        listBuyingOffers,
        ControllerScene.BUYING_OFFERS_COUNT
      ),
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
    this._marketConfig$ = new ReplaySubject<MarketConfig>(1);
    timer(0, delayRefreshMarket * 1000)
      .pipe(map((): MarketConfig => this.generateMarketConfig()))
      .subscribe(this._marketConfig$);

    this.marketConfig$
      .pipe(skip(1))
      .subscribe((marketConfig: MarketConfig): void => {
        log.debug("New MarketConfig : ", marketConfig);
      });

    Object.values(MarketOfferType).forEach(
      (marketOfferType: MarketOfferType): void => {
        this._marketOfferUpdate$[marketOfferType] = [];
        const offerCount: number =
          marketOfferType === MarketOfferType.Buying
            ? ControllerScene.BUYING_OFFERS_COUNT
            : ControllerScene.SELLING_OFFERS_COUNT;
        for (let i: number = 0; i < offerCount; i += 1) {
          const currentMarketOfferUpdate$: ReplaySubject<MarketOfferData> = new ReplaySubject<
            MarketOfferData
          >(1);
          this._marketConfig$
            .pipe(
              map(
                (marketConfig: MarketConfig): MarketOfferData => {
                  return marketOfferType === MarketOfferType.Buying
                    ? marketConfig.buyingOffers[i]
                    : marketConfig.sellingOffers[i];
                }
              )
            )
            .subscribe(currentMarketOfferUpdate$);
          this._marketOfferUpdate$[marketOfferType].push(
            currentMarketOfferUpdate$
          );

          currentMarketOfferUpdate$
            .pipe(skip(1))
            .subscribe((marketOfferData: MarketOfferData): void => {
              log.debug(
                `Update ${marketOfferType} Market offer ${i} :`,
                marketOfferData
                  ? `${marketOfferData.item} (Price : ${marketOfferData.price})`
                  : "Empty"
              );
            });
        }
      }
    );
  }

  /**
   * TODO
   */
  private initializeInventory(): void {
    // Creates the inventory as an array of InventorySlotData
    if (this.debugEnabled) {
      this.inventory = new Array(ControllerScene.INVENTORY_SIZE).fill({}).map(
        (obj: any, i: number): InventorySlotData => {
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
        (obj: any, i: number): InventorySlotData => {
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
      const currentInventorySlotUpdate$: BehaviorSubject<InventorySlotData> = new BehaviorSubject<
        InventorySlotData
      >(this.inventory[i]);
      this._inventorySlotUpdate$.push(currentInventorySlotUpdate$);

      currentInventorySlotUpdate$
        .pipe(skip(1))
        .subscribe((inventorySlotData: InventorySlotData): void => {
          log.debug(
            `Update Inventory slot ${i} :`,
            inventorySlotData
              ? `${inventorySlotData.item} (Quantity : ${inventorySlotData.quantity})`
              : "Empty"
          );
        });
    }

    Object.values(ItemType).forEach((itemType: ItemType): void => {
      this._inventoryItemTypeQuantityUpdate$[itemType] = new BehaviorSubject<
        number
      >(this.getInventoryItemTypeQuantity(itemType));

      this._inventoryItemTypeQuantityUpdate$[itemType]
        .pipe(skip(1))
        .subscribe((newQuantity: number): void => {
          log.debug(
            `Update Inventory ItemType quantity ${itemType} : ${newQuantity}`
          );
        });
    });
  }

  private emitInventoryItemTypeQuantity(itemType: ItemType): void {
    this._inventoryItemTypeQuantityUpdate$[itemType].next(
      this.getInventoryItemTypeQuantity(itemType)
    );
  }

  /**
   * TODO
   */
  private initializeMoney(): void {
    const startingMoneyAmount: number = this.debugEnabled ? 1000 : 0;
    this._moneyAmount = startingMoneyAmount;
    this._moneyAmount$ = new BehaviorSubject<number>(this.moneyAmount);
    this._moneyAmount$.pipe(skip(1)).subscribe((moneyAmount: number): void => {
      log.debug(`New money amount : ${moneyAmount}`);
    });
  }
}
