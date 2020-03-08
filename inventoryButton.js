class InventoryButton extends UiButton {
    constructor (scene, x, y, width, height, item, texture, frame) {
        let callback = () => {
            this.scene.game.scene.getScene('ControllerScene').data.set('selectedItem', this.item);
        };

        super(scene, x, y, width, height, callback, texture, frame);

        this.item = item;
    }

    setItem(item){
        this.item = item;
    }
}
