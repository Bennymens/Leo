/**
 * LEO Jeans Shop - Cart & Search Management
 * Handles state persistence with localStorage
 */

const CartManager = {
    items: [],

    init() {
        this.loadCart();
        this.bindEvents();
        this.updateUI();
    },

    loadCart() {
        const savedCart = localStorage.getItem('leo_cart');
        this.items = savedCart ? JSON.parse(savedCart) : [];
    },

    saveCart() {
        localStorage.setItem('leo_cart', JSON.stringify(this.items));
        this.updateUI();
    },

    addItem(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.showToast(product.name);
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    },

    updateUI() {
        const cartLists = document.querySelectorAll('#cartList');
        const cartBadges = document.querySelectorAll('#cartBadge, #navCartCount');
        const totalElements = document.querySelectorAll('.cart-total-price, #cartTotal');

        let total = 0;
        let count = 0;

        cartLists.forEach(list => {
            list.innerHTML = '';
            if (this.items.length === 0) {
                list.innerHTML = '<li class="list-group-item text-muted">Your cart is empty.</li>';
            } else {
                this.items.forEach(item => {
                    total += item.price * item.quantity;
                    count += item.quantity;

                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between lh-sm align-items-center';
                    li.innerHTML = `
            <div>
              <h6 class="my-0">${item.name}</h6>
              <small class="text-body-secondary">$${item.price} x ${item.quantity}</small>
            </div>
            <div class="d-flex align-items-center">
              <span class="text-body-secondary me-3">$${(item.price * item.quantity).toFixed(2)}</span>
              <button class="btn btn-link btn-sm text-danger p-0 remove-item" data-id="${item.id}" title="Remove Item">
                <svg width="18" height="18"><use xlink:href="#trash"></use></svg>
              </button>
            </div>
          `;
                    list.appendChild(li);
                });
            }
        });

        cartBadges.forEach(badge => {
            badge.textContent = badge.id === 'navCartCount' ? `(${count})` : count;
        });

        totalElements.forEach(el => {
            el.textContent = `$${total.toFixed(2)}`;
        });

        // Update Checkout Page Order Summary if on checkout page
        const checkoutSummary = document.querySelector('.checkout-page .list-group');
        if (checkoutSummary) {
            this.updateCheckoutSummary(checkoutSummary, total);
        }
    },

    updateCheckoutSummary(container, total) {
        container.innerHTML = '';
        this.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between lh-sm';
            li.innerHTML = `
        <div>
          <h6 class="my-0">${item.name}</h6>
          <small class="text-body-secondary">Qty: ${item.quantity}</small>
        </div>
        <span class="text-body-secondary">$${(item.price * item.quantity).toFixed(2)}</span>
      `;
            container.appendChild(li);
        });

        // Add total row
        const totalLi = document.createElement('li');
        totalLi.className = 'list-group-item d-flex justify-content-between border-top py-3';
        totalLi.innerHTML = `
      <span class="text-uppercase fw-bold">Total (USD)</span>
      <strong class="fs-4">$${total.toFixed(2)}</strong>
    `;
        container.appendChild(totalLi);
    },

    showToast(name) {
        const toast = document.getElementById('cartToast');
        if (toast) {
            toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; vertical-align: middle">
        <use xlink:href="#cart"></use></svg>"${name}" added to cart!`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    },

    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-cart');
            if (addBtn) {
                e.preventDefault();
                const product = {
                    id: addBtn.dataset.id,
                    name: addBtn.dataset.name,
                    price: parseFloat(addBtn.dataset.price),
                    image: addBtn.dataset.image
                };
                this.addItem(product);
            }

            // Remove from cart buttons
            const removeBtn = e.target.closest('.remove-item');
            if (removeBtn) {
                e.preventDefault();
                this.removeItem(removeBtn.dataset.id);
            }
        });

        // Search function
        const searchForm = document.querySelector('.search-popup form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchForm.querySelector('input').value.toLowerCase();
                if (query) {
                    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
                }
            });
        }

        // Shop page filtering based on URL
        if (window.location.pathname.includes('shop.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            if (searchQuery) {
                setTimeout(() => this.filterShopBySearch(searchQuery), 500);
            }
        }
    },

    filterShopBySearch(query) {
        // Simple filter for the isotope grid if present
        const $grid = jQuery('.grid').isotope({
            itemSelector: '.product-item',
            layoutMode: 'fitRows'
        });

        $grid.isotope({
            filter: function () {
                const name = jQuery(this).find('.product-name').text().toLowerCase();
                return name.includes(query);
            }
        });

        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const count = jQuery('.product-item:visible').length;
            resultsCount.textContent = `${count} product${count !== 1 ? 's' : ''} found for "${query}"`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => CartManager.init());
