exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('inventory').del();
  
  // Inserts seed entries - initial stock entries
  await knex('inventory').insert([
    // Initial stock for iPhone 15 Pro
    { product_id: 1, type: 'in', quantity: 30, reason: 'Initial stock' },
    { product_id: 1, type: 'out', quantity: 5, reason: 'Sales' },
    
    // Initial stock for Nike Air Max 270
    { product_id: 2, type: 'in', quantity: 60, reason: 'Initial stock' },
    { product_id: 2, type: 'out', quantity: 10, reason: 'Sales' },
    
    // Initial stock for Samsung Galaxy Watch
    { product_id: 3, type: 'in', quantity: 20, reason: 'Initial stock' },
    { product_id: 3, type: 'out', quantity: 5, reason: 'Sales' },
    
    // Initial stock for Adidas Ultraboost 22
    { product_id: 4, type: 'in', quantity: 35, reason: 'Initial stock' },
    { product_id: 4, type: 'out', quantity: 5, reason: 'Sales' },
    
    // Initial stock for MacBook Pro 14"
    { product_id: 5, type: 'in', quantity: 15, reason: 'Initial stock' },
    { product_id: 5, type: 'out', quantity: 5, reason: 'Sales' },
    
    // Initial stock for Levi's 501 Jeans
    { product_id: 6, type: 'in', quantity: 80, reason: 'Initial stock' },
    { product_id: 6, type: 'out', quantity: 5, reason: 'Sales' }
  ]);
};
