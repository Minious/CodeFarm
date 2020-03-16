class LootAnim extends Phaser.GameObjects.Container {
    constructor (scene, x, y, displayWidth, displayHeight, angle, item, quantity) {
        super(scene, x, y);

        this.item = item;
        let itemTypeData = this.scene.game.scene.getScene('ControllerScene').LIST_ITEM[this.item];

        this.quantity = quantity;

        this.itemIcon = this.scene.add.sprite(0, 0, itemTypeData.texture, itemTypeData.frame);
        this.add(this.itemIcon);

        let itemIconBounds = this.itemIcon.getBounds();
        this.itemCountText = this.scene.add.text(
            0,
            itemIconBounds.height / 2,
            this.quantity,
            {
                fontSize: '12px',
                fontFamily: '"Roboto Condensed"',
                align: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                resolution: 3
            }
        );
        this.itemCountText.setOrigin(0.5, 0.5);
        this.add(this.itemCountText);

        let dir = new Phaser.Math.Vector2().setToPolar(angle);

        let distance = 40;
        this.scene.tweens.add({
            targets: this,
            ease: 'Sine.easeOut',
            duration: 1000,
            delay: 0,
            x: {
                getStart: () => x,
                getEnd: () => x + dir.x * distance
            },
            y: {
                getStart: () => y,
                getEnd: () => y + dir.y * distance
            },
            alpha: {
                getStart: () => 1,
                getEnd: () => 0
            },
            onComplete: () => {
                this.destroy(this.scene);
            }
        });
    }
}
