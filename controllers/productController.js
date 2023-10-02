import fs from "fs";
import productModel from "../models/productModel.js";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv";

dotenv.config();

//payment gatway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res.status(500).send({ error: "name is required" });
      case !description:
        return res.status(500).send({ error: "description is required" });
      case !price:
        return res.status(500).send({ error: "price is required" });
      case !category:
        return res.status(500).send({ error: "category is required" });
      case !quantity:
        return res.status(500).send({ error: "quantity is required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is required and should be less than 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(202).send({
      success: true,
      message: "product created successfully",
      products,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "error in create category",
        error,
      });
  }
};

export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "product geted successfully",
      products,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error while getting products",
    });
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "single product get successfully",
      product,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "erroe in getting single product",
    });
  }
};

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error while geting photo",
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "product delete successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error while deleting product",
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res.status(500).send({ error: "name is required" });
      case !description:
        return res.status(500).send({ error: "description is required" });
      case !price:
        return res.status(500).send({ error: "price is required" });
      case !category:
        return res.status(500).send({ error: "category is required" });
      case !quantity:
        return res.status(500).send({ error: "quantity is required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is required and should be less than 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(202).send({
      success: true,
      message: "product updated successfully",
      products,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "error in update product",
        error,
      });
  }
};

//filter products
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};

    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in filter product",
    });
  }
};

//find count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in count product",
    });
  }
};

//fing product per page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in count per page",
    });
  }
};

//for search controller
export const searchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in search controller",
    });
  }
};

//similar product
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error into similar product ",
    });
  }
};

//get category wise cproduct
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in podcuct category",
    });
  }
};

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in geting braintree token",
    });
  }
};

export const braintreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
