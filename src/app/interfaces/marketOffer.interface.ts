import { ItemType } from "../enums/itemType.enum";

/**
 * An offer available in the Market.
 */
export interface MarketOffer {
  item: ItemType;
  price: number;
}
