exports.up = function(knex) {
  return knex.schema.createTable('tags', table => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.text('description');
    table.timestamps(true, true);
    
    // Index for performance
    table.index('name');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tags');
};
