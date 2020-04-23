import * as Phaser from "phaser";

import { getItemData, ItemData } from "../../interfaces/itemData.interface";
import { Utils } from "../../utils/utils";
import { ControllerScene } from "../../scenes/controllerScene";
import { Vector2 } from "../../types/vector2.type";
import { InventoryItem } from "../../interfaces/inventoryItem.interface";

export class InventoryButton extends Phaser.GameObjects.Container {
  private backgroundImage: Phaser.GameObjects.Image;
  private _isSelected: boolean;
  private isMouseOver: boolean;
  private _itemInventoryIndex: number;

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

    const contentContainer: Phaser.GameObjects.Container = this.scene.add.container(
      0,
      0
    );

    if (inventoryItem) {
      const itemTypeData: ItemData = getItemData(inventoryItem.item);

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

    this.setInteractive(undefined, undefined, true);
    this.scene.input.setDraggable(this);

    if (externalCallback) {
      this.on("pointerdown", (): void => {
        externalCallback(this);
      });
    }

    this.on("pointerover", (): void => {
      this.isMouseOver = true;
      this.updateColor();
    });

    this.on("pointerout", (): void => {
      this.isMouseOver = false;
      this.updateColor();
    });

    this.on(
      "dragstart",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
        this.parentContainer.bringToTop(this);
      }
    );

    this.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
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

    this.on(
      "dragend",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void => {
        if (contentContainer) {
          contentContainer.setPosition(0, 0);
        }
      }
    );

    this.on(
      "drop",
      (pointer: Phaser.Input.Pointer, target: InventoryButton): void => {
        (this.scene.game.scene.getScene(
          "ControllerScene"
        ) as ControllerScene).swapInventoryItems(
          this._itemInventoryIndex,
          target.itemInventoryIndex
        );
      }
    );
  }

  public get itemInventoryIndex(): number {
    return this._itemInventoryIndex;
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(_isSelected: boolean) {
    this._isSelected = _isSelected;
    this.updateColor();
  }

  private updateColor(): void {
    if (this._isSelected) {
      if (this.isMouseOver) {
        this.backgroundImage.setTint(0x33dd33);
      } else {
        this.backgroundImage.setTint(0xffffbb, 0xffff00, 0xffff00, 0x999900);
      }
    } else {
      if (this.isMouseOver) {
        this.backgroundImage.setTint(0x44ff44);
      } else {
        this.backgroundImage.clearTint();
      }
    }
  }
}
