/* eslint-disable @typescript-eslint/no-var-requires */

const express = require("express");
const path = require("path");
const history = require("connect-history-api-fallback");

const app = express();
const innerPath = path.join(__dirname, "../", "dist");
const port = process.env.PORT || 80;

app.use(express.json());
app.use(
  history({
    verbose: true
  })
);
app.use(express.static(innerPath));

app.listen(port);
console.log(process.env.VUE_APP_BASE_URL);
console.log(`server started ${port}`);
