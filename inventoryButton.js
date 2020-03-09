class InventoryButton extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, displayHeight, marginIcon, itemInventoryIndex, externalCallback) {
        super(scene, x, y);

        this.backgroundImage = this.scene.add.image(0, 0, 'ui_button');
        this.backgroundImage.setInteractive();
        this.add(this.backgroundImage);

        this.itemInventoryIndex = itemInventoryIndex;
        let inventory = this.scene.game.scene.getScene('ControllerScene').data.get('inventory');
        let inventoryItemData = inventory[this.itemInventoryIndex % inventory.length];
        this.item = inventoryItemData.name;
        this.quantity = inventoryItemData.quantity;

        this.isSelected = false;

        if(externalCallback){
            this.backgroundImage.on('pointerdown', () => {
                    externalCallback(this);
            });
        }

        if(this.item != undefined){

            let itemTypeData = this.scene.game.scene.getScene('ControllerScene').LIST_ITEM[this.item];

            let backgroundImageBounds = this.backgroundImage.getBounds();
            this.itemIcon = this.scene.add.sprite(0, 0, itemTypeData.texture, itemTypeData.frame);
            this.itemIcon.setDisplaySize(
                backgroundImageBounds.width - marginIcon,
                backgroundImageBounds.height - marginIcon
            );
            this.add(this.itemIcon);

            this.itemCountText = this.scene.add.text(0, backgroundImageBounds.height / 2, this.quantity, {
                fontSize: '16px',
                fontFamily: '"Roboto Condensed"',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                fixedWidth: backgroundImageBounds.width,
                fixedHeight: 20,
                align: 'center',
                resolution: 3
            });
            this.itemCountText.setOrigin(0.5, 1);
            this.add(this.itemCountText);
        }

        const { width, height } = this.getBounds();

        this.setSize(width, height).setDisplaySize(displayWidth, displayHeight);
    }

    setSelected(isSelected){
        this.isSelected = isSelected;
        if(this.isSelected){
            this.backgroundImage.setTint(0xffffbb, 0xffff00, 0xffff00, 0x999900);
        } else {
            this.backgroundImage.clearTint();
        }
    }
}
