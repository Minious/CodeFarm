import { Avocado } from "../components/crops/avocado";
import { Grapes } from "../components/crops/grapes";
import { Lemon } from "../components/crops/lemon";
import { Melon } from "../components/crops/melon";
import { Orange } from "../components/crops/orange";
import { Potato } from "../components/crops/potato";
import { Rose } from "../components/crops/rose";
import { Strawberry } from "../components/crops/strawberry";
import { Tomato } from "../components/crops/tomato";
import { Wheat } from "../components/crops/wheat";
import { Crop } from "../components/crops/crop";
import { WorldScene } from "../scenes/worldScene";

/**
 * The the list of all the item in the game.
 */
export enum ItemType {
  Avocado = "AVOCADO",
  Grapes = "GRAPES",
  Lemon = "LEMON",
  Melon = "MELON",
  Orange = "ORANGE",
  Potato = "POTATO",
  Rose = "ROSE",
  Strawberry = "STRAWBERRY",
  Tomato = "TOMATO",
  Wheat = "WHEAT",
  AvocadoSeed = "AVOCADO_SEED",
  GrapesSeed = "GRAPES_SEED",
  LemonSeed = "LEMON_SEED",
  MelonSeed = "MELON_SEED",
  OrangeSeed = "ORANGE_SEED",
  PotatoSeed = "POTATO_SEED",
  RoseSeed = "ROSE_SEED",
  StrawberrySeed = "STRAWBERRY_SEED",
  TomatoSeed = "TOMATO_SEED",
  WheatSeed = "WHEAT_SEED",
}

/**
 * Returns an instance of the Crop associated to the crop seed ItemType passed
 * as an argument.
 * @param {WorldScene} worldScene - The WorldScene the returned Crop belongs to
 * @param {number} x - The x position of the Tile of the Crop in the
 * WorldScene's Tilemap
 * @param {number} y - The y position of the Tile of the Crop in the
 * WorldScene's Tilemap
 * @param {ItemType} seed - The seed ItemType associated to the Crop class
 * @returns {Crop} - The Crop instance associated with the seed ItemType
 * (Note : Move to Crop or CropFactory class ?)
 */
export const cropFactory = (
  worldScene: WorldScene,
  x: number,
  y: number,
  seed: ItemType
): Crop => {
  switch (seed) {
    case ItemType.AvocadoSeed:
      return new Avocado(worldScene, x, y);
    case ItemType.GrapesSeed:
      return new Grapes(worldScene, x, y);
    case ItemType.LemonSeed:
      return new Lemon(worldScene, x, y);
    case ItemType.MelonSeed:
      return new Melon(worldScene, x, y);
    case ItemType.OrangeSeed:
      return new Orange(worldScene, x, y);
    case ItemType.PotatoSeed:
      return new Potato(worldScene, x, y);
    case ItemType.RoseSeed:
      return new Rose(worldScene, x, y);
    case ItemType.StrawberrySeed:
      return new Strawberry(worldScene, x, y);
    case ItemType.TomatoSeed:
      return new Tomato(worldScene, x, y);
    case ItemType.WheatSeed:
      return new Wheat(worldScene, x, y);
  }
  return undefined;
};
