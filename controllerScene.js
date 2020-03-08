class ControllerScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ControllerScene"
        });

        this.LIST_ITEM = {
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
        this.load.image('ui_button', 'assets/ui_button.png');
    }

    create() {
        this.scene.launch('WorldScene');
        this.scene.launch('UiScene');

        this.data.set('selectedItem', null);
        this.events.on('changedata-selectedItem', function (gameObject, value) {
            console.log('Item selected : ' + value);
        });
    }

    update(time, delta) {}

}
