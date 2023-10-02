import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFilterController,
  productListController,
  productPhotoController,
  relatedProductController,
  searchController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

//route for create product

router.post(
  "/careate-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//forupdate product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get all products

router.get("/get-products", getProductController);

//get single product
router.get("/get-products/:slug", getSingleProductController);

//get photo
router.get("/products-photo/:pid", productPhotoController);

//to delete the product
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFilterController);

//count the product
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search produt
router.get("/search/:keyword", searchController);

//get similar product
router.get("/related-product/:pid/:cid", relatedProductController);

//get category wise product
router.get("/product-category/:slug", productCategoryController);

//payment  token route
router.get("/braintree/token", braintreeTokenController);

//payment route
router.post("/braintree/payment", requireSignIn, braintreePaymentController);

export default router;
