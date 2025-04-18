import express from "express";
import upload from "../Middlewares/multer.js";
import { validateToken } from "../Middlewares/validateToken.js";

import {fetchproduct} from "../Controllers/productController.js"

const router = express.Router();

router.get("/fetch", fetchproduct);

// for future no need to make any changes heres
// router.post("/addproduct",addProduct)

//edit product price
// sku
//manyyyyy moreeeee

export default router;