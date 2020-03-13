class ControllerScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ControllerScene"
        });

        this.LIST_ITEM = {
            scythe: {
                texture: 'tools',
                frame: 0
            },
            hoe: {
                texture: 'tools',
                frame: 1
            },
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
            if(i == 0) {
                return {
                    name: 'hoe',
                    quantity: 1
                }
            } else if(i == 1) {
                return {
                    name: 'scythe',
                    quantity: 1
                }
            } else if(i < 15) {
                return {
                    name: listItemsName[Math.floor(Math.random() * 11) + 11],
                    quantity: 1 + Math.floor(Math.random() * 9)
                }
            } else {
                return {}
            }
        }));
        this.events.on('changedata-inventory', function (parent, value) {
            parent.game.scene.getScene('UiScene').buildInventory();
        });
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

    modifyInventoryItemQuantity(itemInventoryIndex, quantityChange){
        let inventory = this.data.get('inventory').slice();
        inventory[itemInventoryIndex].quantity += quantityChange;
        if(inventory[itemInventoryIndex].quantity <= 0){
            inventory[itemInventoryIndex] = {};
        }
        this.data.set('inventory', inventory);
    }

    setInventoryItemAt(idx, itemData){
        let inventory = this.data.get('inventory').slice();
        inventory[idx] = itemData;
        this.data.set('inventory', inventory);
    }

    update(time, delta) {}

}
