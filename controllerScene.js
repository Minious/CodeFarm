class ControllerScene extends Phaser.Scene {
    constructor() {
        super({
            key: "ControllerScene"
        });
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
