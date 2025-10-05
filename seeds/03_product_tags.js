exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('product_tags').del();
  
  // Inserts seed entries
  await knex('product_tags').insert([
    // iPhone 15 Pro - Electronics, Premium
    { product_id: 1, tag_id: 1 },
    { product_id: 1, tag_id: 4 },
    
    // Nike Air Max 270 - Footwear, Sale
    { product_id: 2, tag_id: 2 },
    { product_id: 2, tag_id: 3 },
    
    // Samsung Galaxy Watch - Electronics, Premium
    { product_id: 3, tag_id: 1 },
    { product_id: 3, tag_id: 4 },
    
    // Adidas Ultraboost 22 - Footwear, Premium
    { product_id: 4, tag_id: 2 },
    { product_id: 4, tag_id: 4 },
    
    // MacBook Pro 14" - Electronics, Premium
    { product_id: 5, tag_id: 1 },
    { product_id: 5, tag_id: 4 },
    
    // Levi's 501 Jeans - Clothing, Sale
    { product_id: 6, tag_id: 5 },
    { product_id: 6, tag_id: 3 }
  ]);
};
