import { Market } from "../components/buildings/market";

export enum BuildingType {
  Market = "MARKET",
}

export const getBuildingConstructor = (
  buildingType: BuildingType
): typeof Market => {
  switch (buildingType) {
    case BuildingType.Market:
      return Market;
  }
};
