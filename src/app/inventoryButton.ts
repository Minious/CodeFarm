import * as Phaser from "phaser";

import { Inventory } from "./types/inventory.type";
import { getItemData } from "./interfaces/itemData.interface";
import { Utils } from "./utils";
import { ControllerScene } from "./controllerScene";
import { Vector2 } from "./types/vector2.type";
import { InventoryItem } from "./interfaces/inventoryItem.interface";

export class InventoryButton extends Phaser.GameObjects.Container {
    private backgroundImage: Phaser.GameObjects.Image;
    private _isSelected: boolean;
    private isMouseOver: boolean;
    private _itemInventoryIndex: number;

    get itemInventoryIndex(): number {
        return this._itemInventoryIndex;
    }

    get isSelected(): boolean {
        return this._isSelected;
    }

    set isSelected(_isSelected: boolean){
        this._isSelected = _isSelected;
        this.updateColor();
    }

    constructor (scene: Phaser.Scene, x: number, y: number, displayWidth: number, displayHeight: number, marginIcon: number, inventoryItem: InventoryItem, itemInventoryIndex: number, externalCallback: Function) {
        super(scene, x, y);

        this._itemInventoryIndex = itemInventoryIndex;

        this.backgroundImage = this.scene.add.image(0, 0, 'ui_button');
        this.add(this.backgroundImage);

        let contentContainer = this.scene.add.container(0, 0);

        if(inventoryItem){
            let itemTypeData = getItemData(inventoryItem.item);

            let backgroundImageBounds = this.backgroundImage.getBounds();
            let itemIcon = this.scene.add.sprite(0, 0, itemTypeData.texture, itemTypeData.frame);
            itemIcon.setDisplaySize(
                backgroundImageBounds.width - marginIcon,
                backgroundImageBounds.height - marginIcon
            );
            contentContainer.add(itemIcon);

            let itemCountText = this.scene.add.text(
                backgroundImageBounds.width / 2,
                backgroundImageBounds.height / 2,
                inventoryItem.quantity.toString(),
                {
                    fontSize: '12px',
                    fontFamily: '"Roboto Condensed"',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    fixedWidth: 15,
                    fixedHeight: 15,
                    align: 'center',
                    resolution: 3
                }
            );
            itemCountText.setOrigin(1, 1);
            contentContainer.add(itemCountText);

            this.add(contentContainer);
        }

        const { width, height } = this.getBounds();
        this.setSize(width, height).setDisplaySize(displayWidth, displayHeight);

        this._isSelected = false;

        this.setInteractive(undefined, undefined, true);
        this.scene.input.setDraggable(this);

        if(externalCallback){
            this.on('pointerdown', () => {
                externalCallback(this);
            });
        };

        this.on('pointerover', () => {
            this.isMouseOver = true;
            this.updateColor();
        });

        this.on('pointerout', () => {
            this.isMouseOver = false;
            this.updateColor();
        });

        this.on('dragstart', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            this.parentContainer.bringToTop(this);
        });

        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            if(contentContainer){
                let x = Utils.clamp(dragX, this.displayWidth / 2, this.scene.cameras.main.displayWidth - this.displayWidth / 2);
                let y = Utils.clamp(dragY, this.displayHeight / 2, this.scene.cameras.main.displayHeight - this.displayHeight / 2);
                let containerSpacePos = this.pointToContainer({x, y}) as Vector2;
                contentContainer.x = containerSpacePos.x;
                contentContainer.y = containerSpacePos.y;
            }
        });

        this.on('dragend', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            if(contentContainer){
                contentContainer.setPosition(0, 0);
            }
        });

        this.on('drop', (pointer: Phaser.Input.Pointer, target: InventoryButton) => {
            (this.scene.game.scene.getScene('ControllerScene') as ControllerScene).swapInventoryItems(this._itemInventoryIndex, target.itemInventoryIndex);
        });
    }

    updateColor(){
        if(this._isSelected){
            if(this.isMouseOver){
                this.backgroundImage.setTint(0x33dd33);
            } else {
                this.backgroundImage.setTint(0xffffbb, 0xffff00, 0xffff00, 0x999900);
            }
        } else {
            if(this.isMouseOver){
                this.backgroundImage.setTint(0x44ff44);
            } else {
                this.backgroundImage.clearTint();
            }
        }
    }
}
