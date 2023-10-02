import { comparePassword, hashPassword } from "../helper/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, password, email, phone, address, answer } = req.body;

    //validations
    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!password) {
      return res.send({ message: "Password is required" });
    }
    if (!email) {
      return res.send({ message: "email is required" });
    }
    if (!phone) {
      return res.send({ message: "Phone is required" });
    }
    if (!address) {
      return res.send({ message: "Address is required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is required" });
    }

    //check user

    const existingUser = await userModel.findOne({ email });
    //if there is existing user

    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please Login ",
      });
    }

    //register user
    const hashedPassword = await hashPassword(password);

    //save user
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register successfully",
      user,
    });
  } catch (error) {
    console.log(`error in registerController ${error}`);
    res.status(500).send({
      success: false,
      message: "error in registration",
      error,
    });
  }
};

//FOR LOGIN CONTROLLER

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.satus(404).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    //check user

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email not registered",
      });
    }

    //match the password
    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    //genrate token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRECT, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login ",
      error,
    });
  }
};

// forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: " New Password is required" });
    }

    //check user

    const user = await userModel.findOne({ email, answer });

    //validation for user

    if (!user) {
      return res.status(500).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    res.status(200).send({
      success: true,
      message: "Password Reset Succefully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("proteected route");
  } catch (error) {
    res.send({ error });
  }
};

//update user profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, address, phone, password } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Password is required & 6 charactor long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    return res.status(400).send({
      success: true,
      error,
      message: "error in update user profile",
    });
  }
};

export const getOrderController = async (req, res) => {
  try {
    const orders = await orderModel

      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

export const getAllOrderController = async (req, res) => {
  try {
    const orders = await orderModel

      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in geting all orders",
    });
  }
};

export const orderStatusController = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderID,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error in update status",
    });
  }
};
