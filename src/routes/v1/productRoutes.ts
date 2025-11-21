import { Router } from 'express';
import { productController } from '../../controllers/productController';
import { requireRole } from '../../middleware/tenantIsolation';

const router = Router();

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  OWNER, ADMIN, MANAGER
 */
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  productController.createProduct.bind(productController)
);

/**
 * @route   GET /api/v1/products
 * @desc    Get products list with filters
 * @access  OWNER, ADMIN, MANAGER, EMPLOYEE
 */
router.get(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  productController.getProducts.bind(productController)
);

/**
 * @route   GET /api/v1/products/categories
 * @desc    Get product categories
 * @access  OWNER, ADMIN, MANAGER, EMPLOYEE
 */
router.get(
  '/categories',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  productController.getCategories.bind(productController)
);

/**
 * @route   POST /api/v1/products/categories
 * @desc    Create product category
 * @access  OWNER, ADMIN, MANAGER
 */
router.post(
  '/categories',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  productController.createCategory.bind(productController)
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  OWNER, ADMIN, MANAGER, EMPLOYEE
 */
router.get(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  productController.getProductById.bind(productController)
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  OWNER, ADMIN, MANAGER
 */
router.put(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  productController.updateProduct.bind(productController)
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  OWNER, ADMIN
 */
router.delete(
  '/:id',
  requireRole(['OWNER', 'ADMIN']),
  productController.deleteProduct.bind(productController)
);

/**
 * @route   POST /api/v1/products/:id/stock-adjustment
 * @desc    Adjust product stock
 * @access  OWNER, ADMIN, MANAGER
 */
router.post(
  '/:id/stock-adjustment',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  productController.adjustStock.bind(productController)
);

export default router;
