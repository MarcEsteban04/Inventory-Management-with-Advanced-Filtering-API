# 🧪 API Testing Examples

## Base URL
```
http://localhost:3000
```

## 🔍 **Products Endpoints**

### 1. Get All Products
```
GET http://localhost:3000/api/products
```

### 2. Get Single Product
```
GET http://localhost:3000/api/products/1
GET http://localhost:3000/api/products/2
GET http://localhost:3000/api/products/3
```

### 3. Advanced Filtering Examples

#### Filter by Tag
```
GET http://localhost:3000/api/products?tag=Electronics
GET http://localhost:3000/api/products?tag=Footwear
GET http://localhost:3000/api/products?tag=Premium
GET http://localhost:3000/api/products?tag=Sale
```

#### Filter by Minimum Stock
```
GET http://localhost:3000/api/products?min_stock=20
GET http://localhost:3000/api/products?min_stock=50
GET http://localhost:3000/api/products?min_stock=10
```

#### Search by Name (Case-insensitive)
```
GET http://localhost:3000/api/products?name=iPhone
GET http://localhost:3000/api/products?name=nike
GET http://localhost:3000/api/products?name=mac
GET http://localhost:3000/api/products?name=jean
```

#### Combined Filters
```
GET http://localhost:3000/api/products?tag=Electronics&min_stock=10
GET http://localhost:3000/api/products?tag=Footwear&name=nike
GET http://localhost:3000/api/products?min_stock=30&name=iPhone
GET http://localhost:3000/api/products?tag=Premium&min_stock=15&name=phone
```

### 4. Create New Product (POST)
**Endpoint:** `POST http://localhost:3000/api/products`
**Content-Type:** `application/json`

```json
{
  "name": "Test Product",
  "description": "A test product for demonstration",
  "price": 299.99,
  "initial_stock": 100,
  "tags": ["Electronics", "Sale"]
}
```

```json
{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "initial_stock": 15,
  "tags": ["Electronics", "Premium"]
}
```

### 5. Update Product (PATCH)
**Endpoint:** `PATCH http://localhost:3000/api/products/1`
**Content-Type:** `application/json`

```json
{
  "name": "Updated iPhone 15 Pro Max",
  "description": "Updated description for iPhone",
  "price": 1099.99
}
```

### 6. Delete Product (DELETE)
```
DELETE http://localhost:3000/api/products/7
```

### 7. Inventory Management (Stock In/Out)

#### Add Stock (Stock In)
**Endpoint:** `POST http://localhost:3000/api/products/1/stock`
**Content-Type:** `application/json`

```json
{
  "type": "in",
  "quantity": 50,
  "reason": "New shipment received"
}
```

```json
{
  "type": "in",
  "quantity": 25,
  "reason": "Restocking popular item"
}
```

#### Remove Stock (Stock Out)
**Endpoint:** `POST http://localhost:3000/api/products/2/stock`
**Content-Type:** `application/json`

```json
{
  "type": "out",
  "quantity": 5,
  "reason": "Product sold"
}
```

```json
{
  "type": "out",
  "quantity": 10,
  "reason": "Damaged items removed"
}
```

## 🏷️ **Tags Endpoints**

### 1. Get All Tags
```
GET http://localhost:3000/api/tags
```

### 2. Get Single Tag (with associated products)
```
GET http://localhost:3000/api/tags/1
GET http://localhost:3000/api/tags/2
GET http://localhost:3000/api/tags/3
```

### 3. Create New Tag (POST)
**Endpoint:** `POST http://localhost:3000/api/tags`
**Content-Type:** `application/json`

```json
{
  "name": "Gaming",
  "description": "Gaming-related products"
}
```

```json
{
  "name": "Accessories",
  "description": "Product accessories and add-ons"
}
```

### 4. Update Tag (PATCH)
**Endpoint:** `PATCH http://localhost:3000/api/tags/1`
**Content-Type:** `application/json`

```json
{
  "name": "Consumer Electronics",
  "description": "Updated description for electronics"
}
```

### 5. Delete Tag (DELETE)
```
DELETE http://localhost:3000/api/tags/6
```

## 🏥 **Health Check**
```
GET http://localhost:3000/health
```

## 🧪 **Test Scenarios**

### Scenario 1: Complete Product Lifecycle
1. Create a new product with tags
2. Get the product details
3. Add stock to the product
4. Update product information
5. Remove some stock
6. Get updated product details

### Scenario 2: Advanced Filtering Tests
1. Get all Electronics products
2. Get products with stock >= 30
3. Search for products containing "phone"
4. Combine filters: Electronics + min_stock=10

### Scenario 3: Error Testing
1. Try to get non-existent product: `GET /api/products/999`
2. Try to remove more stock than available
3. Try to create product with invalid data
4. Try to update non-existent product

### Scenario 4: Tag Management
1. Create a new tag
2. Assign it to products
3. Filter products by the new tag
4. Update tag information
5. Delete the tag

## 📋 **Expected Response Formats**

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🚀 **Quick Test Commands (using curl)**

```bash
# Health check
curl http://localhost:3000/health

# Get all products
curl http://localhost:3000/api/products

# Get products with Electronics tag
curl "http://localhost:3000/api/products?tag=Electronics"

# Get single product
curl http://localhost:3000/api/products/1

# Create new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99,"initial_stock":10}'

# Add stock
curl -X POST http://localhost:3000/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"type":"in","quantity":20,"reason":"Restock"}'
```

## 📝 **Notes**
- Make sure your server is running: `npm run dev`
- All endpoints return JSON responses
- Use proper Content-Type headers for POST/PATCH requests
- Check the console for detailed error logs if something fails
