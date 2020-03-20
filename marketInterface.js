class MarketInterface extends Phaser.GameObjects.Container {
    constructor (scene, x, y, externalCallback) {
        super(scene, x, y);
        this.name = 'marketInterface';

        let backgroundImage = this.scene.add.image(0, 0, 'ui_button');
        let backgroundMargin = 40;
        backgroundImage.setDisplaySize(this.scene.cameras.main.displayWidth - 2 * backgroundMargin, this.scene.cameras.main.displayHeight - 2 * backgroundMargin);
        this.add(backgroundImage);

        let closeIconOffset = 28;
        let closeIconPos = {
            x: - this.scene.cameras.main.displayWidth / 2 + backgroundMargin + closeIconOffset,
            y: - this.scene.cameras.main.displayHeight / 2 + backgroundMargin + closeIconOffset
        };
        let closeIcon = this.scene.add.image(
            closeIconPos.x,
            closeIconPos.y,
            'closeIcon'
        ).setScale(2).setInteractive();
        this.add(closeIcon);
        closeIcon.name = 'marketInterfaceCloseIcon';

        closeIcon.on('pointerdown', externalCallback);
        this.scene.input.enableDebug(closeIcon);
        closeIcon.input.hitAreaDebug.name = 'marketCloseIconDebug';
    }
}
