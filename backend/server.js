import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dbConnect } from "./Config/db.js";
// import userRoute from "./Routes/userRouter.js"
import productRoute from "./Routes/productRoute.js"

import { mail } from "./Controllers/mailController.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// middleware to config routes
app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // Allows reading cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/images", express.static(path.join(__dirname, "public/images")));

// for testing only
app.get("/api/user", (req, res) => {
  res.send("Abhishek");
});

// app.use("/api", userRoute);

app.use("/api/product", productRoute);

// app.use("/api/orders",orderRoute);

app.use("/sendmail", mail);

// if(process.env.NODE_ENV==="production"){
//   app.use(express.static(path.join(__dirname,"../frontend/dist")))

//   app.get("*",(req,res)=>{
//     res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
//   })
// }

app.listen(PORT, () => {
  console.log("Server Listening at the PORT ", PORT);
  dbConnect();
});
