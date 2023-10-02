import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrderController,
  getAllOrderController,
  orderStatusController,
} from "../controllers/authCntroller.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { updateProductController } from "../controllers/productController.js";

//Router Object
const router = express.Router();

//For Register Route
//METHOD || POST REQUEST
router.post("/register", registerController);

//For login Route
//METHOD  || POST REQUEST
router.post("/login", loginController);

//for forgot password
//METHOD || POST Request

router.post("/forgot-password", forgotPasswordController);

//for teest route
//METHOD || GET REQUEST
router.get("/test", requireSignIn, isAdmin, testController);

//for protected route
//for user authetication
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

///protected route for admin authentication
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//rute for update use profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrderController);

//All orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrderController);

//upadate status
router.put(
  "/orders-status/:orderID",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
