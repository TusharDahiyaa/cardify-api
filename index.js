const express = require("express");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const userRoute = require("./routes/user");
const cardRoute = require("./routes/card");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/card", cardRoute);
app.use("/api/user", userRoute);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
