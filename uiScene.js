class UiScene extends Phaser.Scene {
    constructor() {
        super({
            key: "UiScene"
        });
    }

    preload() {}

    hideJoystick(){
        this.joystickBase.visible = false;
        this.joystickHead.visible = false;
    }

    showJoystick(){
        this.joystickBase.visible = true;
        this.joystickHead.visible = true;
    }

    setPositionJoystick(posBase, posHead){
        this.joystickBase.setPosition(posBase.x, posBase.y);
        this.joystickHead.setPosition(posHead.x, posHead.y);
    }

    closeMarket(){
        this.inventoryInterface.setVisible(true);
        this.marketInterface.setVisible(false);
    }

    openMarket(){
        this.inventoryInterface.setVisible(false);
        this.marketInterface.setVisible(true);
    }

    create() {
        this.marketInterface = new MarketInterface(
            this,
            this.cameras.main.displayWidth / 2,
            this.cameras.main.displayHeight / 2,
            () => {
                this.closeMarket();
            }
        );
        this.events.on('changedata-money', function (scene, money) {
            parent.game.scene.getScene('UiScene').updateMoney();
        });
        this.game.scene.getScene('ControllerScene').events.on('setdata', (parent, key, marketConfig) => {
            if(key == 'marketConfig') {
                this.marketInterface.loadOffers(marketConfig);
            }
        });
        this.game.scene.getScene('ControllerScene').events.on('changedata-marketConfig', (parent, marketConfig, previousMarketConfig) => {
            this.marketInterface.loadOffers(marketConfig);
        });
        this.add.existing(this.marketInterface);
        this.marketInterface.setVisible(false);

        this.inventoryInterface = new InventoryInterface(this, 0, 0);
        this.add.existing(this.inventoryInterface);

        this.joystickBase = this.add.image(0, 0, 'joystickBase');
        this.joystickBase.name = 'joystickBase';
        this.joystickHead = this.add.image(0, 0, 'joystickHead');
        this.joystickHead.name = 'joystickHead';
        this.hideJoystick();

        this.moneyContainer = this.add.container(this.cameras.main.displayWidth - 45, 40);
        this.moneyContainer.name = 'moneyContainer';
        this.moneyImage = this.add.image(0, 0, 'money').setScale(2);
        this.moneyContainer.add(this.moneyImage);
        this.moneyAmountText = this.add.text(
            0,
            0,
            '0',
            {
                fontSize: '26px',
                fontFamily: '"Roboto Condensed"',
                resolution: 3
            }
        ).setOrigin(0.5, 0.5);
        this.moneyContainer.add(this.moneyAmountText);
        let {width, height} = this.moneyContainer.getBounds();
        this.moneyContainer.setSize(width, height).setInteractive();
        this.updateMoney();
    }

    updateMoney(){
        this.moneyAmountText.setText(this.game.scene.getScene('ControllerScene').data.get('money'))
    }

    update(time, delta) {

    }

}
