import { WorldScene } from "../../scenes/worldScene";
import { Vector2 } from "../../types/vector2.type";
import { Utils } from "../../utils/utils";

/**
 * The Player Sprite class. Provides methods to move the Player around the game
 * space and sets its animation. There are two different ways of moving the
 * Player : Set a target towards which the Player will move (when performing
 * action) or set a direction (unit vector) representing the direction of the
 * Player's move (move with joystick).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  // Specifies the type of this game object's scene as WorldScene
  public scene: WorldScene;

  // Player's moving speed
  private speed: number = 240;
  // Sets a target towards which the Player is moving
  private target: Vector2;
  // Sets the direction of the Player move
  private moveDirection: Vector2;
  /**
   * A value between 0 and 1 specifying the percentage of the max speed of the
   * Player at which he is moving.
   */
  private speedFactor: number;
  // A callback to call once the Player reaches its target
  private moveEndCallback: () => void;

  /**
   * Creates the Player object.
   * @param {WorldScene} worldScene - The WorldScene this Player belongs to
   * @param {number} x - The x position of the Player in the world
   * @param {number} y - The y position of the Player in the world
   */
  public constructor(worldScene: WorldScene, x: number, y: number) {
    super(worldScene, x, y, undefined, undefined);

    // Adds the Player to the WorldScene and the physics engine
    worldScene.add.existing(this);
    worldScene.physics.add.existing(this);

    // Defines the size of the Player Sprite and physics body
    this.setSize(12, 12);
    this.setOffset(
      this.width / 2 - this.body.width / 2,
      this.height - this.body.height
    );
    this.setScale(2);
    this.setOrigin(0.5, 1);

    /**
     * Defines the player's animations cycle by setting tiles' positions in the
     * tileset
     */
    this.scene.anims.create({
      key: "player_turn",
      frames: [{ key: "player", frame: 9 }],
      frameRate: 20,
    });
    this.scene.anims.create({
      key: "player_left",
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 57,
        end: 60,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "player_right",
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 41,
        end: 44,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "player_up",
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 25,
        end: 28,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "player_down",
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 9,
        end: 12,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  /**
   * This method is called once per game step by the Scene. Handles the realtime
   * updates.
   * @param {number} time - The current time sent by the Scene
   * @param {number} delta - The delta time sent by the Scene
   */
  public update(time: number, delta: number): void {
    if (this.moveDirection) {
      // If the moveDirection is defined, moves the Player in this direction
      const target: Vector2 = Utils.add(
        new Phaser.Math.Vector2(this.x, this.y),
        this.moveDirection
      );
      this.scene.physics.moveToObject(
        this,
        target,
        this.speed * this.speedFactor
      );
    } else if (this.target) {
      /**
       * If the target position is defined, moves the Player towards it until it
       * reaches it. Then calls the callback.
       */
      const distanceThreshold: number = 3;
      if (
        Utils.distance({ x: this.x, y: this.y }, this.target) >
        distanceThreshold
      ) {
        this.scene.physics.moveToObject(this, this.target, this.speed);
      } else {
        if (this.moveEndCallback) {
          this.moveEndCallback();
        }
        this.resetMoveTo();
        this.body.stop();
      }
    } else {
      // Otherwise stops the Player from moving
      this.body.stop();
    }

    // Updates the animation of the Player
    this.updateAnimation();
  }

  /**
   * Sets the Player's move direction
   * @param {Vector2} moveDirection - Direction to move the Player
   * @param {number} speedFactor - Percentage of the Player's max speed to move
   * at (between 0 and 1)
   */
  public setPlayerMoveDirection(
    moveDirection: Vector2,
    speedFactor: number = 1
  ): void {
    this.resetMoveTo();
    this.moveDirection = moveDirection;
    this.speedFactor = speedFactor;
  }

  /**
   * Stops the Player from moving in a direction.
   */
  public resetPlayerMoveDirection(): void {
    this.moveDirection = undefined;
    this.speedFactor = undefined;
  }

  /**
   * Moves the player to the specified target position and call the
   * moveEndCallback if provided.
   * @param target - The target position to move to
   * @param moveEndCallback - The callback to call once the Player has reached
   * the target
   */
  public moveTo(target: Vector2, moveEndCallback?: () => void): void {
    this.resetPlayerMoveDirection();
    this.target = target;
    this.moveEndCallback = moveEndCallback;
  }

  /**
   * Stops the Player from moving to a target position.
   */
  public resetMoveTo(): void {
    this.target = undefined;
    this.moveEndCallback = undefined;
  }

  /**
   * Update the current Player animation based on its body's velocity direction.
   */
  private updateAnimation(): void {
    // Sets the player animation based on its velocity
    if (this.body.velocity.length() > 0) {
      const moveDirection: Vector2 = new Phaser.Math.Vector2(
        this.body.velocity
      ).normalize();

      if (Math.abs(moveDirection.x) > Math.abs(moveDirection.y)) {
        if (moveDirection.x > 0) {
          this.anims.play("player_right", true);
        } else {
          this.anims.play("player_left", true);
        }
      } else {
        if (moveDirection.y > 0) {
          this.anims.play("player_down", true);
        } else {
          this.anims.play("player_up", true);
        }
      }
    } else {
      this.anims.play("player_turn", true);
    }
  }
}
