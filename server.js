const express = require("express");
const path = require("path");
const port = process.env.PORT || 8080;
const app = express();

// the __dirname is the current directory from where the script is running
const dist_folder_path = path.resolve(__dirname, "dist");
const index_file_path = path.resolve(dist_folder_path, "index.html");

app.use(express.static(dist_folder_path));

// send the user to index html page inspite of the url
app.get("*", (req, res) => {
  console.log(`Serving ${index_file_path}`);
  res.sendFile(index_file_path);
});

app.listen(port);
