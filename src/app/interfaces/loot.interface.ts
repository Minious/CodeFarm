import { ItemType } from "../enums/itemType.enum"

export interface Loot {
    item: ItemType,
    quantity: number
}