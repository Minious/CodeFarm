import { ItemType } from "../enums/itemType.enum";

/**
 * Contains all the data about an ItemType.
 */
export interface ItemData {
  texture: string;
  frame: number;
  isSeed: boolean;
}

/**
 * Returns the ItemData for each value in the ItemType enum.
 * @param itemType - The ItemType to return the ItemData associted with
 * @returns {ItemData} - The ItemData asosciated with the ItemData
 */
export const getItemData = (itemType: ItemType): ItemData => {
  switch (itemType) {
    case ItemType.Avocado:
      return {
        texture: "crops",
        frame: 117,
        isSeed: false,
      };
    case ItemType.Grapes:
      return {
        texture: "crops",
        frame: 75,
        isSeed: false,
      };
    case ItemType.Lemon:
      return {
        texture: "crops",
        frame: 47,
        isSeed: false,
      };
    case ItemType.Melon:
      return {
        texture: "crops",
        frame: 33,
        isSeed: false,
      };
    case ItemType.Orange:
      return {
        texture: "crops",
        frame: 124,
        isSeed: false,
      };
    case ItemType.Potato:
      return {
        texture: "crops",
        frame: 110,
        isSeed: false,
      };
    case ItemType.Rose:
      return {
        texture: "crops",
        frame: 5,
        isSeed: false,
      };
    case ItemType.Strawberry:
      return {
        texture: "crops",
        frame: 96,
        isSeed: false,
      };
    case ItemType.Tomato:
      return {
        texture: "crops",
        frame: 40,
        isSeed: false,
      };
    case ItemType.Wheat:
      return {
        texture: "crops",
        frame: 82,
        isSeed: false,
      };
    case ItemType.AvocadoSeed:
      return {
        texture: "crops",
        frame: 118,
        isSeed: true,
      };
    case ItemType.GrapesSeed:
      return {
        texture: "crops",
        frame: 76,
        isSeed: true,
      };
    case ItemType.LemonSeed:
      return {
        texture: "crops",
        frame: 48,
        isSeed: true,
      };
    case ItemType.MelonSeed:
      return {
        texture: "crops",
        frame: 34,
        isSeed: true,
      };
    case ItemType.OrangeSeed:
      return {
        texture: "crops",
        frame: 125,
        isSeed: true,
      };
    case ItemType.PotatoSeed:
      return {
        texture: "crops",
        frame: 111,
        isSeed: true,
      };
    case ItemType.RoseSeed:
      return {
        texture: "crops",
        frame: 6,
        isSeed: true,
      };
    case ItemType.StrawberrySeed:
      return {
        texture: "crops",
        frame: 97,
        isSeed: true,
      };
    case ItemType.TomatoSeed:
      return {
        texture: "crops",
        frame: 41,
        isSeed: true,
      };
    case ItemType.WheatSeed:
      return {
        texture: "crops",
        frame: 83,
        isSeed: true,
      };
  }
};
