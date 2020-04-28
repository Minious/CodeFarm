import * as Phaser from "phaser";

import { ScenesManager } from "./scenesManager";

export class CodeFarmScene extends Phaser.Scene {
  private _scenesManager: ScenesManager;

  public constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    scenesManager: ScenesManager
  ) {
    super(config);
    this._scenesManager = scenesManager;
  }

  public get scenesManager(): ScenesManager {
    return this._scenesManager;
  }
}
