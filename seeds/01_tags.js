exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('tags').del();
  
  // Inserts seed entries
  await knex('tags').insert([
    {
      id: 1,
      name: 'Electronics',
      description: 'Electronic devices and components'
    },
    {
      id: 2,
      name: 'Footwear',
      description: 'Shoes, boots, and other footwear'
    },
    {
      id: 3,
      name: 'Sale',
      description: 'Items currently on sale'
    },
    {
      id: 4,
      name: 'Premium',
      description: 'High-end premium products'
    },
    {
      id: 5,
      name: 'Clothing',
      description: 'Apparel and clothing items'
    }
  ]);
};
