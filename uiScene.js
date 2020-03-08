class UiScene extends Phaser.Scene {
    constructor() {
        super({
            key: "UiScene"
        })
    }

    preload() {}

    makeInventoryButtons(nbButtons, marginButtons = 8) {
        let sizeButton = (this.cameras.main.displayWidth - marginButtons) / nbButtons - marginButtons;
        console.log(sizeButton);
        let cropsTypes = [
            {
                item: 'wheat',
                frame: 70
            },
            {
                item: 'avocado',
                frame: 101
            },
            {
                item: 'melon',
                frame: 29
            },
            {
                item: 'lemon',
                frame: 41
            },
            {
                item: 'tomato',
                frame: 35
            },
            {
                item: 'potato',
                frame: 95
            },
            {
                item: 'grapes',
                frame: 65
            },
            {
                item: 'rose',
                frame: 5
            },
            {
                item: 'strawberry',
                frame: 83
            },
            {
                item: 'orange',
                frame: 107
            },
        ];
        for(let i=0;i<nbButtons;i+=1) {
            let cropType = cropsTypes[i % cropsTypes.length];
            let cropInventoryButton = new InventoryButton(
                this,
                marginButtons * (i + 1) + sizeButton * (i + 0.5),
                this.cameras.main.height - sizeButton / 2 - marginButtons,
                sizeButton,
                sizeButton,
                cropType.item,
                'crops',
                cropType.frame
            );
            this.add.existing(cropInventoryButton);
        }
    }

    create() {
        this.makeInventoryButtons(10)
    }

    update(time, delta) {

    }

}
