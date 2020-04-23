import * as Phaser from "phaser";

import { InventoryButton } from "./inventoryButton";
import { Inventory } from "../../types/inventory.type";
import { InventoryItem } from "../../interfaces/inventoryItem.interface";

export class InventoryInterface extends Phaser.GameObjects.Container {
  private inventoryBarButtons: Phaser.GameObjects.Group;
  private inventoryGridButtons: Phaser.GameObjects.Group;
  private inventoryOpen: boolean;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.name = "inventoryInterface";

    this.inventoryBarButtons = this.scene.add.group();
    this.inventoryGridButtons = this.scene.add.group();

    this.inventoryOpen = false;
  }

  public buildInventory(inventory: Inventory): void {
    console.log("Building Inventory");
    this.clearInventory();
    this.buildInventoryBar(inventory);
    this.buildInventoryGrid(inventory);
    this.inventoryGridButtons.setVisible(this.inventoryOpen);

    this.buildInventoryOpenButton();
  }

  private buildInventoryBar(inventory: Inventory): void {
    const marginButtons: number = 8;
    const nbColumns: number = 10;
    const nbRows: number = 1;
    const sizeButton: number =
      (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns -
      marginButtons;

    const inventoryBarButtons: Array<InventoryButton> = this.makeInventoryButtonsGrid(
      inventory,
      nbColumns,
      nbRows,
      marginButtons,
      this.scene.cameras.main.displayHeight - sizeButton - marginButtons,
      sizeButton,
      marginButtons,
      0,
      (columnsIdx: number): ((clickedButton: InventoryButton) => void) => {
        return (clickedButton: InventoryButton): void => {
          const clickedButtonPreviousIsSelectedValue: boolean =
            clickedButton.isSelected;
          if (clickedButtonPreviousIsSelectedValue) {
            this.deselectButtonInventoryBar();
          } else {
            this.selectButtonInventoryBar(columnsIdx);
          }
        };
      }
    );

    inventoryBarButtons.forEach(
      (inventoryButton: InventoryButton, i: number): void => {
        this.inventoryBarButtons.add(inventoryButton);
        if (
          i ===
          this.scene.game.scene
            .getScene("ControllerScene")
            .data.get("selectedItemInventoryIndex")
        ) {
          inventoryButton.isSelected = true;
        }
      }
    );

    this.scene.input.off("wheel");
    this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer): void => {
      let idxChange: number = Math.sign(pointer.deltaY);
      console.log("Mouse wheel " + idxChange);
      if (
        this.scene.game.scene
          .getScene("ControllerScene")
          .data.get("selectedItemInventoryIndex") === undefined
      ) {
        idxChange = 0;
        this.scene.game.scene
          .getScene("ControllerScene")
          .data.set("selectedItemInventoryIndex", 0);
      }
      this.selectButtonInventoryBar(
        (nbColumns +
          this.scene.game.scene
            .getScene("ControllerScene")
            .data.get("selectedItemInventoryIndex") +
          idxChange) %
          nbColumns
      );
    });
  }

  private selectButtonInventoryBar(buttonIdx: number): void {
    this.deselectButtonInventoryBar();
    (this.inventoryBarButtons.getChildren()[
      buttonIdx
    ] as InventoryButton).isSelected = true;
    this.scene.game.scene
      .getScene("ControllerScene")
      .data.set("selectedItemInventoryIndex", buttonIdx);
  }

  private deselectButtonInventoryBar(): void {
    this.inventoryBarButtons
      .getChildren()
      .forEach((inventoryBarButton: InventoryButton): void => {
        inventoryBarButton.isSelected = false;
      });
    this.scene.game.scene
      .getScene("ControllerScene")
      .data.set("selectedItemInventoryIndex", undefined);
  }

  private buildInventoryGrid(inventory: Inventory): void {
    const sizeButton: number = 50;
    const marginButtons: number = 8;
    const marginButtonsInventoryBar: number = 8;
    const nbColumns: number = 10;
    const nbRows: number = 6;
    const widthGrid: number =
      sizeButton * nbColumns + marginButtons * (nbColumns - 1);
    const heightGrid: number =
      sizeButton * nbRows + marginButtons * (nbRows - 1);
    const sizeButtonInventoryBar: number =
      (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns -
      marginButtons;
    const inventoryGridButtons: Array<InventoryButton> = this.makeInventoryButtonsGrid(
      inventory,
      nbColumns,
      nbRows,
      (this.scene.cameras.main.displayWidth - widthGrid) / 2,
      this.scene.cameras.main.displayHeight -
        sizeButtonInventoryBar -
        marginButtonsInventoryBar * 2 -
        heightGrid,
      sizeButton,
      marginButtons,
      10
    );
    inventoryGridButtons.forEach((inventoryButton: InventoryButton): void => {
      this.inventoryGridButtons.add(inventoryButton);
    });
  }

  private buildInventoryOpenButton(): void {
    const inventoryOpenButton: Phaser.GameObjects.Image = this.scene.add
      .image(60, 45, "inventory_button")
      .setScale(2)
      .setInteractive();
    inventoryOpenButton.name = "inventoryOpenButton";
    inventoryOpenButton.on("pointerup", (): void => {
      this.inventoryOpen = !this.inventoryOpen;
      this.inventoryGridButtons.setVisible(this.inventoryOpen);
    });
    this.scene.input.enableDebug(inventoryOpenButton);
    this.add(inventoryOpenButton);
    this.add(inventoryOpenButton.input.hitAreaDebug);
  }

  private clearInventory(): void {
    this.removeAll(true);
  }

  private makeInventoryButtonsGrid(
    inventory: Inventory,
    nbColumns: number,
    nbRows: number,
    x: number,
    y: number,
    sizeButton: number,
    marginButtons: number,
    inventoryOffset: number = 0,
    callbackFactory?: (
      x: number,
      y: number
    ) => (clickedButton: InventoryButton) => void
  ): Array<InventoryButton> {
    const inventoryGridButtons: Array<InventoryButton> = [];
    for (let j: number = 0; j < nbRows; j += 1) {
      for (let i: number = 0; i < nbColumns; i += 1) {
        const itemInventoryIndex: number = inventoryOffset + i + j * nbColumns;
        const inventoryItem: InventoryItem = inventory[itemInventoryIndex];
        const callback: (
          clickedButton: InventoryButton
        ) => void = callbackFactory ? callbackFactory(i, j) : undefined;
        const inventoryButton: InventoryButton = new InventoryButton(
          this.scene,
          x + marginButtons * i + sizeButton * (i + 0.5),
          y + marginButtons * j + sizeButton * (j + 0.5),
          sizeButton,
          sizeButton,
          15,
          inventoryItem,
          itemInventoryIndex,
          callback
        );
        this.add(inventoryButton);
        inventoryGridButtons.push(inventoryButton);
      }
    }
    return inventoryGridButtons;
  }
}
