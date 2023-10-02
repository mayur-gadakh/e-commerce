import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoutes.js";
import productRoute from "./routes/productRoute.js";
import color from "colors";
import cors from "cors";

//import path from "path";

//configure the env file
dotenv.config();

//database config
connectDB();

//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
//app.use(express.static(path.join(__dirname, "./client/build")));

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/products", productRoute);

//rest api
app.get("/", (req, res) => {
  res.send("<h1>welcome to ecommerce website</h1>");
});

/*app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});*/

//FOR PORT
const PORT = process.env.PORT || 8080;
//the port is comming from env file and 8080 is default port in env file port in not working

//run listen
app.listen(PORT, () => {
  console.log(
    `server running ${process.env.DEV_MODE} on port: ${PORT}`.bgCyan.white
  );
});
