import { run } from "./app/game";
import * as log from "loglevel";
import * as prefix from "loglevel-plugin-prefix";

const modeEmoji: string = process.env.NODE_ENV === "production" ? "⚙" : "🚧";

console.log(
  `${modeEmoji} CodeFarm running in ${process.env.NODE_ENV} mode. ${modeEmoji}`
);

/**
 * Set up the logger and its log level depending on the NODE_ENV value
 * (production mode only displays warnings and errors).
 */
prefix.reg(log);
prefix.apply(log);
log.setLevel(
  process.env.NODE_ENV === "production" ? log.levels.WARN : log.levels.TRACE
);

// Creates the Phaser canvas and launch the game
run();
