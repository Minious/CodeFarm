class InventoryButton extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, displayHeight, marginIcon, item) {
        super(scene, x, y);

        let backgroundImage = scene.add.image(0, 0, 'ui_button');
        backgroundImage.setInteractive();
        this.backgroundImage = backgroundImage;
        this.add(backgroundImage);

        if(item != undefined){
            this.callback = () => this.scene.game.scene.getScene('ControllerScene').data.set('selectedItem', item);
            backgroundImage.on('pointerdown', () => {
                this.callback();
            });

            let itemData = this.scene.game.scene.getScene('ControllerScene').LIST_ITEM[item];

            let backgroundImageBounds = backgroundImage.getBounds();
            let itemIcon = scene.add.sprite(0, 0, itemData.texture, itemData.frame);
            itemIcon.setDisplaySize(
                backgroundImageBounds.width - marginIcon,
                backgroundImageBounds.height - marginIcon
            );
            this.add(itemIcon);
            this.itemIcon = itemIcon;
        }

        const { width, height } = this.getBounds();

        this.setSize(width, height).setDisplaySize(displayWidth, displayHeight);
    }
}
