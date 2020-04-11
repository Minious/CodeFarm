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
import { MarketConfig } from "../interfaces/marketConfig.interface"
import { ItemType } from "../enums/itemType.enum";
import { InventoryItem } from "../interfaces/inventoryItem.interface";
import { Inventory } from "../types/inventory.type";
import { UiScene } from "./uiScene";

export class ControllerScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ControllerScene"
        });
    }

    preload() {
        this.load.image('tileset', tileset.default);
        this.load.spritesheet('crops',
            crops_tileset.default,
            { frameWidth: 16, frameHeight: 16 }
        );
        this.load.spritesheet('player', 
            tileset.default,
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet('tools',
            tools_tileset.default,
            { frameWidth: 16, frameHeight: 16 }
        );
        this.load.image('ui_button', ui_button.default);
        this.load.image('inventory_button', inventory_button.default);
        this.load.image('joystickBase', joystickBase.default);
        this.load.image('joystickHead', joystickHead.default);
        this.load.image('money', money.default);
        this.load.image('closeIcon', closeIcon.default);
        this.load.image('arrow', arrow.default);
    }

    create() {
        this.scene.launch('WorldScene');
        this.scene.launch('UiScene');

        this.data.set('selectedItemInventoryIndex', undefined);
        this.events.on('changedata-selectedItemInventoryIndex', (parent: any, selectedItemInventoryIndex: number) => {
            if(selectedItemInventoryIndex)
                console.log('Item selected : ' + (this.data.get('inventory') as Inventory)[selectedItemInventoryIndex].item + " (slot: " + selectedItemInventoryIndex + ")");
            else
                console.log('Item deselected')
        });

        let startingInventory: Inventory = new Array(70).fill({}).map((obj, i): InventoryItem => {
            if(i < 15) {
                const enumKeys = Object.keys(ItemType) as Array<string>;
                const enumValues = Object.values(ItemType) as Array<ItemType>;
                return {
                    item: enumValues[Math.floor(Math.random() * 10) + 10],
                    quantity: 1 + Math.floor(Math.random() * 9)
                }
            }
        });
        this.data.set('inventory', startingInventory);

        let startingMoneyAmount = 10;
        this.data.set('money', startingMoneyAmount);

        this.startMarketConfigGenerator();
    }

    generateMarketConfig(){
        let cropsOrder = [
            ItemType.Wheat,
            ItemType.Tomato,
            ItemType.Lemon,
            ItemType.Orange,
            ItemType.Potato,
            ItemType.Avocado,
            ItemType.Strawberry,
            ItemType.Melon,
            ItemType.Grapes,
            ItemType.Rose
        ];
        let cropsSeedOrder = [
            ItemType.WheatSeed,
            ItemType.TomatoSeed,
            ItemType.LemonSeed,
            ItemType.OrangeSeed,
            ItemType.PotatoSeed,
            ItemType.AvocadoSeed,
            ItemType.StrawberrySeed,
            ItemType.MelonSeed,
            ItemType.GrapesSeed,
            ItemType.RoseSeed
        ];
        let listSellingOffers = cropsOrder.map((crop: ItemType, idx: number) => ({
            item: crop,
            price: (idx + 1) * 2
        }));
        let listBuyingOffers = cropsSeedOrder.map((crop: ItemType, idx: number) => ({
            item: crop,
            price: idx + 1
        }));
        let marketConfig: MarketConfig = {
            sellingOffers: Utils.getRandomSetInArray(listSellingOffers, 5),
            buyingOffers: Utils.getRandomSetInArray(listBuyingOffers, 5)
        };
        return marketConfig;
    }

    startMarketConfigGenerator(){
        let delayRefreshMarket = 10;
        this.time.addEvent({
            delay: delayRefreshMarket * 1000,
            startAt: delayRefreshMarket * 1000 - 1,
            callback: () => {
                (this.game.scene.getScene("UiScene") as UiScene).changeMarketConfig(this.generateMarketConfig())
            },
            callbackScope: this,
            loop: true
        });
    }

    getSelectedInventoryItemData(){
        return (this.data.get('inventory') as Inventory)[this.data.get('selectedItemInventoryIndex')];
    }

    getInventoryItemQuantity(itemType: ItemType){
        let quantity = (this.data.get('inventory') as Inventory)
            .filter(inventoryItem => inventoryItem && inventoryItem.item == itemType)
            .map(inventoryItem => inventoryItem.quantity)
            .reduce((totalQuantity, curQuantity) => totalQuantity + curQuantity, 0);
        return quantity;
    }

    inventoryContains(itemType: ItemType, quantity?: number){
        if(quantity){
            let itemQuantity = this.getInventoryItemQuantity(itemType);
            return itemQuantity >= quantity;
        } else {
            return (this.data.get('inventory') as Inventory).filter(inventoryItem => inventoryItem).map(inventoryItem => inventoryItem.item).includes(itemType);
        }
    }

    swapInventoryItems(itemIdx1: number, itemIdx2: number){
        if(itemIdx1 != itemIdx2){
            let inventory = this.data.get('inventory') as Inventory;
            if(inventory[itemIdx1] && inventory[itemIdx2] && inventory[itemIdx1].item == inventory[itemIdx2].item){
                inventory[itemIdx2].quantity += inventory[itemIdx1].quantity;
                inventory[itemIdx1] = undefined;
            } else {
                [inventory[itemIdx1], inventory[itemIdx2]] = [inventory[itemIdx2], inventory[itemIdx1]];
            }
            this.data.set('inventory', inventory);
        }
    }

    modifySelectedInventoryItemQuantity(quantityChange: number){
        this.modifyInventoryItemQuantityByIndex(this.data.get('selectedItemInventoryIndex'), quantityChange);
    }

    modifyInventoryItemQuantityByIndex(itemInventoryIndex: number, quantityChange: number){
        let inventory = (this.data.get('inventory') as Inventory).slice();
        inventory[itemInventoryIndex].quantity += quantityChange;
        if(inventory[itemInventoryIndex].quantity <= 0){
            inventory[itemInventoryIndex] = undefined;
        }
        this.data.set('inventory', inventory);
    }

    modifyInventoryItemQuantity(itemType: ItemType, quantityChange: number){
        let inventory = (this.data.get('inventory') as Inventory).slice();
        if(quantityChange > 0){
            if(this.inventoryContains(itemType)) {
                inventory.find(inventoryItem => inventoryItem.item == itemType).quantity += quantityChange;
            } else {
                let firstEmptyInventorySlotIdx = inventory.findIndex(inventoryItem => !inventoryItem);
                if(firstEmptyInventorySlotIdx != -1){
                    inventory[firstEmptyInventorySlotIdx] = {
                        item: itemType,
                        quantity: quantityChange
                    };
                }
            }
        } else {
            let remainingAmount = - quantityChange;
            inventory.filter(inventoryItem => inventoryItem && inventoryItem.item == itemType)
                .forEach(inventoryItem => {
                    inventoryItem.quantity -= remainingAmount;
                    if(inventoryItem.quantity <= 0){
                        remainingAmount = - inventoryItem.quantity;

                        inventoryItem = undefined;
                    } else {
                        remainingAmount = 0;
                    }
                });
        }
        this.data.set('inventory', inventory);
    }

    changeMoneyAmount(change: number){
        this.data.set('money', this.data.get('money') + change);
    }

    update(time: number, delta: number) {}

}
