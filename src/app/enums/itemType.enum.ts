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

export const getCropFromSeed = (
  seed: ItemType
):
  | typeof Avocado
  | typeof Grapes
  | typeof Lemon
  | typeof Melon
  | typeof Orange
  | typeof Potato
  | typeof Rose
  | typeof Strawberry
  | typeof Tomato
  | typeof Wheat => {
  switch (seed) {
    case ItemType.AvocadoSeed:
      return Avocado;
    case ItemType.GrapesSeed:
      return Grapes;
    case ItemType.LemonSeed:
      return Lemon;
    case ItemType.MelonSeed:
      return Melon;
    case ItemType.OrangeSeed:
      return Orange;
    case ItemType.PotatoSeed:
      return Potato;
    case ItemType.RoseSeed:
      return Rose;
    case ItemType.StrawberrySeed:
      return Strawberry;
    case ItemType.TomatoSeed:
      return Tomato;
    case ItemType.WheatSeed:
      return Wheat;
  }
  return undefined;
};
