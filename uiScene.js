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
            if(i == this.inventoryBarSelectedButtonIdx){
                inventoryButton.setSelected(true);
            }
        });

        this.input.off('wheel');
        this.input.on('wheel', (pointer) => {
            let idxChange = Math.sign(pointer.deltaY);
            console.log("Mouse wheel " + idxChange);
            if(this.inventoryBarSelectedButtonIdx == undefined){
                this.inventoryBarSelectedButtonIdx = 0;
                idxChange = 0;
            }
            this.selectButtonInventoryBar((nbColumns + this.inventoryBarSelectedButtonIdx + idxChange) % nbColumns);
        });
    }

    selectButtonInventoryBar(buttonIdx){
        this.deselectButtonInventoryBar();
        this.inventoryBarSelectedButtonIdx = buttonIdx;
        this.inventoryBarButtons.getChildren()[this.inventoryBarSelectedButtonIdx].setSelected(true);
        this.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', this.inventoryBarSelectedButtonIdx);
    }

    deselectButtonInventoryBar(){
        this.inventoryBarSelectedButtonIdx = null;
        this.inventoryBarButtons.getChildren().forEach(inventoryBarButton => inventoryBarButton.setSelected(false));
        this.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', this.inventoryBarSelectedButtonIdx)
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
            this.cameras.main.displayHeight - sizeButtonInventoryBar - marginButtonsInventoryBar * 2 - heightGrid,
            sizeButton,
            marginButtons,
            10
        );
        inventoryGridButtons.forEach(inventoryButton => this.inventoryGridButtons.add(inventoryButton));
    }

    buildInventoryOpenButton(){
        this.inventoryOpenButton = this.add.image(60, 45, 'inventory_button').setScale(2).setInteractive();
        this.inventoryOpenButton.name = "inventoryOpenButton";
        this.inventoryOpenButton.on('pointerdown', () => {
            this.inventoryOpen = !this.inventoryOpen;
            this.buildInventory();
        });
        this.input.enableDebug(this.inventoryOpenButton);
    }

    clearInventory(){
        if(this.inventoryOpenButton){
            this.input.removeDebug(this.inventoryOpenButton);
            this.inventoryOpenButton.destroy(this);
        }
        this.inventoryBarButtons.clear(true, true);
        this.inventoryGridButtons.clear(true, true);
    }

    buildInventory(){
        console.log("Building Inventory")
        this.clearInventory();
        this.buildInventoryBar();
        if(this.inventoryOpen){
            this.buildInventoryGrid();
        }

        this.buildInventoryOpenButton();
    }

    makeInventoryButtonsGrid(nbColumns, nbRows, x, y, sizeButton, marginButtons, inventoryOffset = 0, callbackFactory) {
        let inventoryGridButtons = [];
        for(let j=0;j<nbRows;j+=1) {
            for(let i=0;i<nbColumns;i+=1) {
                let itemInventoryIndex = inventoryOffset + i + j * nbColumns;
                let callback = callbackFactory ? callbackFactory(i, j) : null;
                let inventoryButton = new InventoryButton(
                    this,
                    x + marginButtons * i + sizeButton * (i + 0.5),
                    y + marginButtons * j + sizeButton * (j + 0.5),
                    sizeButton,
                    sizeButton,
                    15,
                    itemInventoryIndex,
                    callback
                );
                this.add.existing(inventoryButton);
                inventoryGridButtons.push(inventoryButton);
            }
        }
        return inventoryGridButtons;
    }

    hideJoystick(){
        this.joystickBase.visible = false;
        this.joystickHead.visible = false;
    }

    showJoystick(){
        this.joystickBase.visible = true;
        this.joystickHead.visible = true;
    }

    setPositionJoystick(posBase, posHead){
        this.joystickBase.setPosition(posBase.x, posBase.y);
        this.joystickHead.setPosition(posHead.x, posHead.y);
    }

    closeMarket(){
        this.marketContainer.removeAll(true);
        this.buildInventory();
    }

    openMarket(){
        this.clearInventory();

        let backgroundImage = this.add.image(0, 0, 'ui_button');
        let backgroundMargin = 40;
        backgroundImage.setDisplaySize(this.cameras.main.displayWidth - 2 * backgroundMargin, this.cameras.main.displayHeight - 2 * backgroundMargin);
        this.marketContainer.add(backgroundImage);

        let closeIconOffset = 28;
        let closeIconPos = {
            x: - this.cameras.main.displayWidth / 2 + backgroundMargin + closeIconOffset,
            y: - this.cameras.main.displayHeight / 2 + backgroundMargin + closeIconOffset
        };
        let closeIcon = this.add.image(
            closeIconPos.x,
            closeIconPos.y,
            'closeIcon'
        ).setScale(2).setInteractive();

        closeIcon.on('pointerdown', () => {
            this.closeMarket();
        });
        this.input.enableDebug(closeIcon);
        closeIcon.input.hitAreaDebug.name = 'marketCloseIconDebug';

        this.marketContainer.add(closeIcon);
        this.marketContainer.add(closeIcon.input.hitAreaDebug);

        this.children.sendToBack(this.marketContainer);
    }

    create() {
        this.inventoryOpen = false;

        this.inventoryBarButtons = this.add.group();
        this.inventoryGridButtons = this.add.group();

        this.buildInventory();

        this.joystickBase = this.add.image(0, 0, 'joystickBase');
        this.joystickBase.name = 'joystickBase';
        this.joystickHead = this.add.image(0, 0, 'joystickHead');
        this.joystickHead.name = 'joystickHead';
        this.hideJoystick();

        this.moneyContainer = this.add.container(this.cameras.main.displayWidth - 45, 40);
        this.moneyContainer.name = 'moneyContainer';
        this.moneyImage = this.add.image(0, 0, 'money').setScale(2);
        this.moneyContainer.add(this.moneyImage);
        this.moneyAmountText = this.add.text(
            0,
            0,
            '0',
            {
                fontSize: '26px',
                fontFamily: '"Roboto Condensed"',
                resolution: 3
            }
        ).setOrigin(0.5, 0.5);
        this.moneyContainer.add(this.moneyAmountText);
        let {width, height} = this.moneyContainer.getBounds();
        this.moneyContainer.setSize(width, height).setInteractive();
        this.updateMoney();

        this.marketContainer = this.add.container(this.cameras.main.displayWidth / 2, this.cameras.main.displayHeight / 2);
        this.marketContainer.name = 'marketContainer';
    }

    updateMoney(){
        this.moneyAmountText.setText(this.game.scene.getScene('ControllerScene').data.get('money'))
    }

    update(time, delta) {

    }

}
