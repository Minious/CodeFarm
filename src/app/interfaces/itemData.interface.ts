import { ItemType } from "../enums/itemType.enum";

export interface ItemData {
  texture: string;
  frame: number;
}

export const getItemData = (itemType: ItemType): ItemData => {
  switch (itemType) {
    case ItemType.Avocado:
      return {
        texture: "crops",
        frame: 117,
      };
    case ItemType.Grapes:
      return {
        texture: "crops",
        frame: 75,
      };
    case ItemType.Lemon:
      return {
        texture: "crops",
        frame: 47,
      };
    case ItemType.Melon:
      return {
        texture: "crops",
        frame: 33,
      };
    case ItemType.Orange:
      return {
        texture: "crops",
        frame: 124,
      };
    case ItemType.Potato:
      return {
        texture: "crops",
        frame: 110,
      };
    case ItemType.Rose:
      return {
        texture: "crops",
        frame: 5,
      };
    case ItemType.Strawberry:
      return {
        texture: "crops",
        frame: 96,
      };
    case ItemType.Tomato:
      return {
        texture: "crops",
        frame: 40,
      };
    case ItemType.Wheat:
      return {
        texture: "crops",
        frame: 82,
      };
    case ItemType.AvocadoSeed:
      return {
        texture: "crops",
        frame: 118,
      };
    case ItemType.GrapesSeed:
      return {
        texture: "crops",
        frame: 76,
      };
    case ItemType.LemonSeed:
      return {
        texture: "crops",
        frame: 48,
      };
    case ItemType.MelonSeed:
      return {
        texture: "crops",
        frame: 34,
      };
    case ItemType.OrangeSeed:
      return {
        texture: "crops",
        frame: 125,
      };
    case ItemType.PotatoSeed:
      return {
        texture: "crops",
        frame: 111,
      };
    case ItemType.RoseSeed:
      return {
        texture: "crops",
        frame: 6,
      };
    case ItemType.StrawberrySeed:
      return {
        texture: "crops",
        frame: 97,
      };
    case ItemType.TomatoSeed:
      return {
        texture: "crops",
        frame: 41,
      };
    case ItemType.WheatSeed:
      return {
        texture: "crops",
        frame: 83,
      };
  }
};
