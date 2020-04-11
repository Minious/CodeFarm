import * as Phaser from "phaser";

import { LootConfig } from "../../types/lootConfig.type";
import { Vector2 } from "../../types/vector2.type";

export class Crop extends Phaser.GameObjects.GameObject {
    private _mapPosition: Vector2;
    private layerCrops: Phaser.Tilemaps.DynamicTilemapLayer;
    private growthState: number;
    private growth: number;
    private nbSteps: number;
    private growthRate: number;
    private baseTileIdx: number;
    private _lootConfig: LootConfig;

    get isReadyToHarvest(): boolean {
        return this.growthState == 4;
    }

    get lootConfig(): LootConfig{
        return this._lootConfig;
    }

    get mapPosition(): Vector2{
        return this._mapPosition;
    }

    constructor (scene: Phaser.Scene, x: number, y: number, layerCrops: Phaser.Tilemaps.DynamicTilemapLayer, growthDuration: number, baseTileIdx: number, lootConfig: LootConfig) {
        super(scene, null);

        this._mapPosition = {x, y};
        this.layerCrops = layerCrops;
        this.growthState = 0;
        this.growth = 0;
        this.nbSteps = 5;
        this.growthRate = (this.nbSteps - 1) / growthDuration;
        this.baseTileIdx = baseTileIdx;
        this._lootConfig = lootConfig;

        this.updateTile();
    }

    update(time: number, delta: number) {
        if(this.growthState < 4){
            this.growth += this.growthRate * delta / 1000;
            if(this.growth >= 1){
                this.growth -= 1;
                this.growthState += 1;
                this.updateTile();
            }
        }
    }

    updateTile(){
        this.layerCrops.putTileAt(this.baseTileIdx + this.growthState, this.mapPosition.x, this.mapPosition.y);
    }
}