import { Avocado } from "../crops/avocado";
import { Grapes } from "../crops/grapes";
import { Lemon } from "../crops/lemon";
import { Melon } from "../crops/melon";
import { Orange } from "../crops/orange";
import { Potato } from "../crops/potato";
import { Rose } from "../crops/rose";
import { Strawberry } from "../crops/strawberry";
import { Tomato } from "../crops/tomato";
import { Wheat } from "../crops/wheat";

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
    WheatSeed = "WHEAT_SEED"
}

export function getCropFromSeed(seed: ItemType){
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
}