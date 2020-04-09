import { MarketOffer } from "./marketOffer.interface";

export interface MarketConfig {
    buyingOffers: Array<MarketOffer>,
    sellingOffers: Array<MarketOffer>
}