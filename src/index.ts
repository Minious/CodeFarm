import { run } from "./app/game";

const modeEmoji: string = process.env.NODE_ENV === "production" ? "⚙" : "🚧";

console.log(
  `${modeEmoji} CodeFarm running in ${process.env.NODE_ENV} mode. ${modeEmoji}`
);

// Creates the Phaser canvas and launch the game
run();
