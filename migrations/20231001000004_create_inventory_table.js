exports.up = function(knex) {
  return knex.schema.createTable('inventory', table => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.enum('type', ['in', 'out']).notNullable();
    table.integer('quantity').notNullable();
    table.text('reason');
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    
    // Indexes for performance
    table.index('product_id');
    table.index('type');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory');
};
