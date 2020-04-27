import { Market } from "../components/buildings/market";
import { Building } from "../components/buildings/building";

/**
 * The the list of all the buildings in the game.
 */
export enum BuildingType {
  Market = "MARKET",
}

/**
 * Returns an instance of Building associated to the BuildingType passed as an
 * argument.
 * @param {Phaser.Scene} scene - The Phaser Scene the returned Building belongs
 * to (should be WorldScene)
 * @param {number} x - The x position of the top left Tile of the Building in
 * the WorldScene's Tilemap
 * @param {number} y - The y position of the top left Tile of the Building in
 * the WorldScene's Tilemap
 * @param {BuildingType} buildingType - The BuildingType associated to the
 * Building class
 * @returns {Building} - The Building instance associated with the BuildingType
 * (Note : Move to Building or BuildingFactory class ?)
 */
export const buildingFactory = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  buildingType: BuildingType
): Building => {
  switch (buildingType) {
    case BuildingType.Market:
      return new Market(scene, x, y);
  }
};
