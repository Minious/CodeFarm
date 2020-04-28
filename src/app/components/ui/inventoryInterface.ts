import * as Phaser from "phaser";
import * as log from "loglevel";

import { InventoryButton } from "./inventoryButton";
import { Inventory } from "../../types/inventory.type";
import { InventoryItem } from "../../interfaces/inventoryItem.interface";
import { UiScene } from "../../scenes/uiScene";

/**
 * The Interface displayed in the UiScene showing the player's Inventory
 * content. It has an Inventory bar which is always visible at the bottom of the
 * screen that displays the first 10 slots of the Inventory. An Inventory Button
 * in the upper left corner of the screen allows the player to show and hide the
 * InventoryGrid that displays the full content of the player's Inventory.
 */
export class InventoryInterface extends Phaser.GameObjects.Container {
  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  // A Phaser Group holding all the inventory bar InventoryButtons
  private inventoryBarButtons: Phaser.GameObjects.Group;
  // A Phaser Group holding all the inventory grid InventoryButtons
  private inventoryGridButtons: Phaser.GameObjects.Group;
  // Is the Inventory grid opens meaning is it visible or not.
  private inventoryGridOpen: boolean;

  /**
   * Creates the InventoryInterface object.
   * @param {UiScene} uiScene - The UiScene this Interface belongs to
   */
  public constructor(uiScene: UiScene) {
    super(uiScene, 0, 0);
    this.name = "inventoryInterface";

    this.inventoryBarButtons = this.scene.add.group();
    this.inventoryGridButtons = this.scene.add.group();

    this.inventoryGridOpen = false;
  }

  /**
   * Clear the all the InventoryButtons from the InventoryInterface's groups
   * (bar and grid) and recreate them.
   * @param {Inventory} inventory - The Inventory content to display
   * (Note : Should add an inventoryRefresh method that isn't destructive)
   */
  public buildInventory(inventory: Inventory): void {
    log.debug("Building Inventory");

    this.clearInventory();
    this.buildInventoryBar(inventory);
    this.buildInventoryGrid(inventory);
    this.inventoryGridButtons.setVisible(this.inventoryGridOpen);

    this.buildInventoryOpenButton();
  }

  /**
   * Creates the InventoryButtons of the inventory bar and enable the player
   * ability to select slots.
   * @param {Inventory} inventory - The Inventory content to display
   */
  private buildInventoryBar(inventory: Inventory): void {
    const marginButtons: number = 8;
    const nbColumns: number = 10;
    const nbRows: number = 1;
    const sizeButton: number =
      (this.scene.cameras.main.displayWidth - marginButtons) / nbColumns -
      marginButtons;

    /**
     * Creates the inventory bar InventoryButtons and set their click callback
     * to trigger the Inventory slot selection.
     */
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
          if (clickedButton.isSelected) {
            this.deselectButtonInventoryBar();
          } else {
            this.selectButtonInventoryBar(columnsIdx);
          }
        };
      }
    );

    /**
     * Add the InventoryButtons to the inventoryBarButtons Group and set the
     * InventoryButton at index selectedItemInventoryIndex as selected if the
     * value exists.
     */
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

    /**
     * Enables the player to change the selected InventoryButton in the
     * inventory bar by scrolling the mouse wheel
     */
    this.scene.input.off("wheel");
    this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer): void => {
      let idxChange: number = Math.sign(pointer.deltaY);
      log.debug("Mouse wheel " + idxChange);
      // Starts at index 0 if no selectedItemInventoryIndex in ControllerScene
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

  /**
   * Resets the isSelected member of the inventory bar's InventoryButton to
   * false and sets the selected InventoryButton's isSelected member to true.
   * Updates the selectedItemInventoryIndex ControllerScene's data value.
   * @param {number} buttonIdx - The index of the InventoryButton selected
   */
  private selectButtonInventoryBar(buttonIdx: number): void {
    this.deselectButtonInventoryBar();
    (this.inventoryBarButtons.getChildren()[
      buttonIdx
    ] as InventoryButton).isSelected = true;
    this.scene.game.scene
      .getScene("ControllerScene")
      .data.set("selectedItemInventoryIndex", buttonIdx);
  }

  /**
   * Resets the isSelected member of the inventory bar's InventoryButton to
   * false. Updates the selectedItemInventoryIndex ControllerScene's data value.
   */
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

  /**
   * Creates the InventoryButtons of the inventory grid with no special
   * behavior.
   * @param {Inventory} inventory - The Inventory content to display
   */
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

    // Creates the inventory grid InventoryButtons.
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

    // Adds the InventoryButtons to the inventoryGridButtons Group.
    inventoryGridButtons.forEach((inventoryButton: InventoryButton): void => {
      this.inventoryGridButtons.add(inventoryButton);
    });
  }

  /**
   * Creates the button which allows to show and hide the inventoryGridButtons.
   */
  private buildInventoryOpenButton(): void {
    const inventoryOpenButton: Phaser.GameObjects.Image = this.scene.add
      .image(60, 45, "inventory_button")
      .setScale(2)
      .setInteractive();
    inventoryOpenButton.name = "inventoryOpenButton";
    inventoryOpenButton.on("pointerup", (): void => {
      this.inventoryGridOpen = !this.inventoryGridOpen;
      this.inventoryGridButtons.setVisible(this.inventoryGridOpen);
    });

    this.add(inventoryOpenButton);
    if (this.scene.scenesManager.controllerScene.debugEnabled) {
      this.scene.input.enableDebug(inventoryOpenButton);
      this.add(inventoryOpenButton.input.hitAreaDebug);
    }
  }

  /**
   * Destroy the inventoryBarButtons and inventoryGridButtons.
   */
  private clearInventory(): void {
    this.removeAll(true);
  }

  /**
   * Creates a grid of InventoryButtons to display all or a part of the
   * Inventory content. Each InventoryButton can be provided a custom click
   * callback. Returns an array containing the InventoryButtons.
   * @param {Inventory} inventory - The Inventory content to display
   * @param {number} nbColumns - The number of columns in the grid
   * @param {number} nbRows - The number of rows in the grid
   * @param {number} x - The x position of the top left corner of the top left
   * InventoryButton in the grid
   * @param {number} y - The y position of the top left corner of the top left
   * InventoryButton in the grid
   * @param {number} sizeButton - The width and height of the InventoryButtons
   * @param {number} marginButtons - The space between each columns and rows
   * @param {number} inventoryOffset - The index of the first slot in the
   * Inventory to display. The slot displayed are consecutive and the number of
   * slots displayed is nbColumns * nbRows.
   * @param {(x: number, y: number) => (clickedButton: InventoryButton) => void} callbackFactory
   * A method which given the x and y coordinates of the InventoryButton in the
   * grid, returns the click callback method of the InventoryButton. Allows the
   * creation of custom callbacks for each InventoryButton.
   */
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
