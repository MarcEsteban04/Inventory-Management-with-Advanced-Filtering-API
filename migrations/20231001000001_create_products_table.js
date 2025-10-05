exports.up = function(knex) {
  return knex.schema.createTable('products', table => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.integer('current_stock').defaultTo(0).notNullable();
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index('name');
    table.index('current_stock');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
