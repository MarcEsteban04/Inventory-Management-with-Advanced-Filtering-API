const express = require('express');
const db = require('../database');
const router = express.Router();

// GET /api/tags - Read all tags
router.get('/', async (req, res) => {
  try {
    const tags = await db('tags')
      .select('*')
      .orderBy('name');

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
      message: error.message
    });
  }
});

// GET /api/tags/:id - Read a single tag
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await db('tags')
      .where('id', id)
      .first();

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
        message: `Tag with ID ${id} does not exist`
      });
    }

    // Get products associated with this tag
    const products = await db('products')
      .select('products.id', 'products.name', 'products.price', 'products.current_stock')
      .join('product_tags', 'products.id', 'product_tags.product_id')
      .where('product_tags.tag_id', id)
      .orderBy('products.name');

    res.json({
      success: true,
      data: {
        ...tag,
        products
      }
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag',
      message: error.message
    });
  }
});

// POST /api/tags - Create a new tag
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Name is required'
      });
    }

    // Create tag
    const [tag] = await db('tags')
      .insert({
        name: name.trim(),
        description: description?.trim()
      })
      .returning('*');

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Tag already exists',
        message: 'A tag with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create tag',
      message: error.message
    });
  }
});

// PATCH /api/tags/:id - Update a tag
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if tag exists
    const existingTag = await db('tags').where('id', id).first();
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
        message: `Tag with ID ${id} does not exist`
      });
    }

    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    updateData.updated_at = new Date();

    // Update tag
    const [updatedTag] = await db('tags')
      .where('id', id)
      .update(updateData)
      .returning('*');

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: updatedTag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: 'Tag name already exists',
        message: 'A tag with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update tag',
      message: error.message
    });
  }
});

// DELETE /api/tags/:id - Delete a tag
router.delete('/:id', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;

    // Check if tag exists
    const existingTag = await trx('tags').where('id', id).first();
    if (!existingTag) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
        message: `Tag with ID ${id} does not exist`
      });
    }

    // Delete product-tag relationships first
    await trx('product_tags').where('tag_id', id).del();
    
    // Delete the tag
    await trx('tags').where('id', id).del();

    await trx.commit();

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    await trx.rollback();
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tag',
      message: error.message
    });
  }
});

module.exports = router;
