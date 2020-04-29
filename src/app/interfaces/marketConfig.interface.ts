import { MarketOfferData } from "./marketOfferData.interface";

/**
 * The list of the offers available in the Market.
 */
export interface MarketConfig {
  buyingOffers: Array<MarketOfferData>;
  sellingOffers: Array<MarketOfferData>;
}
