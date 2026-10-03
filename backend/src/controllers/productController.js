const productService = require('../services/productService');

const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page,
      limit
    } = req.query;

    const result = await productService.getProducts({
      search: search || q || '',
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product details fetched successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

const getFilterOptions = async (req, res, next) => {
  try {
    const options = await productService.getFilterOptions();
    return res.status(200).json({
      success: true,
      message: 'Filter options fetched successfully',
      data: options
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFilterOptions
};
