import * as Phaser from "phaser";

import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Utils } from "../../utils/utils";
import { ControllerScene } from "../../scenes/controllerScene";
import { Vector2 } from "../../types/vector2.type";
import { InventoryItem } from "../../interfaces/inventoryItem.interface";

/**
 * A Button displaying the content of an Inventory slot. Contained Item Icon can
 * be dragged and moved from one InventoryButton to another. The Button can be
 * given a click callback. A Button can also be selected.
 */
export class InventoryButton extends Phaser.GameObjects.Container {
  // The background Image of the InventoryButton
  private backgroundImage: Phaser.GameObjects.Image;
  // Is the InventoryButton selected
  private _isSelected: boolean;
  // Is the pointer hovering the InventoryButton
  private isPointerOver: boolean;
  /**
   * The index of the InventoryItem in the Inventory displayed in the
   * InventoryButton
   * (Note : Add setter that updates the InventoryItem icon and text if they
   * exist or create them if they don't. - Cannot do it if Inventory is passed
   * to InventoryInterface for refresh)
   */
  private _itemInventoryIndex: number;

  /**
   * Creates the InventoryButton object.
   * @param {Phaser.Scene} scene - The Phaser Scene this InventoryButton belongs
   * to (should be UiScene)
   * @param {number} x - The x position of the top left Tile of the Market in
   * the WorldScene's Tilemap
   * @param {number} y - The y position of the top left Tile of the Market in
   * the WorldScene's Tilemap
   * @param {number} displayWidth - The width of the InventoryButton
   * @param {number} displayHeight - The height of the InventoryButton
   * @param {number} marginIcon - The margin between the border of the
   * InventoryButton and the InventoryItem Image icon
   * @param {InventoryItem} inventoryItem - The InventoryItem to display in the
   * InventoryButton
   * (Note : Remove it - See above)
   * @param {number} itemInventoryIndex - Index of the InventoryItem in the
   * Inventory
   * @param {(_: InventoryButton) => void} externalCallback - Callback to call
   * when InventoryButton clicked
   */
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    displayWidth: number,
    displayHeight: number,
    marginIcon: number,
    inventoryItem: InventoryItem,
    itemInventoryIndex: number,
    externalCallback: (_: InventoryButton) => void
  ) {
    super(scene, x, y);

    this._itemInventoryIndex = itemInventoryIndex;

    this.backgroundImage = this.scene.add.image(0, 0, "ui_button");
    this.add(this.backgroundImage);

    /**
     * Phaser container holding the InventoryItem icon Image and its quantity
     * Text.
     */
    const contentContainer: Phaser.GameObjects.Container = this.scene.add.container(
      0,
      0
    );

    // If the InventoryButton holds an InventoryItem meaning it is not empty
    if (inventoryItem) {
      const itemTypeData: ItemData = getItemData(inventoryItem.item);

      // Creates the InventoryItem's Image icon
      const backgroundImageBounds: Phaser.Geom.Rectangle = this.backgroundImage.getBounds();
      const itemIcon: Phaser.GameObjects.Sprite = this.scene.add.sprite(
        0,
        0,
        itemTypeData.texture,
        itemTypeData.frame
      );
      itemIcon.setDisplaySize(
        backgroundImageBounds.width - marginIcon,
        backgroundImageBounds.height - marginIcon
      );
      contentContainer.add(itemIcon);

      // Creates the InventoryItem's quantity Text
      const itemCountText: Phaser.GameObjects.Text = this.scene.add.text(
        backgroundImageBounds.width / 2,
        backgroundImageBounds.height / 2,
        inventoryItem.quantity.toString(),
        {
          fontSize: "12px",
          fontFamily: '"Roboto Condensed"',
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          fixedWidth: 15,
          fixedHeight: 15,
          align: "center",
          resolution: 3,
        }
      );
      itemCountText.setOrigin(1, 1);
      contentContainer.add(itemCountText);

      this.add(contentContainer);
    }

    const { width, height }: Phaser.Geom.Rectangle = this.getBounds();
    this.setSize(width, height).setDisplaySize(displayWidth, displayHeight);

    this._isSelected = false;

    // Enables the InventoryButton as a DropZone and make the content draggable
    this.setInteractive(undefined, undefined, true);
    this.scene.input.setDraggable(this);

    // Set up the pointer events callbacks
    if (externalCallback) {
      this.on("pointerdown", (): void => {
        externalCallback(this);
      });
    }

    // Update color of the InventoryButton when the pointer enters or exit it
    this.on("pointerover", (): void => {
      this.isPointerOver = true;
      this.updateColor();
    });

    this.on("pointerout", (): void => {
      this.isPointerOver = false;
      this.updateColor();
    });

    this.on(
      "dragstart",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
        // Puts the InventoryItem above the other ones when dragged.
        this.parentContainer.bringToTop(this);
      }
    );

    this.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
        /**
         * When the InventoryButton is dragged, move it with the pointer.
         * Calculate the position of the content of the InventoryItem relative
         * to its parent container (The InventoryItem itself).
         */
        if (contentContainer) {
          const xPointer: number = Utils.clamp(
            dragX,
            this.displayWidth / 2,
            this.scene.cameras.main.displayWidth - this.displayWidth / 2
          );
          const yPointer: number = Utils.clamp(
            dragY,
            this.displayHeight / 2,
            this.scene.cameras.main.displayHeight - this.displayHeight / 2
          );
          const containerSpacePos: Vector2 = this.pointToContainer({
            x: xPointer,
            y: yPointer,
          }) as Vector2;
          contentContainer.x = containerSpacePos.x;
          contentContainer.y = containerSpacePos.y;
        }
      }
    );

    // When was being dragged and is dropped out of a DropZone.
    this.on(
      "dragend",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
        if (contentContainer) {
          contentContainer.setPosition(0, 0);
        }
      }
    );

    // When was being dragged and is dropped inside of a DropZone.
    this.on(
      "drop",
      (pointer: Phaser.Input.Pointer, target: InventoryButton): void => {
        /**
         * Swaps the InventoryItems of this InventoryButton and the
         * InventoryButton on which the content of this InventoryButton was
         * dropped.
         */
        (this.scene.game.scene.getScene(
          "ControllerScene"
        ) as ControllerScene).swapInventoryItems(
          this._itemInventoryIndex,
          target.itemInventoryIndex
        );
      }
    );
  }

  // Getter for _itemInventoryIndex
  public get itemInventoryIndex(): number {
    return this._itemInventoryIndex;
  }

  // Getter for _isSelected
  public get isSelected(): boolean {
    return this._isSelected;
  }

  // Getter for _isSelected. Update the color of the InventoryButton.
  public set isSelected(_isSelected: boolean) {
    this._isSelected = _isSelected;
    this.updateColor();
  }

  /**
   * Updates the color of the InventoryButton depending on if the
   * InventoryButton is selected and if the pointer is over it.
   */
  private updateColor(): void {
    if (this._isSelected) {
      if (this.isPointerOver) {
        this.backgroundImage.setTint(0x33dd33);
      } else {
        this.backgroundImage.setTint(0xffffbb, 0xffff00, 0xffff00, 0x999900);
      }
    } else {
      if (this.isPointerOver) {
        this.backgroundImage.setTint(0x44ff44);
      } else {
        this.backgroundImage.clearTint();
      }
    }
  }
}
