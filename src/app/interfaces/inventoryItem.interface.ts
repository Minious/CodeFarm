import { ItemType } from "../enums/itemType.enum";

/**
 * An item stored in the inventory.
 * (Note : Should be renamed InventorySlotData and rename the use of the word
 * "item" to "slot" in the doc)
 */
export interface InventoryItem {
  item: ItemType;
  quantity: number;
}
