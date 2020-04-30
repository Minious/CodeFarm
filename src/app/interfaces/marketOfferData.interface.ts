import { ItemType } from "../enums/itemType.enum";

/**
 * The data of a MarketOffer available in the Market.
 */
export interface MarketOfferData {
  item: ItemType;
  price: number;
}
