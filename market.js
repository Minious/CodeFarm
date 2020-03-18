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
        let externalCallback = () => {};
        super(scene, x, y, 306, size, colliderPosition, externalCallback);
    }
}