# Inventory Management with Advanced Filtering API

A robust, production-grade CRUD REST API built with Node.js, Express, Knex.js, and PostgreSQL. This API provides comprehensive inventory management with advanced filtering capabilities, transaction management, and clean layered architecture.

## 🚀 Features

- **Full CRUD Operations** for Products and Tags
- **Advanced Filtering** with tag, min_stock, and name parameters
- **Transaction Management** for inventory adjustments
- **Database Normalization** with proper relationships
- **Many-to-Many** relationship between Products and Tags
- **One-to-Many** relationship between Products and Inventory
- **Atomic Stock Updates** with rollback on failure
- **Case-Insensitive** filtering and search
- **Comprehensive Error Handling**
- **Database Indexes** for performance optimization

## 📋 Database Schema

### Tables
- **products**: Core product information with computed current_stock
- **tags**: Product categorization tags
- **product_tags**: Many-to-many junction table
- **inventory**: Detailed stock movement tracking

### Relationships
- Products ↔ Tags (Many-to-Many via product_tags)
- Products → Inventory (One-to-Many)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Query Builder**: Knex.js
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Inventory-Management-with-Advanced-Filtering-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=inventory_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Create the database:
   ```sql
   CREATE DATABASE inventory_management;
   ```

5. **Run Migrations**
   ```bash
   npm run migrate
   ```

6. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

7. **Start the Server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔗 API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products with filtering |
| GET | `/api/products/:id` | Get single product with tags |
| POST | `/api/products` | Create new product with tags |
| PATCH | `/api/products/:id` | Update product (name, description, price) |
| DELETE | `/api/products/:id` | Delete product and associated records |
| POST | `/api/products/:id/stock` | Update inventory (stock in/out) |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | Get all tags |
| GET | `/api/tags/:id` | Get single tag with associated products |
| POST | `/api/tags` | Create new tag |
| PATCH | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |

### Advanced Filtering (GET /api/products)

Query Parameters:
- `tag=<tag_name>`: Filter by products with specific tag
- `min_stock=<number>`: Filter by minimum stock level
- `name=<search_term>`: Case-insensitive name search

Examples:
```bash
# Get products with "Electronics" tag
GET /api/products?tag=Electronics

# Get products with stock >= 20
GET /api/products?min_stock=20

# Search products by name
GET /api/products?name=iPhone

# Combined filtering
GET /api/products?tag=Electronics&min_stock=10&name=phone
```

## 📝 Request/Response Examples

### Create Product
```bash
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone",
  "price": 999.99,
  "initial_stock": 25,
  "tags": ["Electronics", "Premium"]
}
```

### Update Inventory
```bash
POST /api/products/1/stock
Content-Type: application/json

{
  "type": "in",
  "quantity": 10,
  "reason": "New shipment received"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone",
    "price": "999.99",
    "current_stock": 35,
    "tags": ["Electronics", "Premium"],
    "created_at": "2023-10-01T12:00:00.000Z",
    "updated_at": "2023-10-01T12:00:00.000Z"
  }
}
```

## 🔒 Transaction Management

The API implements atomic transactions for critical operations:

- **Product Creation**: Creates product, assigns tags, and initial inventory in a single transaction
- **Stock Updates**: Updates inventory record and product stock atomically
- **Product Deletion**: Removes all associated records (inventory, tags) in a transaction

If any step fails, the entire operation is rolled back to maintain data consistency.

## 🗄️ Database Commands

```bash
# Run latest migrations
npm run migrate

# Rollback last migration
npm run rollback

# Run seed data
npm run seed
```

## 🧪 Testing

The API can be tested using tools like Postman, Insomnia, or curl. Here are comprehensive testing examples:

### **Quick Browser Tests**

1. **Health Check**
   ```
   GET http://localhost:3000/health
   ```

2. **Get All Products**
   ```
   GET http://localhost:3000/api/products
   ```

3. **Get Single Product**
   ```
   GET http://localhost:3000/api/products/1
   ```

4. **Filter Products by Tag**
   ```
   GET http://localhost:3000/api/products?tag=Electronics
   ```

5. **Filter Products by Minimum Stock**
   ```
   GET http://localhost:3000/api/products?min_stock=30
   ```

6. **Search Products by Name**
   ```
   GET http://localhost:3000/api/products?name=iPhone
   ```

7. **Combined Filtering**
   ```
   GET http://localhost:3000/api/products?tag=Premium&min_stock=15
   ```

8. **Get All Tags**
   ```
   GET http://localhost:3000/api/tags
   ```

9. **Get Single Tag with Products**
   ```
   GET http://localhost:3000/api/tags/1
   ```

### **POST/PATCH/DELETE Testing (use Postman or curl)**

10. **Create New Product**
    ```bash
    POST http://localhost:3000/api/products
    Content-Type: application/json
    
    {
      "name": "Test Product",
      "description": "A test product for demonstration",
      "price": 299.99,
      "initial_stock": 50,
      "tags": ["Electronics", "Sale"]
    }
    ```

11. **Add Stock (Inventory In)**
    ```bash
    POST http://localhost:3000/api/products/1/stock
    Content-Type: application/json
    
    {
      "type": "in",
      "quantity": 25,
      "reason": "New shipment received"
    }
    ```

12. **Remove Stock (Inventory Out)**
    ```bash
    POST http://localhost:3000/api/products/1/stock
    Content-Type: application/json
    
    {
      "type": "out",
      "quantity": 5,
      "reason": "Product sold"
    }
    ```

13. **Update Product**
    ```bash
    PATCH http://localhost:3000/api/products/1
    Content-Type: application/json
    
    {
      "name": "Updated Product Name",
      "price": 349.99
    }
    ```

14. **Create New Tag**
    ```bash
    POST http://localhost:3000/api/tags
    Content-Type: application/json
    
    {
      "name": "Gaming",
      "description": "Gaming-related products"
    }
    ```

15. **Delete Product**
    ```bash
    DELETE http://localhost:3000/api/products/7
    ```

### **Using curl Commands**

```bash
# Health check
curl http://localhost:3000/health

# Get all products
curl http://localhost:3000/api/products

# Get Electronics products
curl "http://localhost:3000/api/products?tag=Electronics"

# Create new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99,"initial_stock":10}'

# Add stock
curl -X POST http://localhost:3000/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"type":"in","quantity":20,"reason":"Restock"}'
```

### **Import Postman Collection**

For comprehensive testing, import the included `postman_collection.json` file into Postman. It contains all endpoints with example requests.

## 🚦 Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate entries)
- `500`: Internal Server Error

## 📊 Performance Optimizations

- Database indexes on frequently queried columns
- Efficient JOIN queries for related data
- Transaction management for data consistency
- Connection pooling via Knex.js

## 🔧 Development

### Project Structure
```
├── migrations/          # Database migrations
├── seeds/              # Seed data
├── routes/             # API route handlers
├── server.js           # Express server setup
├── database.js         # Database connection
├── knexfile.js         # Knex configuration
└── package.json        # Dependencies and scripts
```

### Adding New Features
1. Create migration files for schema changes
2. Update seed data if needed
3. Add/modify route handlers
4. Test endpoints thoroughly