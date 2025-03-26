let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', function() {
  updateCart();
  initializeEventListeners();
});

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  cartItems.innerHTML = '';
  let total = 0;
  let itemCount = 0;
  
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    itemCount += item.quantity;
    cartItems.innerHTML += `<tr>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="decrementItem(${index})">-</button>
        ${item.quantity}
        <button class="btn btn-sm btn-secondary" onclick="incrementItem(${index})">+</button>
      </td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="removeItem(${index})">&times;</button></td>
    </tr>`;
  });
  
  cartCount.textContent = itemCount;
  cartTotal.textContent = total.toFixed(2);
  
  localStorage.setItem('cart', JSON.stringify(cart));
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function incrementItem(index) {
  cart[index].quantity++;
  updateCart();
}

function decrementItem(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    removeItem(index);
  }
  updateCart();
}

function initializeEventListeners() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const existing = cart.find(item => item.name === name);
      
      if (existing) { 
        existing.quantity++; 
      } else { 
        cart.push({ name, price, quantity: 1 }); 
      }
      
      const toast = document.createElement('div');
      toast.className = 'position-fixed bottom-0 end-0 p-3';
      toast.style.zIndex = '5';
      toast.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header">
            <strong class="me-auto">Duckify</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
          </div>
          <div class="toast-body">
            "${name}" agregado al carrito
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      updateCart();
    });
  });
  
  document.querySelector('.modal-footer .btn-primary').addEventListener('click', function() {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    alert('¡Gracias por tu compra! Total: $' + document.getElementById('cartTotal').textContent);
    cart = [];
    updateCart();
    document.querySelector('.btn-close').click();
  });
}

window.removeItem = removeItem;
window.incrementItem = incrementItem;
window.decrementItem = decrementItem;
