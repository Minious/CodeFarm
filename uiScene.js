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
            marginButtons,
            10
        );
        inventoryGridButtons.forEach(inventoryButton => this.inventoryBarButtons.add(inventoryButton));
    }

    buildInventory(){
        this.inventoryBarButtons.clear(true, true);
        this.buildInventoryBar();
        if(this.inventoryOpen){
            this.inventoryGridButtons.clear(true, true);
            this.buildInventoryGrid();
        }
    }

    makeInventoryButtonsGrid(nbColumns, nbRows, x, y, sizeButton, marginButtons, inventoryOffset = 0) {
        let inventoryGridButtons = [];
        for(let j=0;j<nbRows;j+=1) {
            for(let i=0;i<nbColumns;i+=1) {
                let inventoryIndex = i + j * nbColumns;
                let inventory = this.game.scene.getScene('ControllerScene').data.get('inventory');
                let inventoryButton = new InventoryButton(
                    this,
                    x + marginButtons * i + sizeButton * (i + 0.5),
                    y + marginButtons * j + sizeButton * (j + 0.5),
                    sizeButton,
                    sizeButton,
                    15,
                    inventory[(inventoryIndex + inventoryOffset) % inventory.length]['name']
                );
                this.add.existing(inventoryButton);
                inventoryGridButtons.push(inventoryButton);
            }
        }
        return inventoryGridButtons;
    }

    create() {
        this.inventoryOpen = true;

        this.inventoryBarButtons = this.add.group();
        this.inventoryGridButtons = this.add.group();

        this.buildInventory();
    }

    update(time, delta) {

    }

}
