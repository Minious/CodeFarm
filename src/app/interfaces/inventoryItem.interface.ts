import { ItemType } from "../enums/itemType.enum";

/**
 * An item stored in the inventory.
 */
export interface InventoryItem {
  item: ItemType;
  quantity: number;
}
