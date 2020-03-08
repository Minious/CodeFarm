class UiButton extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, displayHeight, callback, texture, frame) {
        super(scene, x, y);

        let backgroundImage = scene.add.image(0, 0, 'ui_button');
        backgroundImage.setInteractive();
        backgroundImage.on('pointerdown', callback);
        let backgroundImageBounds = backgroundImage.getBounds();

        let itemIcon = scene.add.sprite(0, 0, texture, frame);
        itemIcon.setDisplaySize(
            backgroundImageBounds.width - 15,
            backgroundImageBounds.height - 15
        );

        this.add(backgroundImage);
        this.add(itemIcon);

        const { width, height } = this.getBounds();

        this.setSize(width, height).setDisplaySize(displayWidth, displayHeight);
    }
}
