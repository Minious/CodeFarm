import { ItemType } from "../enums/itemType.enum";

/**
 * The loop when harvesting a crop. Defined in eahc Crop's class definition.
 */
export interface Loot {
  item: ItemType;
  quantity: number;
}
