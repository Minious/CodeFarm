class UiScene extends Phaser.Scene {
    constructor() {
        super({
            key: "UiScene"
        });
    }

    preload() {}

    buildInventoryBar(){
        let marginButtons = 8;
        let nbColumns = 10;
        let nbRows = 1;
        let sizeButton = (this.cameras.main.displayWidth - marginButtons) / nbColumns - marginButtons;
        let inventoryBarButtons = this.makeInventoryButtonsGrid(
            nbColumns,
            nbRows,
            marginButtons,
            this.cameras.main.displayHeight - sizeButton - marginButtons,
            sizeButton,
            marginButtons
        );
        inventoryBarButtons.forEach(inventoryButton => this.inventoryBarButtons.add(inventoryButton));
    }

    buildInventoryGrid(){
        let sizeButton = 50;
        let marginButtons = 8;
        let marginButtonsInventoryBar = 8;
        let nbColumns = 10;
        let nbRows = 6;
        let widthGrid = sizeButton * nbColumns + marginButtons * (nbColumns - 1);
        let heightGrid = sizeButton * nbRows + marginButtons * (nbRows - 1);
        let sizeButtonInventoryBar = (this.cameras.main.displayWidth - marginButtons) / nbColumns - marginButtons;
        let inventoryGridButtons = this.makeInventoryButtonsGrid(
            nbColumns,
            nbRows,
            (this.cameras.main.displayWidth - widthGrid) / 2,
            (this.cameras.main.displayHeight - sizeButtonInventoryBar - marginButtonsInventoryBar - heightGrid) / 2,
            sizeButton,
            marginButtons
        );
        inventoryGridButtons.forEach(inventoryButton => this.inventoryBarButtons.add(inventoryButton));
    }

    makeInventoryButtonsGrid(nbColumns, nbRows, x, y, sizeButton, marginButtons) {
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
        let inventoryGridButtons = [];
        for(let j=0;j<nbRows;j+=1) {
            for(let i=0;i<nbColumns;i+=1) {
                let cropType = cropsTypes[(i + j * nbColumns) % cropsTypes.length];
                let cropInventoryButton = new InventoryButton(
                    this,
                    x + marginButtons * i + sizeButton * (i + 0.5),
                    y + marginButtons * j + sizeButton * (j + 0.5),
                    sizeButton,
                    sizeButton,
                    cropType.item,
                    'crops',
                    cropType.frame
                );
                this.add.existing(cropInventoryButton);
                inventoryGridButtons.push(cropInventoryButton);
            }
        }
        return inventoryGridButtons;
    }

    create() {
        this.inventoryBarButtons = this.add.group();
        this.buildInventoryBar();

        this.inventoryGridButtons = this.add.group();
        this.buildInventoryGrid();
    }

    update(time, delta) {

    }

}
