import * as Phaser from "phaser";

import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Utils } from "../../utils/utils";
import { Vector2 } from "../../types/vector2.type";
import { InventorySlotData } from "../../interfaces/inventorySlotData.interface";
import { UiScene } from "../../scenes/uiScene";

/**
 * A Button displaying the content of an Inventory slot. Contained Item Icon can
 * be dragged and moved from one InventoryButton to another. The Button can be
 * given a click callback. A Button can also be selected.
 */
export class InventoryButton extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  // The background Image of the InventoryButton
  private backgroundImage: Phaser.GameObjects.Image;
  // The Image of the item held by the InventoryButton
  private itemImage: Phaser.GameObjects.Image;
  // The Text displaying the quantity of the item held by the InventoryButton
  private itemCountText: Phaser.GameObjects.Text;
  // Is the InventoryButton selected
  private _isSelected: boolean;
  // Is the pointer hovering the InventoryButton
  private isPointerOver: boolean;
  /**
   * The index of the InventorySlot in the Inventory displayed in the
   * InventoryButton
   */
  private _inventorySlotIdx: number;
  // The inner margin between the border of the InventoryButton and its content
  private marginIcon: number;

  /**
   * Creates the InventoryButton object.
   * @param {UiScene} uiScene - The UiScene this InventoryButton belongs to
   * @param {number} x - The x position of the top left Tile of the Market in
   * the WorldScene's Tilemap
   * @param {number} y - The y position of the top left Tile of the Market in
   * the WorldScene's Tilemap
   * @param {number} displayWidth - The width of the InventoryButton
   * @param {number} displayHeight - The height of the InventoryButton
   * @param {number} marginIcon - The margin between the border of the
   * InventoryButton and the InventorySlot's item Image icon
   * @param {number} inventorySlotIdx - Index of the InventorySlot in the
   * Inventory
   * @param {(_: InventoryButton) => void} externalCallback - Callback to call
   * when InventoryButton clicked
   */
  public constructor(
    uiScene: UiScene,
    x: number,
    y: number,
    displayWidth: number,
    displayHeight: number,
    marginIcon: number,
    inventorySlotIdx: number,
    externalCallback: (_: InventoryButton) => void
  ) {
    super(uiScene, x, y);

    this._inventorySlotIdx = inventorySlotIdx;
    this.marginIcon = marginIcon;

    this.backgroundImage = this.scene.add.image(0, 0, "ui_button");
    this.add(this.backgroundImage);

    /**
     * Phaser container holding the InventorySlot icon Image and its quantity
     * Text.
     */
    const contentContainer: Phaser.GameObjects.Container = this.scene.add.container(
      0,
      0
    );

    // Creates the InventorySlot's item Image icon
    this.itemImage = this.scene.add.image(0, 0, undefined, undefined);
    contentContainer.add(this.itemImage);

    // Creates the InventorySlot's item quantity Text
    const backgroundImageBounds: Phaser.Geom.Rectangle = this.backgroundImage.getBounds();
    this.itemCountText = this.scene.add.text(
      backgroundImageBounds.width / 2,
      backgroundImageBounds.height / 2,
      "",
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
    this.itemCountText.setOrigin(1, 1);
    contentContainer.add(this.itemCountText);

    this.add(contentContainer);

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
        // Puts the InventorySlot above the other ones when dragged.
        this.parentContainer.bringToTop(this);
      }
    );

    this.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
        /**
         * When the InventoryButton is dragged, move it with the pointer.
         * Calculate the position of the content of the InventorySlot relative
         * to its parent container (The InventorySlot itself).
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
         * Swaps the InventorySlot of this InventoryButton and the one of the
         * InventoryButton on which the content of this InventoryButton was
         * dropped.
         */
        this.scene.scenesManager.controllerScene.swapInventorySlots(
          this._inventorySlotIdx,
          target.inventorySlotIdx
        );
      }
    );

    this.scene.scenesManager.controllerScene
      .getInventorySlotUpdate$(this._inventorySlotIdx)
      .subscribe((newInventorySlot: InventorySlotData): void => {
        this.updateContent(newInventorySlot);
      });
  }

  // Getter for _inventorySlotIdx
  public get inventorySlotIdx(): number {
    return this._inventorySlotIdx;
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

  public updateContent(inventorySlotData: InventorySlotData): void {
    if (inventorySlotData) {
      const itemTypeData: ItemData = getItemData(inventorySlotData.item);

      this.itemImage.setTexture(itemTypeData.texture);
      this.itemImage.setFrame(itemTypeData.frame);
      this.itemImage.setDisplaySize(
        this.backgroundImage.displayWidth - this.marginIcon * 2,
        this.backgroundImage.displayHeight - this.marginIcon * 2
      );
      this.itemImage.setVisible(true);

      this.itemCountText.setText(inventorySlotData.quantity.toString());
      this.itemCountText.setVisible(true);
    } else {
      this.itemImage.setTexture(undefined);
      this.itemImage.setFrame(undefined);
      this.itemImage.setVisible(false);

      this.itemCountText.setText(undefined);
      this.itemCountText.setVisible(false);
    }
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
