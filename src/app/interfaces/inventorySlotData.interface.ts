import { ItemType } from "../enums/itemType.enum";

/**
 * A slot in the inventory storing items.
 */
export interface InventorySlotData {
  item: ItemType;
  quantity: number;
}
