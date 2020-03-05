var config = {
    type: Phaser.AUTO,
    width: 700,
    height: 500,
    backgroundColor: "#DDD",
    parent: 'game',
    physics: {
        default: 'arcade'
    },
    pixelArt: true,
    scene: [Scene1]
};

var game = new Phaser.Game(config);
