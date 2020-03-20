class Market extends Building {
    constructor (scene, x, y) {
        let margin = 15;
        let heightMarket = 50;
        let size = {x: 3, y: 4};
        let colliderPosition = {
            x: margin,
            y: size.y * 32 - heightMarket,
            width: size.x * 32 - 2 * margin,
            height: heightMarket
        };
        let foreground = {
            minX: 0,
            maxX: 2,
            minY: 0,
            maxY: 2,
        }
        let externalCallback = () => {
            this.scene.game.scene.getScene('UiScene').openMarket();
        };
        super(scene, x, y, 306, size, foreground, colliderPosition, externalCallback);
    }
}