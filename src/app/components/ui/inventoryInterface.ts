import * as Phaser from "phaser";

import { InventoryButton } from "./inventoryButton";
import { UiScene } from "../../scenes/uiScene";
import { ControllerScene } from "../../scenes/controllerScene";

/**
 * The Interface UI displayed in the UiScene showing the player's Inventory
 * content. It has an Inventory bar which is always visible at the bottom of the
 * screen that displays the first 10 slots of the Inventory. An Inventory Button
 * in the upper left corner of the screen allows the player to show and hide the
 * InventoryGrid that displays the full content of the player's Inventory.
 */
export class InventoryInterface extends Phaser.GameObjects.Container {
  private static MARGIN_BUTTONS_INVENTORY_BAR: number = 8;
  private static MARGIN_BUTTONS_INVENTORY_GRID: number = 8;
  private static BUTTONS_COUNT_INVENTORY_BAR: number = 10;
  private static BUTTONS_COUNT_INVENTORY_GRID: number =
    ControllerScene.INVENTORY_SIZE -
    InventoryInterface.BUTTONS_COUNT_INVENTORY_BAR;
  private static BUTTONS_MAX_SIZE_INVENTORY_GRID: number = 50;

  // Specifies the type of this game object's scene as UiScene
  public scene: UiScene;

  // A Phaser Group holding all the inventory bar InventoryButtons
  private inventoryBarButtons: Phaser.GameObjects.Group;
  // A Phaser Group holding all the inventory grid InventoryButtons
  private inventoryGridButtons: Phaser.GameObjects.Group;
  // Is the Inventory grid opens meaning is it visible or not.
  private inventoryGridOpen: boolean;
  // TODO
  private sizeButtonsInventoryBar: number;

  /**
   * Creates the InventoryInterface object.
   * @param {UiScene} uiScene - The UiScene this Interface belongs to
   * @param {number} x - The x position of the center of the InventoryInterface
   * @param {number} y - The y position of the center of the InventoryInterface
   * @param {number} displayWidth - The displayWidth of the InventoryInterface
   * @param {number} displayHeight - The displayHeight of the InventoryInterface
   */
  public constructor(
    uiScene: UiScene,
    x: number,
    y: number,
    displayWidth: number,
    displayHeight: number
  ) {
    super(uiScene, x, y);
    this.name = "inventoryInterface";

    this.inventoryBarButtons = this.scene.add.group();
    this.inventoryGridButtons = this.scene.add.group();

    this.inventoryGridOpen = false;

    this.buildInventory(displayWidth, displayHeight);
  }

  /**
   * Create the InventoryButtons of the inventory Bar and the inventory Grid and
   * the Inventory open button.
   * @param {number} displayWidth - The displayWidth of the InventoryInterface
   * @param {number} displayHeight - The displayHeight of the InventoryInterface
   */
  public buildInventory(displayWidth: number, displayHeight: number): void {
    this.buildInventoryBar(displayWidth, displayHeight);
    this.buildInventoryGrid(displayWidth, displayHeight);
    this.inventoryGridButtons.setVisible(this.inventoryGridOpen);

    this.buildInventoryOpenButton(displayWidth, displayHeight);
  }

  /**
   * Creates the InventoryButtons of the inventory bar and enable the player
   * ability to select slots.
   * @param {number} displayWidth - The displayWidth of the InventoryInterface
   * @param {number} displayHeight - The displayHeight of the InventoryInterface
   */
  private buildInventoryBar(displayWidth: number, displayHeight: number): void {
    const nbColumns: number = InventoryInterface.BUTTONS_COUNT_INVENTORY_BAR;
    const nbRows: number = 1;
    this.sizeButtonsInventoryBar =
      (displayWidth - InventoryInterface.MARGIN_BUTTONS_INVENTORY_BAR) /
        nbColumns -
      InventoryInterface.MARGIN_BUTTONS_INVENTORY_BAR;

    /**
     * Creates the inventory bar InventoryButtons and set their click callback
     * to trigger the Inventory slot selection.
     */
    const inventoryBarButtons: Array<InventoryButton> = this.makeInventoryButtonsGrid(
      nbColumns,
      nbRows,
      -displayWidth / 2 + InventoryInterface.MARGIN_BUTTONS_INVENTORY_BAR,
      displayHeight / 2 -
        this.sizeButtonsInventoryBar -
        InventoryInterface.MARGIN_BUTTONS_INVENTORY_BAR,
      this.sizeButtonsInventoryBar,
      InventoryInterface.MARGIN_BUTTONS_INVENTORY_BAR,
      0,
      true
    );

    /**
     * Add the InventoryButtons to the inventoryBarButtons Group and set the
     * InventoryButton at index selectedInventorySlotIndex as selected if the
     * value exists.
     */
    inventoryBarButtons.forEach(
      (inventoryButton: InventoryButton, i: number): void => {
        this.inventoryBarButtons.add(inventoryButton);
        if (this.scene.scenesManager.controllerScene.debugEnabled) {
          this.add(inventoryButton.input.hitAreaDebug);
          this.inventoryBarButtons.add(inventoryButton.input.hitAreaDebug);
        }
      }
    );
  }

