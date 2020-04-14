import { ItemType } from "../enums/itemType.enum";

export interface InventoryItem {
  item: ItemType;
  quantity: number;
}
