import { ControllerScene } from "./controllerScene";
import { WorldScene } from "./worldScene";
import { UiScene } from "./uiScene";

export class ScenesManager {
  private _controllerScene: ControllerScene;
  private _worldScene: WorldScene;
  private _uiScene: UiScene;

  public get controllerScene(): ControllerScene {
    return this._controllerScene;
  }

  public get worldScene(): WorldScene {
    return this._worldScene;
  }

  public get uiScene(): UiScene {
    return this._uiScene;
  }

  public createControllerScene(): ControllerScene {
    this._controllerScene = new ControllerScene(this);
    return this._controllerScene;
  }

  public createWorldScene(): WorldScene {
    this._worldScene = new WorldScene(this);
    return this._worldScene;
  }

  public createUiScene(): UiScene {
    this._uiScene = new UiScene(this);
    return this._uiScene;
  }
}
