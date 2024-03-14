const express = require("express");
const translate = require("./translate");

const PORT = parseInt(process.argv[2]) || 8080;

const app = express();
app.use(express.json());
app.use("/", express.static("./static"));
app.post("/translate", translate);

app.listen(PORT, console.log(`Listening on port ${PORT}`));