import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, Product, Order } from './src/models.js';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve stati// Log all incoming requests with timestamp
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Sync database and initialize data if needed
sequelize.sync().then(async () => {
    // Check if products table is empty, then seed initial products
    const count = await Product.count();
    if (count === 0) {
        await Product.bulkCreate([
            {
                name: "Herb Growing Kit",
                description: "Complete herb growing kit with 6 different herb pods, LED grow light, and automatic watering system. Perfect for your indoor garden.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "herbs",
                price: 49.99,
                stock: 15
            },
            {
                name: "Lotus Candles",
                description: "Smart garden pod with built-in sensors to monitor soil moisture, light, and nutrients. Connects to your smartphone for real-time updates.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "equipment",
                price: 89.99,
                stock: 10
            },
            {
                name: "Vertical Garden System",
                description: "Space-saving vertical garden system with 12 planting slots. Perfect for apartments and small spaces. Includes water reservoir and pump.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "systems",
                price: 129.99,
                stock: 8
            },
            {
                name: "Hydroponic Nutrients Pack",
                description: "Complete nutrient pack for hydroponic growing. Includes macro and micro nutrients for optimal plant growth.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "nutrients",
                price: 34.99,
                stock: 20
            }
        ]);
    }
}).catch((error) => {
    console.error('Error syncing database:', error);
});

// Get all products with pagination
app.get('/api/products', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const products = await Product.findAll({
        limit,
        offset
    });
    res.json(products);
});

// Add a new product with validation
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, image, category, price, stock } = req.body;
        if (!name || !description || !image || !category || !price || !stock) {
            return res.status(400).json({ error: 'Invalid product data' });
        }
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a product by id with validation
app.put('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await Product.findByPk(id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    try {
        const { name, description, image, category, price, stock } = req.body;
        if (!name || !description || !image || !category || !price || !stock) {
            return res.status(400).json({ error: 'Invalid product data' });
        }
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all orders with pagination
app.get('/api/orders', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const orders = await Order.findAll({
        limit,
        offset
    });
    res.json(orders);
});

// Get order by ID with validation
app.get('/api/orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }
    const order = await Order.findByPk(id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Create new order with validation
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, status, total } = req.body;
        if (!customer || !status || !total) {
            return res.status(400).json({ error: 'Invalid order data' });
        }
        const newOrder = await Order.create(req.body);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update order by id with validation
app.put('/api/orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }
    const order = await Order.findByPk(id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    try {
        const { customer, status, total } = req.body;
        if (!customer || !status || !total) {
            return res.status(400).json({ error: 'Invalid order data' });
        }
        await order.update(req.body);
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get stats with caching
const statsCache = {};
app.get('/api/stats', async (req, res) => {
    if (statsCache.timestamp && Date.now() - statsCache.timestamp < 60 * 1000) {
        return res.json(statsCache.data);
    }
    const totalSales = await Order.sum('total');
    const totalOrders = await Order.count();
    const productsCount = await Product.count();
    const inventoryItems = await Product.sum('stock');
    statsCache.timestamp = Date.now();
    statsCache.data = {
        totalSales,
        totalOrders,
        productsCount,
        inventoryItems
    };
    res.json(statsCache.data);
});
app.use(express.static(__dirname));

// Serve static files from 'photo' under the URL path '/PROJECT/photo'
app.use('/PROJECT/photo', express.static(path.join(__dirname, 'photo')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sync database and initialize data if needed
sequelize.sync().then(async () => {
    // Check if products table is empty, then seed initial products
    const count = await Product.count();
    if (count === 0) {
        await Product.bulkCreate([
            {
                name: "Herb Growing Kit",
                description: "Complete herb growing kit with 6 different herb pods, LED grow light, and automatic watering system. Perfect for your indoor garden.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "herbs",
                price: 49.99,
                stock: 15
            },
            {
                name: "Lotus Candles",
                description: "Smart garden pod with built-in sensors to monitor soil moisture, light, and nutrients. Connects to your smartphone for real-time updates.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "equipment",
                price: 89.99,
                stock: 10
            },
            {
                name: "Vertical Garden System",
                description: "Space-saving vertical garden system with 12 planting slots. Perfect for apartments and small spaces. Includes water reservoir and pump.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "systems",
                price: 129.99,
                stock: 8
            },
            {
                name: "Hydroponic Nutrients Pack",
                description: "Complete nutrient pack for hydroponic growing. Includes macro and micro nutrients for optimal plant growth.",
                image: "/PROJECT/photo/DSC01833.JPG",
                category: "nutrients",
                price: 34.99,
                stock: 20
            }
        ]);
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a product by id
app.put('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await Product.findByPk(id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    try {
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a product by id
app.delete('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await Product.findByPk(id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    try {
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await Order.findByPk(id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Create new order
app.post('/api/orders', async (req, res) => {
    const newOrder = req.body;
    if (!newOrder || !newOrder.customer || !newOrder.status || !newOrder.total) {
        return res.status(400).json({ error: 'Invalid order data' });
    }
    try {
        const createdOrder = await Order.create(newOrder);
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update order by id
app.put('/api/orders/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await Order.findByPk(id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    try {
        await order.update(req.body);
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get stats
app.get('/api/stats', async (req, res) => {
    const totalSales = await Order.sum('total');
    const totalOrders = await Order.count();
    const productsCount = await Product.count();
    const inventoryItems = await Product.sum('stock');
    res.json({
        totalSales,
        totalOrders,
        productsCount,
        inventoryItems
    });
});

// Test POST endpoint for debugging
app.post('/api/test', (req, res) => {
    console.log('Received test POST request:', req.body);
    res.json({ message: 'Test POST received', data: req.body });
});

// Fallback route for unknown paths
app.use((req, res) => {
    res.status(404).send('404 Not Found: The requested resource does not exist.');
});

// Start server
app.listen(port, () => {
    console.log(`Backend API server running at http://localhost:${port}`);
});
