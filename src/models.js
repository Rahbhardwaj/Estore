import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

// Define Product model
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    category: DataTypes.STRING,
    price: DataTypes.FLOAT,
    stock: DataTypes.INTEGER
}, {
    timestamps: false
});

// Define Order model
const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer: DataTypes.STRING,
    status: DataTypes.STRING,
    total: DataTypes.FLOAT,
    shippingAddress: DataTypes.STRING,
    phoneNumber: DataTypes.STRING
}, {
    timestamps: false
});

export { sequelize, Product, Order };
