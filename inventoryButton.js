class InventoryButton extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, displayHeight, marginIcon, itemInventoryIndex) {
        super(scene, x, y);

        this.backgroundImage = this.scene.add.image(0, 0, 'ui_button');
        this.backgroundImage.setInteractive();
        this.add(this.backgroundImage);

        this.itemInventoryIndex = itemInventoryIndex;
        let inventory = this.scene.game.scene.getScene('ControllerScene').data.get('inventory');
        let inventoryItemData = inventory[itemInventoryIndex % inventory.length];
        this.item = inventoryItemData.name;
        this.quantity = inventoryItemData.quantity;

        if(this.item != undefined){
            this.callback = () => {
                this.scene.game.scene.getScene('ControllerScene').data.set('selectedItemInventoryIndex', this.itemInventoryIndex)
            };
            this.backgroundImage.on('pointerdown', () => {
                this.callback();
            });

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
}
