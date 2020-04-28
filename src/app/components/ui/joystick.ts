import * as Phaser from "phaser";

import { Vector2 } from "../../types/vector2.type";
import { Utils } from "../../utils/utils";

/**
 * The Joystick class emulate a virtual joystick. The joystick is composed by a
 * head and a base. It is given a maximum length (distance between head and
 * base). It takes the pointer's screen position as input to update the position
 * the head of the joystick. Then if the base is too far away from the head
 * (head-base distance above the maximum length), the base is moved closer to
 * the head until their distance is equal to the maximum length. The Joystick is
 * a Phaser Container always positionned at the origin and the head and base
 * positionned relatively to the Container. Since its position is (0;0), it
 * simplifies the formulas.
 */
export class Joystick extends Phaser.GameObjects.Container {
  // Maximum length between the base and the head of the joystick
  private maxLengthJoystick: number;
  // The joystick head's position
  private joystickHeadPos: Vector2;
  // The joystick base's position
  private joystickBasePos: Vector2;
  // The joystick's head game object Image
  private joystickHeadImage: Phaser.GameObjects.Image;
  // The joystick's base game object Image
  private joystickBaseImage: Phaser.GameObjects.Image;

  /**
   * Creates the Joystick object.
   * @param {Phaser.Scene} scene - The Phaser Scene this Joystick belongs to
   * (should be UiScene)
   * @param {number} maxLengthJoystick - The maximum distance between the head
   * and the base of the joystick
   */
  public constructor(scene: Phaser.Scene, maxLengthJoystick: number) {
    super(scene, 0, 0);

    this.maxLengthJoystick = maxLengthJoystick;

    this.joystickBaseImage = this.scene.add.image(0, 0, "joystickBase");
    this.joystickBaseImage.name = "joystickBase";
    this.add(this.joystickBaseImage);

    this.joystickHeadImage = this.scene.add.image(0, 0, "joystickHead");
    this.joystickHeadImage.name = "joystickHead";
    this.add(this.joystickHeadImage);

    this.hide();
  }

  /**
   * Updates the position of the head of the joystick by giving the pointer's
   * world position. Moves the base too if it gets too far from the head.
   * @param pointerScreenPos - The position of the pointer in screen coordinates
   */
  public updatePosition(pointerScreenPos: Vector2): void {
    this.joystickHeadPos = pointerScreenPos;

    // Distance between joystick's base and head
    const currentLengthJoystick: number = Utils.distance(
      this.joystickHeadPos,
      this.joystickBasePos
    );

    /**
     * If the head (pointer) is too far from the base of the joystick, then
     * moves the base towards the head until the distance reaches the
     * maxLengthJoystick
     */
    if (currentLengthJoystick > this.maxLengthJoystick) {
      this.joystickBasePos = Utils.add(
        this.joystickHeadPos,
        Utils.scale(
          Utils.subtract(this.joystickBasePos, this.joystickHeadPos),
          this.maxLengthJoystick / currentLengthJoystick
        )
      );
    }

    // Updates the position of the joystick's head and base
    this.joystickBaseImage.setPosition(
      this.joystickBasePos.x,
      this.joystickBasePos.y
    );
    this.joystickHeadImage.setPosition(
      this.joystickHeadPos.x,
      this.joystickHeadPos.y
    );
  }

  /**
   * Returns a Vector2 which goes from the base to the head of the Joystick
   * @returns {Vector2} - The Vector2 going from the base to the head of the
   * Joystick
   */
  public getMove(): Vector2 {
    return Utils.subtract(this.joystickHeadPos, this.joystickBasePos);
  }

  /**
   * Returns the ratio between the current length of the joystick (base to head)
   * to its maximum length. Gives a number between 0 and 1 representing how much
   * the joystick is moved.
   */
  public getRatio(): number {
    const currentLengthJoystick: number = Utils.distance(
      this.joystickHeadPos,
      this.joystickBasePos
    );
    return Utils.clamp(currentLengthJoystick / this.maxLengthJoystick, 0, 1);
  }

  /**
   * Resets base and head's position to the same reset position.
   * @param pointerScreenPos - The reset position
   */
  public resetTo(resetPos: Vector2): void {
    this.joystickHeadPos = resetPos;
    this.joystickBasePos = resetPos;
  }

  /**
   * Hides the Joystick.
   */
  public hide(): void {
    this.joystickBaseImage.visible = false;
    this.joystickHeadImage.visible = false;
  }

  /**
   * Shows the Joystick.
   */
  public show(): void {
    this.joystickBaseImage.visible = true;
    this.joystickHeadImage.visible = true;
  }
}
