class ControllerScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ControllerScene"
        });

        this.LIST_ITEM = {
            avocado: {
                texture: 'crops',
                frame: 117
            },
            grapes: {
                texture: 'crops',
                frame: 75
            },
            lemon: {
                texture: 'crops',
                frame: 47
            },
            melon: {
                texture: 'crops',
                frame: 33
            },
            orange: {
                texture: 'crops',
                frame: 124
            },
            potato: {
                texture: 'crops',
                frame: 110
            },
            rose: {
                texture: 'crops',
                frame: 5
            },
            strawberry: {
                texture: 'crops',
                frame: 96
            },
            tomato: {
                texture: 'crops',
                frame: 40
            },
            wheat: {
                texture: 'crops',
                frame: 82
            },
            avocadoSeed: {
                texture: 'crops',
                frame: 118
            },
            grapesSeed: {
                texture: 'crops',
                frame: 76
            },
            lemonSeed: {
                texture: 'crops',
                frame: 48
            },
            melonSeed: {
                texture: 'crops',
                frame: 34
            },
            orangeSeed: {
                texture: 'crops',
                frame: 125
            },
            potatoSeed: {
                texture: 'crops',
                frame: 111
            },
            roseSeed: {
                texture: 'crops',
                frame: 6
            },
            strawberrySeed: {
                texture: 'crops',
                frame: 97
            },
            tomatoSeed: {
                texture: 'crops',
                frame: 41
            },
            wheatSeed: {
                texture: 'crops',
                frame: 83
            },
        };
    }

    preload() {
        this.load.image('tileset', 'assets/tileset.png');
        this.load.spritesheet('crops',
            'assets/crops_tileset.png',
            { frameWidth: 16, frameHeight: 16 }
        );
        this.load.spritesheet('player', 
            'assets/tileset.png',
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet('tools',
            'assets/tools_tileset.png',
            { frameWidth: 16, frameHeight: 16 }
        );
        this.load.image('ui_button', 'assets/ui_button.png');
        this.load.image('inventory_button', 'assets/bag.png');
        this.load.image('joystickBase', 'assets/joystickBase.png');
        this.load.image('joystickHead', 'assets/joystickHead.png');
        this.load.image('money', 'assets/money.png');
        this.load.image('closeIcon', 'assets/closeIcon.png');
        this.load.image('arrow', 'assets/arrow.png');
    }

    create() {
        this.scene.launch('WorldScene');
        this.scene.launch('UiScene');

        this.data.set('selectedItemInventoryIndex', null);
        this.events.on('changedata-selectedItemInventoryIndex', function (scene, selectedItemInventoryIndex) {
            if(selectedItemInventoryIndex != undefined)
                console.log('Item selected : ' + scene.data.get('inventory')[selectedItemInventoryIndex].name + " (slot: " + selectedItemInventoryIndex + ")");
            else
                console.log('Item deselected')
        });

        let listItemsName = Object.keys(this.LIST_ITEM);
        this.data.set('inventory', new Array(70).fill({}).map((obj, i) => {
            if(i < 15) {
                return {
                    name: listItemsName[Math.floor(Math.random() * 10) + 10],
                    quantity: 1 + Math.floor(Math.random() * 9)
                }
            } else {
                return {}
            }
        }));
        this.events.on('changedata-inventory', function (parent, value) {
            parent.game.scene.getScene('UiScene').inventoryInterface.buildInventory();
        });

        this.data.set('money', 0);
        this.events.on('changedata-money', function (scene, money) {
            console.log('New money amount : ' + money);
            parent.game.scene.getScene('UiScene').updateMoney();
        });

        this.startMarketConfigGenerator();
    }

    generateMarketConfig(){
        let cropsOrder = [
            'wheat',      //  1
            'tomato',     // 10
            'lemon',      // 15
            'orange',     // 18
            'potato',     // 20
            'avocado',    // 23
            'strawberry', // 25
            'melon',      // 40
            'grapes',     // 50
            'rose',       // 60
        ];
        let listBuyingOffers = cropsOrder.map((crop, idx) => ({
            item: crop + 'Seed',
            price: idx
        }));
        let listSellingOffers = cropsOrder.map((crop, idx) => ({
            item: crop,
            price: idx
        }));
        let marketConfig = {
            buyingOffer: Utils.getRandomSetInArray(listBuyingOffers, 5),
            sellingOffer: Utils.getRandomSetInArray(listSellingOffers, 5)
        };
        return marketConfig;
    }

    startMarketConfigGenerator(){
        let delayRefreshMarket = 10;
        this.marketConfigGeneratorTimedEvent = this.time.addEvent({
            delay: delayRefreshMarket * 1000,
            startAt: delayRefreshMarket * 1000 - 1,
            callback: () => {
                this.data.set('marketConfig', this.generateMarketConfig())
            },
            callbackScope: this,
            loop: true
        });
    }

    getInventoryItemQuantity(item){
        let quantity = this.data.get('inventory')
            .filter(inventoryItem => inventoryItem.name == item)
            .map(inventoryItem => inventoryItem.quantity)
            .reduce((totalQuantity, curQuantity) => totalQuantity + curQuantity, 0);
        return quantity;
    }

    inventoryContains(item, quantity){
        if(quantity){
            let itemQuantity = this.getInventoryItemQuantity(item);
            return itemQuantity >= quantity;
        } else {
            return this.data.get('inventory').map(inventoryItem => inventoryItem.name).includes(item);
        }
    }

    swapInventoryItems(itemIdx1, itemIdx2){
        if(itemIdx1 != itemIdx2){
            let inventory = this.data.get('inventory');
            if(inventory[itemIdx1].name && inventory[itemIdx2].name && inventory[itemIdx1].name == inventory[itemIdx2].name){
                inventory[itemIdx2].quantity += inventory[itemIdx1].quantity;
                inventory[itemIdx1] = {};
            } else {
                [inventory[itemIdx1], inventory[itemIdx2]] = [inventory[itemIdx2], inventory[itemIdx1]];
            }
            this.data.set('inventory', inventory);
        }
    }

    modifyInventoryItemQuantityByIndex(itemInventoryIndex, quantityChange){
        let inventory = this.data.get('inventory').slice();
        inventory[itemInventoryIndex].quantity += quantityChange;
        if(inventory[itemInventoryIndex].quantity <= 0){
            inventory[itemInventoryIndex] = {};
        }
        this.data.set('inventory', inventory);
    }

    modifyInventoryItemQuantity(item, quantityChange){
        let inventory = this.data.get('inventory').slice();
        if(quantityChange > 0){
            if(this.inventoryContains(item)) {
                inventory.find(inventoryItem => inventoryItem.name == item).quantity += quantityChange;
            } else {
                let firstEmptyInventorySlot = inventory.find(inventoryItem => !inventoryItem.name);
                firstEmptyInventorySlot.name = item;
                firstEmptyInventorySlot.quantity = quantityChange;
            }
        } else {
            let remainingAmount = - quantityChange;
            inventory.filter(inventoryItem => inventoryItem.name == item)
                .forEach(inventoryItem => {
                    inventoryItem.quantity -= remainingAmount;
                    if(inventoryItem.quantity <= 0){
                        remainingAmount = - inventoryItem.quantity;

                        delete inventoryItem.quantity;
                        delete inventoryItem.name;
                    } else {
                        remainingAmount = 0;
                    }
                });
        }
        this.data.set('inventory', inventory);
    }

    setInventoryItemAt(idx, itemData){
        let inventory = this.data.get('inventory').slice();
        inventory[idx] = itemData;
        this.data.set('inventory', inventory);
    }

    changeMoneyAmount(change){
        this.data.set('money', this.data.get('money') + change);
    }

    update(time, delta) {}

}
