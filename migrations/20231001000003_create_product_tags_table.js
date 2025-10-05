exports.up = function(knex) {
  return knex.schema.createTable('product_tags', table => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('tag_id').unsigned().notNullable();
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.foreign('tag_id').references('id').inTable('tags').onDelete('CASCADE');
    
    // Unique constraint to prevent duplicate product-tag relationships
    table.unique(['product_id', 'tag_id']);
    
    // Indexes for performance
    table.index('product_id');
    table.index('tag_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('product_tags');
};
