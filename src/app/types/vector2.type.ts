import * as Phaser from "phaser";

/**
 * Used to store both {x, y} and Phaser.Math.Vector2.
 * (Note : Check if really necessary)
 */
export type Vector2 = { x: number; y: number } | Phaser.Math.Vector2;
