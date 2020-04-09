import { Market } from "../market";

export enum BuildingType {
    Market = "MARKET"
}

export function getBuildingConstructor(buildingType: BuildingType) {
    switch (buildingType) {
        case BuildingType.Market:
            return Market;
    }
}
