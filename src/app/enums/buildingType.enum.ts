import { Market } from "../components/buildings/market";

/**
 * The the list of all the buildings in the game.
 */
export enum BuildingType {
  Market = "MARKET",
}

/**
 * Returns the Building constructor associated to the BuildingType.
 * @param seed - The BuildingType to return the Building constructor associated with
 * @returns {Crop} - The Building constructor associated with the BuildingType
 * (Note : Move to Building class ?)
 */
export const getBuildingConstructorFromBuildingType = (
  buildingType: BuildingType
): typeof Market => {
  switch (buildingType) {
    case BuildingType.Market:
      return Market;
  }
};
