exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  
  // Inserts seed entries
  await knex('products').insert([
    {
      id: 1,
      name: 'iPhone 15 Pro',
      description: 'Latest Apple smartphone with advanced features',
      price: 999.99,
      current_stock: 25
    },
    {
      id: 2,
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes with air cushioning',
      price: 150.00,
      current_stock: 50
    },
    {
      id: 3,
      name: 'Samsung Galaxy Watch',
      description: 'Smart watch with health monitoring features',
      price: 299.99,
      current_stock: 15
    },
    {
      id: 4,
      name: 'Adidas Ultraboost 22',
      description: 'Premium running shoes with boost technology',
      price: 180.00,
      current_stock: 30
    },
    {
      id: 5,
      name: 'MacBook Pro 14"',
      description: 'Professional laptop with M3 chip',
      price: 1999.99,
      current_stock: 10
    },
    {
      id: 6,
      name: 'Levi\'s 501 Jeans',
      description: 'Classic straight-fit denim jeans',
      price: 89.99,
      current_stock: 75
    }
  ]);
};
