import { ItemType } from "../enums/itemType.enum";

/**
 * An item stored in the inventory.
 */
export interface InventorySlotData {
  item: ItemType;
  quantity: number;
}
