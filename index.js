const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRouters");

app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);
app.use(userRoutes);

app.listen(port, () =>
  console.log(`Server is Running on http://localhost:${port}`)
);
