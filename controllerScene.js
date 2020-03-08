class ControllerScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ControllerScene"
        });

        this.LIST_ITEM = {
            // scythe: {
            //     texture: 'tools',
            //     frame: 0
            // },
            hoe: {
                texture: 'tools',
                frame: 1
            },
            wheat: {
                texture: 'crops',
                frame: 70
            },
            avocado: {
                texture: 'crops',
                frame: 101
            },
            melon: {
                texture: 'crops',
                frame: 29
            },
            lemon: {
                texture: 'crops',
                frame: 41
            },
            tomato: {
                texture: 'crops',
                frame: 35
            },
            potato: {
                texture: 'crops',
                frame: 95
            },
            grapes: {
                texture: 'crops',
                frame: 65
            },
            rose: {
                texture: 'crops',
                frame: 5
            },
            strawberry: {
                texture: 'crops',
                frame: 83
            },
            orange: {
                texture: 'crops',
                frame: 107
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

        this.data.set('selectedItem', null);
        this.events.on('changedata-selectedItem', function (gameObject, value) {
            console.log('Item selected : ' + value);
        });

        let listItemsName = Object.keys(this.LIST_ITEM);
        this.data.set('inventory', new Array(70).fill({}).map(() => ({
            name: listItemsName[Math.floor(Math.random() * listItemsName.length)]
        })));
        this.events.on('changedata-inventory', function (gameObject, value) {
            this.game.scene.getScene('UiScene').buildInventory();
        });
    }

    update(time, delta) {}

}
