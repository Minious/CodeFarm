import * as Phaser from "phaser";

import {InventoryButton} from './inventoryButton';
import { Inventory } from "../../types/inventory.type";

export class InventoryInterface extends Phaser.GameObjects.Container {
    private inventoryBarButtons: Phaser.GameObjects.Group;
    private inventoryGridButtons: Phaser.GameObjects.Group;
    private inventoryOpen: boolean;

    constructor (scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.name = 'inventoryInterface';

        this.inventoryBarButtons = this.scene.add.group();
        this.inventoryGridButtons = this.scene.add.group();

        this.inventoryOpen = false;
    }

    buildInventoryBar(inventory: Inventory){
        let marginButtons = 8;
        let nbColumns = 10;
        let nbRows = 1;
        let sizeButton = (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns - marginButtons;

        let inventoryBarButtons = this.makeInventoryButtonsGrid(
            inventory,
            nbColumns,
            nbRows,
            marginButtons,
            this.scene.cameras.main.displayHeight - sizeButton - marginButtons,
            sizeButton,
            marginButtons,
            0,
            (columnsIdx: number, rowIdx: number) => {
                return (clickedButton: InventoryButton) => {
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
            if(i == this.scene.game.scene.getScene('ControllerScene').data.get('selectedItemInventoryIndex')){
                inventoryButton.isSelected = true;
            }
        });

        this.scene.input.off('wheel');
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer) => {
            let idxChange = Math.sign(pointer.deltaY);
            console.log("Mouse wheel " + idxChange);
            if(this.scene.game.scene.getScene('ControllerScene').data.get('selectedItemInventoryIndex') == undefined){
                idxChange = 0;
                this.scene.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', 0);
            }
            this.selectButtonInventoryBar((nbColumns + this.scene.game.scene.getScene('ControllerScene').data.get('selectedItemInventoryIndex') + idxChange) % nbColumns);
        });
    }

    selectButtonInventoryBar(buttonIdx: number){
        this.deselectButtonInventoryBar();
        (this.inventoryBarButtons.getChildren()[buttonIdx] as InventoryButton).isSelected = true;
        this.scene.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', buttonIdx);
    }

    deselectButtonInventoryBar(){
        this.inventoryBarButtons.getChildren().forEach((inventoryBarButton: InventoryButton) => inventoryBarButton.isSelected = false);
        this.scene.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', undefined)
    }

    buildInventoryGrid(inventory: Inventory){
        let sizeButton = 50;
        let marginButtons = 8;
        let marginButtonsInventoryBar = 8;
        let nbColumns = 10;
        let nbRows = 6;
        let widthGrid = sizeButton * nbColumns + marginButtons * (nbColumns - 1);
        let heightGrid = sizeButton * nbRows + marginButtons * (nbRows - 1);
        let sizeButtonInventoryBar = (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns - marginButtons;
        let inventoryGridButtons = this.makeInventoryButtonsGrid(
            inventory,
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
        let inventoryOpenButton = this.scene.add.image(60, 45, 'inventory_button').setScale(2).setInteractive();
        inventoryOpenButton.name = "inventoryOpenButton";
        inventoryOpenButton.on('pointerup', () => {
            this.inventoryOpen = !this.inventoryOpen;
            this.inventoryGridButtons.setVisible(this.inventoryOpen);
        });
        this.scene.input.enableDebug(inventoryOpenButton);
        this.add(inventoryOpenButton);
        this.add(inventoryOpenButton.input.hitAreaDebug);
    }

    clearInventory(){
        this.removeAll(true);
    }

    buildInventory(inventory: Inventory){
        console.log("Building Inventory")
        this.clearInventory();
        this.buildInventoryBar(inventory);
        this.buildInventoryGrid(inventory);
        this.inventoryGridButtons.setVisible(this.inventoryOpen);

        this.buildInventoryOpenButton();
    }

    makeInventoryButtonsGrid(inventory: Inventory, nbColumns: number, nbRows: number, x: number, y: number, sizeButton: number, marginButtons: number, inventoryOffset: number = 0, callbackFactory?: (x: number, y: number) => Function) {
        let inventoryGridButtons = [];
        for(let j=0;j<nbRows;j+=1) {
            for(let i=0;i<nbColumns;i+=1) {
                let itemInventoryIndex = inventoryOffset + i + j * nbColumns;
                let inventoryItem = inventory[itemInventoryIndex];
                let callback = callbackFactory ? callbackFactory(i, j) : null;
                let inventoryButton = new InventoryButton(
                    this.scene,
                    x + marginButtons * i + sizeButton * (i + 0.5),
                    y + marginButtons * j + sizeButton * (j + 0.5),
                    sizeButton,
                    sizeButton,
                    15,
                    inventoryItem,
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
