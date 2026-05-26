const productList = document.getElementById('productList');
const productCount = document.getElementById('productCount');

const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');

const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');

const messageBox = document.getElementById('messageBox');

const ordersTable = document.getElementById('ordersTable');

let products = [];
let cart = [];

const money = (value) => `€${Number(value).toFixed(2)}`;

const showMessage = (text, type = 'success') => {
  messageBox.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
};

async function loadProducts() {
  const res = await fetch('/api/products');
  products = await res.json();
  productCount.textContent = products.length;

  productList.innerHTML = products.map(p => `
    <div class="col-md-6">
      <div class="card product-card">
        <div class="card-body">
          <h3 class="h6">${p.name}</h3>
          <p class="mb-1 text-muted">${p.category}</p>
          <p class="mb-2">${p.description || ''}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong>${money(p.price)}</strong>
            <span class="badge text-bg-${p.stock > 0 ? 'success' : 'secondary'} badge-stock">
              Stock: ${p.stock}
            </span>
          </div>
          <p class="small mt-2 mb-2">${p.prescriptionRequired ? 'Prescription required' : 'No prescription required'}</p>
          <button class="btn btn-outline-success w-100" ${p.stock === 0 ? 'disabled' : ''} data-add="${p.id}">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCart() {
  if (!cart.length) {
    cartList.innerHTML = '<div class="text-muted">Cart is empty.</div>';
    cartTotal.textContent = money(0);
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = money(total);

  cartList.innerHTML = cart.map(item => `
    <div class="cart-item d-flex justify-content-between align-items-center">
      <div>
        <div class="fw-semibold">${item.name}</div>
        <div class="small text-muted">${money(item.price)} x ${item.quantity}</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary" data-dec="${item.productId}">-</button>
        <button class="btn btn-sm btn-outline-secondary" data-inc="${item.productId}">+</button>
        <button class="btn btn-sm btn-outline-danger" data-remove="${item.productId}">x</button>
      </div>
    </div>
  `).join('');
}

function renderOrders(orders) {
  ordersTable.innerHTML = orders.map(order => `
    <tr>
      <td>${order.customerName}</td>
      <td>${new Date(order.createdAt).toLocaleString()}</td>
      <td>${money(order.total)}</td>
      <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="text-muted">No orders yet.</td></tr>';
}

productList.addEventListener('click', (e) => {
  const id = e.target.dataset.add;
  if (!id) return;

  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.productId === id);

  if (existing) existing.quantity += 1;
  else cart.push({ productId: id, name: product.name, price: product.price, quantity: 1 });

  renderCart();
});

cartList.addEventListener('click', (e) => {
  const id = e.target.dataset.remove || e.target.dataset.inc || e.target.dataset.dec;
  if (!id) return;

  const item = cart.find(x => x.productId === id);
  if (!item) return;

  if (e.target.dataset.inc) item.quantity += 1;
  if (e.target.dataset.dec) item.quantity -= 1;
  if (e.target.dataset.remove || item.quantity <= 0) cart = cart.filter(x => x.productId !== id);

  renderCart();
});

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cart.length) return showMessage('Cart is empty.', 'danger');

  const payload = {
    customerName: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    items: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
  };

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return showMessage(data.message || data.errors?.[0]?.msg || 'Order failed.', 'danger');
  }

  cart = [];
  checkoutForm.reset();
  showMessage('Order placed successfully!');
  await loadProducts();
  await loadOrders();
  renderCart();
});

async function loadOrders() {
  const res = await fetch('/api/orders');
  const orders = await res.json();
  renderOrders(orders);
}

checkoutBtn.addEventListener('click', () => {
  document.getElementById('customerName').focus();
});

(async function init() {
  await loadProducts();
  await loadOrders();
  renderCart();
})();