const express = require('express');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const productsFile = path.join(dataDir, 'products.json');
const ordersFile = path.join(dataDir, 'orders.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const ensureFile = (file, initial) => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(initial, null, 2));
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

ensureFile(productsFile, [
  {
    id: uuidv4(),
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    price: 4.99,
    stock: 40,
    prescriptionRequired: false,
    description: 'Common pain and fever relief tablets.'
  },
  {
    id: uuidv4(),
    name: 'Amoxicillin 250mg',
    category: 'Antibiotic',
    price: 12.5,
    stock: 20,
    prescriptionRequired: true,
    description: 'Prescription antibiotic for bacterial infections.'
  },
  {
    id: uuidv4(),
    name: 'Vitamin C Tablets',
    category: 'Vitamins',
    price: 7.25,
    stock: 60,
    prescriptionRequired: false,
    description: 'Daily vitamin supplement.'
  }
]);
ensureFile(ordersFile, []);

const productRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('category').trim().notEmpty().withMessage('Category is required.'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0.'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('prescriptionRequired').isBoolean().withMessage('Prescription required must be true or false.')
];

const orderRules = [
  body('customerName').trim().isLength({ min: 2 }).withMessage('Customer name is required.'),
  body('phone').trim().isLength({ min: 6 }).withMessage('Phone number is required.'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address is required.'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item.')
];

const checkErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

const toBool = (v) => v === true || v === 'true';

app.get('/api/products', (req, res) => {
  res.json(readJson(productsFile));
});

app.get('/api/products/:id', (req, res) => {
  const product = readJson(productsFile).find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

app.post('/api/products', productRules, (req, res) => {
  if (checkErrors(req, res)) return;

  const products = readJson(productsFile);
  const product = {
    id: uuidv4(),
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    prescriptionRequired: toBool(req.body.prescriptionRequired),
    description: (req.body.description || '').trim()
  };

  products.push(product);
  writeJson(productsFile, products);
  res.status(201).json(product);
});

app.put('/api/products/:id', productRules, (req, res) => {
  if (checkErrors(req, res)) return;

  const products = readJson(productsFile);
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products[index] = {
    ...products[index],
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    prescriptionRequired: toBool(req.body.prescriptionRequired),
    description: (req.body.description || '').trim()
  };

  writeJson(productsFile, products);
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const products = readJson(productsFile);
  const updated = products.filter(p => p.id !== req.params.id);
  if (updated.length === products.length) return res.status(404).json({ message: 'Product not found' });
  writeJson(productsFile, updated);
  res.status(204).send();
});

app.get('/api/orders', (req, res) => {
  res.json(readJson(ordersFile));
});

app.post('/api/orders', orderRules, (req, res) => {
  if (checkErrors(req, res)) return;

  const products = readJson(productsFile);
  const orders = readJson(ordersFile);

  let total = 0;
  const enrichedItems = [];

  for (const item of req.body.items) {
    const product = products.find(p => p.id === item.productId);
    const qty = Number(item.quantity || 0);

    if (!product) return res.status(400).json({ message: 'Invalid product in order' });
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });
    if (product.stock < qty) return res.status(400).json({ message: `Not enough stock for ${product.name}` });

    product.stock -= qty;
    const lineTotal = product.price * qty;
    total += lineTotal;

    enrichedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      lineTotal
    });
  }

  writeJson(productsFile, products);

  const order = {
    id: uuidv4(),
    customerName: req.body.customerName.trim(),
    phone: req.body.phone.trim(),
    address: req.body.address.trim(),
    items: enrichedItems,
    total,
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  writeJson(ordersFile, orders);
  res.status(201).json(order);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Online pharmacy shopping app running on http://localhost:${PORT}`);
});