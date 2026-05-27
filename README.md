# 💊 Online Pharmacy Shopping Store

Online pharmacy shopping store is a full-stack online pharmacy shopping application built with **Node.js**, **Express**, and **JavaScript**. It lets customers to browse pharmacy products, add items to a cart, place orders, and view order history — all stored locally using JSON files withoout a database being required.

---

## Features

### 🛍️ Product Catalogue
- Has a browser option for medicines that the customers wants to search
- Displays the stock of the medicines

### 🛒 Shopping Cart
- Add products to cart directly from the product listing
- Adjust item quantities with `+` / `-` buttons or remove items entirely
- It gives real-time conversion of amount in EUR

### 📦 Order Placement
- Checkout form collects customer name, phone number, and delivery address
- Server-side input validation using `express-validator`
- Stock is automatically decremented upon successful order
- Orders get rejected if there is no more stock available for the product

### 📜 Order History
- All past orders are displayed in a table with customer name, date, total, and item count

---

## 📁 Project Structure

  online-pharmacy-shopping/
│
├── node_modules
├── Online pharmacy store.png
├── server.js
├── package.json
├── package-lock.json
│
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
└── data/
    ├── products.json
    └── orders.json

---

## ⚙️ Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

---

## ▶️ Running the App

- Go to the code folder in Terminal using 'cd' 
- Once you're in the folder, write 'npm install'
- Then 'npm start'
- The server will start and you'll see:
Online pharmacy shopping app running on http://localhost:3000
Open your browser and go to **http://localhost:3000**

---

## 🔌 API Endpoints

### Products

`GET` | `/api/products` 
`GET` | `/api/products/:id`
`POST` | `/api/products` 
`PUT` | `/api/products/:id`
`DELETE` | `/api/products/:id`

### Orders

`GET` | `/api/orders` 
`POST` | `/api/orders` 

---

## 🗄️ Data Storage

All data is stored in plain JSON files inside the `data/` directory:

- **`products.json`** 
— the full product catalogue; stock levels update in real time as orders are placed
- **`orders.json`** 
— a log of all orders, newest first

---

