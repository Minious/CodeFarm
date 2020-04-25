import { MarketOffer } from "./marketOffer.interface";

/**
 * The list of the offers available in the Market.
 */
export interface MarketConfig {
  buyingOffers: Array<MarketOffer>;
  sellingOffers: Array<MarketOffer>;
}
