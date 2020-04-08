import * as Phaser from "phaser";

export class InventoryButton extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, displayHeight, marginIcon, itemInventoryIndex, externalCallback) {
        super(scene, x, y);

        this.backgroundImage = this.scene.add.image(0, 0, 'ui_button');
        this.add(this.backgroundImage);

        this.contentContainer = this.scene.add.container(0, 0);

        this.itemInventoryIndex = itemInventoryIndex;
        let inventory = this.scene.game.scene.getScene('ControllerScene').data.get('inventory');
        let inventoryItemData = inventory[this.itemInventoryIndex % inventory.length];
        this.item = inventoryItemData.name;
        this.quantity = inventoryItemData.quantity;

        if(this.item != undefined){

            let itemTypeData = this.scene.game.scene.getScene('ControllerScene').LIST_ITEM[this.item];

            let backgroundImageBounds = this.backgroundImage.getBounds();
            this.itemIcon = this.scene.add.sprite(0, 0, itemTypeData.texture, itemTypeData.frame);
            this.itemIcon.setDisplaySize(
                backgroundImageBounds.width - marginIcon,
                backgroundImageBounds.height - marginIcon
            );
            this.contentContainer.add(this.itemIcon);

            this.itemCountText = this.scene.add.text(
                backgroundImageBounds.width / 2,
                backgroundImageBounds.height / 2,
                this.quantity,
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
            this.itemCountText.setOrigin(1, 1);
            this.contentContainer.add(this.itemCountText);

            this.add(this.contentContainer);
        }

        const { width, height } = this.getBounds();
        this.setSize(width, height).setDisplaySize(displayWidth, displayHeight);

        this.isSelected = false;

        this.setInteractive(undefined, undefined, true);
        this.scene.input.setDraggable(this);

        if(externalCallback){
            this.on('pointerdown', () => {
                externalCallback(this);
            });
        };

        this.on('pointerover', function () {
            this.isMouseOver = true;
            this.updateColor();
        });

        this.on('pointerout', function () {
            this.isMouseOver = false;
            this.updateColor();
        });

        this.on('dragstart', function (pointer, dragX, dragY) {
            this.parentContainer.bringToTop(this);
        });

        this.on('drag', function (pointer, dragX, dragY) {
            if(this.contentContainer){
                let x = Utils.clamp(dragX, this.displayWidth / 2, this.scene.cameras.main.displayWidth - this.displayWidth / 2);
                let y = Utils.clamp(dragY, this.displayHeight / 2, this.scene.cameras.main.displayHeight - this.displayHeight / 2);
                let containerSpacePos = this.pointToContainer({x, y});
                this.contentContainer.x = containerSpacePos.x;
                this.contentContainer.y = containerSpacePos.y;
            }
        });

        this.on('dragend', function (pointer, dragX, dragY) {
            if(this.contentContainer){
                this.contentContainer.setPosition(0, 0);
            }
        });

        this.on('drop', (pointer, target) => {
            this.scene.game.scene.getScene('ControllerScene').swapInventoryItems(this.itemInventoryIndex, target.itemInventoryIndex);
        });
    }

    setSelected(isSelected){
        this.isSelected = isSelected;
        this.updateColor();
    }

    updateColor(){
        if(this.isSelected){
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
