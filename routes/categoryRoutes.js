import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

//routes

//route for creating new category
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//route for updating category
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//route for get All categories

router.get("/get-category", categoryController);

//route for get single category
router.get("/single-category/:slug", singleCategoryController);

//for delete the category
router.delete(
  "/delet-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