  /**
   * Creates the InventoryButtons of the inventory grid with no special
   * behavior.
   * @param {number} displayWidth - The displayWidth of the InventoryInterface
   * @param {number} displayHeight - The displayHeight of the InventoryInterface
   */
  private buildInventoryGrid(
    displayWidth: number,
    displayHeight: number
  ): void {
    const inventoryBarHeight: number =
      this.sizeButtonsInventoryBar +
      2 * InventoryInterface.MARGIN_BUTTONS_INVENTORY_BAR;
    const availableHeightInventoryGrid: number =
      displayHeight - inventoryBarHeight;
    const nbColumns: number = 10;
    const nbRows: number = Math.ceil(
      InventoryInterface.BUTTONS_COUNT_INVENTORY_GRID / nbColumns
    );
    const sizeButton: number = Math.min(
      InventoryInterface.BUTTONS_MAX_SIZE_INVENTORY_GRID,
      (displayWidth - InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID) /
        nbColumns -
        InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID,
      (availableHeightInventoryGrid -
        InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID) /
        nbRows -
        InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID
    );
    const widthInventoryGrid: number =
      (sizeButton + InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID) *
        nbColumns -
      InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID;
    const heightInventoryGrid: number =
      (sizeButton + InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID) * nbRows -
      InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID;
    const inventoryGridX: number = -widthInventoryGrid / 2;
    const inventoryGridY: number =
      displayHeight / 2 - inventoryBarHeight - heightInventoryGrid;

    // Creates the inventory grid InventoryButtons.
    const inventoryGridButtons: Array<InventoryButton> = this.makeInventoryButtonsGrid(
      nbColumns,
      nbRows,
      inventoryGridX,
      inventoryGridY,
      sizeButton,
      InventoryInterface.MARGIN_BUTTONS_INVENTORY_GRID,
      InventoryInterface.BUTTONS_COUNT_INVENTORY_BAR,
      false
    );

    // Adds the InventoryButtons to the inventoryGridButtons Group.
    inventoryGridButtons.forEach((inventoryButton: InventoryButton): void => {
      this.inventoryGridButtons.add(inventoryButton);
      if (this.scene.scenesManager.controllerScene.debugEnabled) {
        this.add(inventoryButton.input.hitAreaDebug);
        this.inventoryGridButtons.add(inventoryButton.input.hitAreaDebug);
      }
    });
  }

  /**
   * Creates the button which allows to show and hide the inventoryGridButtons.
   * @param {number} displayWidth - The displayWidth of the InventoryInterface
   * @param {number} displayHeight - The displayHeight of the InventoryInterface
   */
  private buildInventoryOpenButton(
    displayWidth: number,
    displayHeight: number
  ): void {
    const marginInventoryOpenButton: number = 10;
    const inventoryOpenButton: Phaser.GameObjects.Image = this.scene.add
      .image(0, 0, "inventory_button")
      .setScale(2)
      .setInteractive()
      .setDisplayOrigin(0, 0);
    inventoryOpenButton.setPosition(
      -displayWidth / 2 + marginInventoryOpenButton,
      -displayHeight / 2 + marginInventoryOpenButton
    );
    inventoryOpenButton.name = "inventoryOpenButton";
    inventoryOpenButton.on("pointerup", (): void => {
      this.inventoryGridOpen = !this.inventoryGridOpen;
      this.inventoryGridButtons.setVisible(this.inventoryGridOpen);

      // Pauses the WorldScene to deactivate inputs while the inventory is open.
      if (this.inventoryGridOpen) {
        this.scene.scenesManager.worldScene.scene.pause();
      } else {
        this.scene.scenesManager.worldScene.scene.resume();
      }
    });

    this.add(inventoryOpenButton);
    if (this.scene.scenesManager.controllerScene.debugEnabled) {
      this.scene.input.enableDebug(inventoryOpenButton);
    }
  }

  /**
   * Creates a grid of InventoryButtons to display all or a part of the
   * Inventory content. Each InventoryButton can be provided a custom click
   * callback. Returns an array containing the InventoryButtons.
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
   * @param {boolean} isSelectable - Are the created InventoryButtons selectable
   * @param {(x: number, y: number) => (clickedButton: InventoryButton) => void} callbackFactory
   * A method which given the x and y coordinates of the InventoryButton in the
   * grid, returns the click callback method of the InventoryButton. Allows the
   * creation of custom callbacks for each InventoryButton.
   */
  private makeInventoryButtonsGrid(
    nbColumns: number,
    nbRows: number,
    x: number,
    y: number,
    sizeButton: number,
    marginButtons: number,
    inventoryOffset: number = 0,
    isSelectable: boolean,
    callbackFactory?: (
      x: number,
      y: number
    ) => (clickedButton: InventoryButton) => void
  ): Array<InventoryButton> {
    const inventoryGridButtons: Array<InventoryButton> = [];
    for (let j: number = 0; j < nbRows; j += 1) {
      for (let i: number = 0; i < nbColumns; i += 1) {
        const inventorySlotIdx: number = inventoryOffset + i + j * nbColumns;

        const callback: (
          clickedButton: InventoryButton
        ) => void = callbackFactory ? callbackFactory(i, j) : undefined;

        const inventoryButton: InventoryButton = new InventoryButton(
          this.scene,
          x + marginButtons * i + sizeButton * (i + 0.5),
          y + marginButtons * j + sizeButton * (j + 0.5),
          sizeButton,
          sizeButton,
          4,
          inventorySlotIdx,
          isSelectable,
          callback
        );
        this.add(inventoryButton);
        inventoryGridButtons.push(inventoryButton);
      }
    }
    return inventoryGridButtons;
  }
}
