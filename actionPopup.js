class ActionPopup extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, item, externalCallback) {
        super(scene, x, y);

        this.externalCallback = externalCallback;

        this.backgroundImage1 = this.scene.add.image(0, 0, 'ui_button');
        this.add(this.backgroundImage1);
        let backgroundImage1Bounds = this.backgroundImage1.getBounds();
        this.backgroundImage1.setPosition(0, - backgroundImage1Bounds.height);
        
        this.backgroundImage2 = this.scene.add.image(0, - backgroundImage1Bounds.height / 2, 'ui_button');
        this.backgroundImage2.setDisplaySize(backgroundImage1Bounds.width / Math.sqrt(2), backgroundImage1Bounds.width / Math.sqrt(2));
        this.backgroundImage2.rotation = Math.PI / 4;
        this.add(this.backgroundImage2);


        this.bringToTop(this.backgroundImage1);

        this.item = item;
        let itemTypeData = this.scene.game.scene.getScene('ControllerScene').LIST_ITEM[this.item];

        let marginIcon = 14;
        this.itemIcon = this.scene.add.sprite(0, - backgroundImage1Bounds.height, itemTypeData.texture, itemTypeData.frame);
        this.itemIcon.setDisplaySize(
            backgroundImage1Bounds.width - marginIcon,
            backgroundImage1Bounds.height - marginIcon
        );
        this.add(this.itemIcon);

        const actionPopupBounds = this.getBounds();
        this.setSize(actionPopupBounds.width, actionPopupBounds.height);

        this.scale = 0;

        let scale = displayWidth / backgroundImage1Bounds.width;
        this.scene.tweens.add({
            targets: this,
            ease: 'Elastic.easeOut',
            duration: 400,
            delay: 0,
            easeParams: [0.1, 0.7],
            // y: {
            //     getStart: () => y,
            //     getEnd: () => y - 10
            // },
            scale: {
                getStart: () => 0,
                getEnd: () => scale
            },
            onComplete: () => {
                if(this.scene) {
                    let hitArea = Phaser.Geom.Rectangle.Clone(actionPopupBounds);
                    hitArea.setPosition(
                        hitArea.x - this.x + hitArea.width / 2,
                        hitArea.y - this.y + hitArea.height / 2,
                    )
                    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

                    this.scene.input.enableDebug(this);
                    this.on('pointerdown', () => {
                        externalCallback();
                        this.scene.input.removeDebug(this);
                        this.scene.popupClicked = true;
                        this.destroy(this.scene);
                    });
                }
            }
        });
    }
}
