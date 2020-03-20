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

        this.offers = this.scene.add.container(0, 0);
        this.add(this.offers);

        this.scene.game.scene.getScene('ControllerScene').events.on('changedata-inventory', (parent, newInventory, oldInventory) => {
            this.reloadOffers();
        });
    }

    reloadOffers(){
        if(this.marketConfig){
            this.loadOffers(this.marketConfig);
        }
    }

    loadOffers(marketConfig){
        this.marketConfig = marketConfig;

        this.offers.removeAll(true);
        this.createMarketOffers(marketConfig);
    }

    createMarketOffers(marketConfig){
        let marginColumn = 120;
        let marginOffer = 60;

        let createOffer = (type, offer, idx) => {
            let offerContainer = this.scene.add.container((type == 'buying' ? -1 : 1) * marginColumn, idx * marginOffer - 130);

            let arrowContainer = this.scene.add.container(0, 0);
            let arrow = this.scene.add.image(0, 0, 'arrow').setScale(2).setInteractive();
            if(type == 'buying') {
                arrow.setRotation(Math.PI);
                arrow.setOrigin(0.4, 0.5);
                arrow.setTint(0x66ff66);
            }
            if(type == 'selling') {
                arrow.setFlipY(true);
                arrow.setOrigin(0.6, 0.5);
                arrow.setTint(0xff6666);
            }
            arrow.on('pointerover', () => {
                arrow.setFlipY(!arrow.flipY);
            })
            arrow.on('pointerout', () => {
                arrow.setFlipY(!arrow.flipY);
            });
            arrow.on('pointerdown', () => {
                if(type == 'buying') {
                    if(this.scene.game.scene.getScene('ControllerScene').data.get('money') >= offer.price){
                        this.scene.game.scene.getScene('ControllerScene').modifyInventoryItemQuantity(offer.item, 1);
                        this.scene.game.scene.getScene('ControllerScene').changeMoneyAmount(- offer.price);
                    }
                }
                if(type == 'selling') {
                    if(this.scene.game.scene.getScene('ControllerScene').inventoryContains(offer.item)){
                        this.scene.game.scene.getScene('ControllerScene').modifyInventoryItemQuantity(offer.item, -1);
                        this.scene.game.scene.getScene('ControllerScene').changeMoneyAmount(offer.price);
                    }
                }
            });
            arrowContainer.add(arrow);
            let arrowTextPosX = type == 'buying' ? 5 : -15;
            let arrowTextContent = type == 'buying' ? 'BUY' : 'SELL';
            let arrowText = this.scene.add.text(
                arrowTextPosX,
                0,
                arrowTextContent,
                {
                    fontSize: '16px',
                    fontFamily: '"Roboto Condensed"',
                    resolution: 3
                }
            ).setOrigin(0.5, 0.5);
            arrowContainer.add(arrowText);
            offerContainer.add(arrowContainer);

            let itemContainer = this.scene.add.container(-70, 0);
            let itemTypeData = this.scene.game.scene.getScene('ControllerScene').LIST_ITEM[offer.item];
            let itemIcon = this.scene.add.sprite(0, 0, itemTypeData.texture, itemTypeData.frame).setScale(3);
            itemContainer.add(itemIcon);
            let inventoryItemQuantity = this.scene.game.scene.getScene('ControllerScene').getInventoryItemQuantity(offer.item);
            let itemQuantityText = this.scene.add.text(
                -25,
                0,
                inventoryItemQuantity,
                {
                    fontSize: '16px',
                    fontFamily: '"Roboto Condensed"',
                    resolution: 3,
                }
            ).setOrigin(1, 0.5);
            itemContainer.add(itemQuantityText);
            offerContainer.add(itemContainer);

            let moneyContainer = this.scene.add.container(70, 0);
            let moneyImage = this.scene.add.image(0, 0, 'money').setScale(2);
            moneyContainer.add(moneyImage);
            let moneyAmountText = this.scene.add.text(
                0,
                0,
                offer.price,
                {
                    fontSize: '26px',
                    fontFamily: '"Roboto Condensed"',
                    resolution: 3
                }
            ).setOrigin(0.5, 0.5);
            moneyContainer.add(moneyAmountText);
            offerContainer.add(moneyContainer);

            this.offers.add(offerContainer);
        }
        marketConfig.buyingOffer.forEach((offer, idx) => createOffer('buying', offer, idx));
        marketConfig.sellingOffer.forEach((offer, idx) => createOffer('selling', offer, idx));

    }
}
