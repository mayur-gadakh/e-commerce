import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

//for creat new category controller
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({
        message: "Name is required",
      });
    }

    //find existing category
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exist",
      });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "New Category Created",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Category",
      error,
    });
  }
};

//update category controller
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "category updated successfully",
      category,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error while updating category",
      error,
    });
  }
};

//for get all categories
export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Category",
      category,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error while getting all categories",
    });
  }
};

//for get single category

export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "single category get successfully",
      category,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error while geting single category",
    });
  }
};

//for delete the category

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "category deleted succesfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error,
      message: "error while deleting the category",
    });
  }
};
