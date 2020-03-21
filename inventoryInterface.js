class InventoryInterface extends Phaser.GameObjects.Container {
    constructor (scene, x, y) {
        super(scene, x, y);
        this.name = 'inventoryInterface';

        this.inventoryBarButtons = this.scene.add.group();
        this.inventoryGridButtons = this.scene.add.group();

        this.inventoryOpen = false;

        this.buildInventory();
    }

    buildInventoryBar(){
        let marginButtons = 8;
        let nbColumns = 10;
        let nbRows = 1;
        let sizeButton = (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns - marginButtons;

        let inventoryBarButtons = this.makeInventoryButtonsGrid(
            nbColumns,
            nbRows,
            marginButtons,
            this.scene.cameras.main.displayHeight - sizeButton - marginButtons,
            sizeButton,
            marginButtons,
            0,
            (columnsIdx, rowIdx) => {
                return (clickedButton) => {
                    let clickedButtonPreviousIsSelectedValue = clickedButton.isSelected;
                    if(clickedButtonPreviousIsSelectedValue)
                        this.deselectButtonInventoryBar();
                    else
                        this.selectButtonInventoryBar(columnsIdx);
                }
            }
        );

        inventoryBarButtons.forEach((inventoryButton, i) => {
            this.inventoryBarButtons.add(inventoryButton);
            if(i == this.scene.inventoryBarSelectedButtonIdx){
                inventoryButton.setSelected(true);
            }
        });

        this.scene.input.off('wheel');
        this.scene.input.on('wheel', (pointer) => {
            let idxChange = Math.sign(pointer.deltaY);
            console.log("Mouse wheel " + idxChange);
            if(this.scene.inventoryBarSelectedButtonIdx == undefined){
                this.scene.inventoryBarSelectedButtonIdx = 0;
                idxChange = 0;
            }
            this.selectButtonInventoryBar((nbColumns + this.scene.inventoryBarSelectedButtonIdx + idxChange) % nbColumns);
        });
    }

    selectButtonInventoryBar(buttonIdx){
        this.deselectButtonInventoryBar();
        this.scene.inventoryBarSelectedButtonIdx = buttonIdx;
        this.inventoryBarButtons.getChildren()[this.scene.inventoryBarSelectedButtonIdx].setSelected(true);
        this.scene.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', this.scene.inventoryBarSelectedButtonIdx);
    }

    deselectButtonInventoryBar(){
        this.scene.inventoryBarSelectedButtonIdx = null;
        this.inventoryBarButtons.getChildren().forEach(inventoryBarButton => inventoryBarButton.setSelected(false));
        this.scene.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', this.scene.inventoryBarSelectedButtonIdx)
    }

    buildInventoryGrid(){
        let sizeButton = 50;
        let marginButtons = 8;
        let marginButtonsInventoryBar = 8;
        let nbColumns = 10;
        let nbRows = 6;
        let widthGrid = sizeButton * nbColumns + marginButtons * (nbColumns - 1);
        let heightGrid = sizeButton * nbRows + marginButtons * (nbRows - 1);
        let sizeButtonInventoryBar = (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns - marginButtons;
        let inventoryGridButtons = this.makeInventoryButtonsGrid(
            nbColumns,
            nbRows,
            (this.scene.cameras.main.displayWidth - widthGrid) / 2,
            this.scene.cameras.main.displayHeight - sizeButtonInventoryBar - marginButtonsInventoryBar * 2 - heightGrid,
            sizeButton,
            marginButtons,
            10
        );
        inventoryGridButtons.forEach(inventoryButton => this.inventoryGridButtons.add(inventoryButton));
    }

    buildInventoryOpenButton(){
        this.inventoryOpenButton = this.scene.add.image(60, 45, 'inventory_button').setScale(2).setInteractive();
        this.inventoryOpenButton.name = "inventoryOpenButton";
        this.inventoryOpenButton.on('pointerup', () => {
            this.inventoryOpen = !this.inventoryOpen;
            this.inventoryGridButtons.setVisible(this.inventoryOpen);
        });
        this.scene.input.enableDebug(this.inventoryOpenButton);
        this.add(this.inventoryOpenButton);
        this.add(this.inventoryOpenButton.input.hitAreaDebug);
    }

    clearInventory(){
        this.removeAll(true);
    }

    buildInventory(){
        console.log("Building Inventory")
        this.clearInventory();
        this.buildInventoryBar();
        this.buildInventoryGrid();
        this.inventoryGridButtons.setVisible(this.inventoryOpen);

        this.buildInventoryOpenButton();
    }

    makeInventoryButtonsGrid(nbColumns, nbRows, x, y, sizeButton, marginButtons, inventoryOffset = 0, callbackFactory) {
        let inventoryGridButtons = [];
        for(let j=0;j<nbRows;j+=1) {
            for(let i=0;i<nbColumns;i+=1) {
                let itemInventoryIndex = inventoryOffset + i + j * nbColumns;
                let callback = callbackFactory ? callbackFactory(i, j) : null;
                let inventoryButton = new InventoryButton(
                    this.scene,
                    x + marginButtons * i + sizeButton * (i + 0.5),
                    y + marginButtons * j + sizeButton * (j + 0.5),
                    sizeButton,
                    sizeButton,
                    15,
                    itemInventoryIndex,
                    callback
                );
                this.add(inventoryButton);
                inventoryGridButtons.push(inventoryButton);
            }
        }
        return inventoryGridButtons;
    }
}
