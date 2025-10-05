const express = require('express');
const db = require('../database');
const router = express.Router();

// GET /api/products - Read all products with advanced filtering
router.get('/', async (req, res) => {
  try {
    const { tag, min_stock, name } = req.query;
    
    // If filtering by tag, use a different approach
    if (tag) {
      // Get products that have the specific tag
      const productIds = await db('products')
        .select('products.id')
        .join('product_tags', 'products.id', 'product_tags.product_id')
        .join('tags', 'product_tags.tag_id', 'tags.id')
        .where('tags.name', 'ilike', tag)
        .pluck('products.id');

      let query = db('products')
        .select(
          'products.*',
          db.raw('COALESCE(array_agg(DISTINCT tags.name) FILTER (WHERE tags.name IS NOT NULL), ARRAY[]::text[]) as tags')
        )
        .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
        .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
        .whereIn('products.id', productIds)
        .groupBy('products.id');

      // Apply other filters
      if (min_stock) {
        const minStockValue = parseInt(min_stock);
        if (!isNaN(minStockValue)) {
          query = query.where('products.current_stock', '>=', minStockValue);
        }
      }

      if (name) {
        query = query.where('products.name', 'ilike', `%${name}%`);
      }

      const products = await query.orderBy('products.id');
      
      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    }

    // No tag filter - use simpler query
    let query = db('products')
      .select(
        'products.*',
        db.raw('COALESCE(array_agg(DISTINCT tags.name) FILTER (WHERE tags.name IS NOT NULL), ARRAY[]::text[]) as tags')
      )
      .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
      .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
      .groupBy('products.id');

    // Filter by minimum stock
    if (min_stock) {
      const minStockValue = parseInt(min_stock);
      if (!isNaN(minStockValue)) {
        query = query.where('products.current_stock', '>=', minStockValue);
      }
    }

    // Filter by name (case-insensitive partial match)
    if (name) {
      query = query.where('products.name', 'ilike', `%${name}%`);
    }

    const products = await query.orderBy('products.id');
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET /api/products/:id - Read a single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await db('products')
      .select(
        'products.*',
        db.raw('COALESCE(array_agg(DISTINCT tags.name) FILTER (WHERE tags.name IS NOT NULL), ARRAY[]::text[]) as tags')
      )
      .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
      .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
      .where('products.id', id)
      .groupBy('products.id')
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: `Product with ID ${id} does not exist`
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { name, description, price, initial_stock = 0, tags = [] } = req.body;

    // Validation
    if (!name || !price) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Name and price are required fields'
      });
    }

    if (price < 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Price cannot be negative'
      });
    }

    if (initial_stock < 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Initial stock cannot be negative'
      });
    }

    // Create product
    const [product] = await trx('products')
      .insert({
        name,
        description,
        price,
        current_stock: initial_stock
      })
      .returning('*');

    // Handle tags if provided
    if (tags.length > 0) {
      // Get existing tags
      const existingTags = await trx('tags')
        .whereIn('name', tags)
        .select('id', 'name');

      const existingTagNames = existingTags.map(tag => tag.name);
      const newTagNames = tags.filter(tag => !existingTagNames.includes(tag));

      // Create new tags if needed
      let newTags = [];
      if (newTagNames.length > 0) {
        newTags = await trx('tags')
          .insert(newTagNames.map(name => ({ name })))
          .returning('*');
      }

      // Combine existing and new tags
      const allTags = [...existingTags, ...newTags];

      // Create product-tag relationships
      const productTags = allTags.map(tag => ({
        product_id: product.id,
        tag_id: tag.id
      }));

      await trx('product_tags').insert(productTags);
    }

    // Create initial inventory record if stock > 0
    if (initial_stock > 0) {
      await trx('inventory').insert({
        product_id: product.id,
        type: 'in',
        quantity: initial_stock,
        reason: 'Initial stock'
      });
    }

    await trx.commit();

    // Fetch the complete product with tags
    const completeProduct = await db('products')
      .select(
        'products.*',
        db.raw('COALESCE(array_agg(DISTINCT tags.name) FILTER (WHERE tags.name IS NOT NULL), ARRAY[]::text[]) as tags')
      )
      .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
      .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
      .where('products.id', product.id)
      .groupBy('products.id')
      .first();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: completeProduct
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error creating product:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Product already exists',
        message: 'A product with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// PATCH /api/products/:id - Update a product (excluding stock and tags)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    // Check if product exists
    const existingProduct = await db('products').where('id', id).first();
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: `Product with ID ${id} does not exist`
      });
    }

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Price cannot be negative'
      });
    }

    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    updateData.updated_at = new Date();

    // Update product
    await db('products')
      .where('id', id)
      .update(updateData);

    // Fetch updated product with tags
    const updatedProduct = await db('products')
      .select(
        'products.*',
        db.raw('COALESCE(array_agg(DISTINCT tags.name) FILTER (WHERE tags.name IS NOT NULL), ARRAY[]::text[]) as tags')
      )
      .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
      .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
      .where('products.id', id)
      .groupBy('products.id')
      .first();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Delete a product and all associated records
router.delete('/:id', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await trx('products').where('id', id).first();
    if (!existingProduct) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: `Product with ID ${id} does not exist`
      });
    }

    // Delete associated records (foreign key constraints will handle this automatically)
    // But we'll do it explicitly for clarity
    await trx('inventory').where('product_id', id).del();
    await trx('product_tags').where('product_id', id).del();
    await trx('products').where('id', id).del();

    await trx.commit();

    res.json({
      success: true,
      message: 'Product and all associated records deleted successfully'
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

// POST /api/products/:id/stock - Create inventory record and update stock atomically
router.post('/:id/stock', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;

    // Validation
    if (!type || !quantity) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Type and quantity are required fields'
      });
    }

    if (!['in', 'out'].includes(type)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Type must be either "in" or "out"'
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Quantity must be a positive integer'
      });
    }

    // Check if product exists and get current stock
    const product = await trx('products').where('id', id).first();
    if (!product) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: `Product with ID ${id} does not exist`
      });
    }

    // Calculate new stock level
    const currentStock = product.current_stock;
    const newStock = type === 'in' 
      ? currentStock + quantity 
      : currentStock - quantity;

    // Check if stock would go below zero
    if (newStock < 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        message: `Cannot remove ${quantity} items. Current stock: ${currentStock}`
      });
    }

    // Create inventory record
    const [inventoryRecord] = await trx('inventory')
      .insert({
        product_id: id,
        type,
        quantity,
        reason: reason || `Stock ${type === 'in' ? 'addition' : 'removal'}`
      })
      .returning('*');

    // Update product stock atomically
    await trx('products')
      .where('id', id)
      .update({
        current_stock: newStock,
        updated_at: new Date()
      });

    await trx.commit();

    // Fetch updated product
    const updatedProduct = await db('products')
      .select(
        'products.*',
        db.raw('COALESCE(array_agg(DISTINCT tags.name) FILTER (WHERE tags.name IS NOT NULL), ARRAY[]::text[]) as tags')
      )
      .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
      .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
      .where('products.id', id)
      .groupBy('products.id')
      .first();

    res.status(201).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        product: updatedProduct,
        inventory_record: inventoryRecord,
        previous_stock: currentStock,
        new_stock: newStock
      }
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory',
      message: error.message
    });
  }
});

module.exports = router;
