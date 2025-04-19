    // Variables to hold product data and cart
    let products = []; // Array to store product information
    let currentProductIndex = 0; // Index of the currently displayed product
    let cart = []; // Array to store items in the cart
    let loggedInUser = null; // Store logged in user name
    let isLoginMode = true; // Track whether in login or sign-up mode

    // DOM elements for authentication overlay and form
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const formTitle = document.getElementById('formTitle');
    const submitButton = document.getElementById('submitButton');
    const toggleText = document.getElementById('toggleText');
    const toggleLink = document.getElementById('toggleLink');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');

    // Fetch products from backend API
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/products'); // Fetch products from API
            products = await response.json(); // Parse JSON response
            updateProductDisplay(currentProductIndex); // Update displayed product
            updateCartCount(); // Update cart item count
            updateCartDisplay(); // Update cart display
        } catch (error) {
            console.error('Error fetching products:', error); // Log any errors
        }
    }

    // Function to update product display
    function updateProductDisplay(index) {
        const product = products[index]; // Get the current product based on index
        
        // Update showcase section
        document.getElementById('showcaseTitle').textContent = product.name; // Set product name
        document.getElementById('showcaseImage').src = product.image; // Set product image
        
        // Update content section
        document.getElementById('productTitle').textContent = product.name; // Set product title
        document.getElementById('productDescription').textContent = product.description; // Set product description
        document.getElementById('productPrice').textContent = `₹${product.price.toFixed(2)}`; // Set product price
        document.getElementById('productStock').textContent = `${product.stock} units available`; // Set product stock
        
        // Update navigation dots
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index); // Highlight active dot
        });

        // Update buy button state based on stock
        const productDetails = document.querySelector('.product-details');
        const buyButton = productDetails.querySelector('.btn-primary');
        const addToCartButton = productDetails.querySelector('.btn-secondary');
        
        if (product.stock === 0) { // If product is out of stock
            buyButton.disabled = true; // Disable buy button
            addToCartButton.disabled = true; // Disable add to cart button
            buyButton.textContent = 'Out of Stock'; // Update button text
            addToCartButton.textContent = 'Out of Stock'; // Update button text
        } else { // If product is in stock
            buyButton.disabled = false; // Enable buy button
            addToCartButton.disabled = false; // Enable add to cart button
            buyButton.textContent = 'Buy Now'; // Update button text
            addToCartButton.textContent = 'Add to Cart'; // Update button text
        }
    }

    // Buy product function
    function buyProduct() {
        const product = products[currentProductIndex]; // Get the current product
        if (product.stock > 0) { // If product is in stock
            cart.push({ // Add product to cart
                ...product,
                cartId: Date.now() // Unique ID for cart item
            });
            product.stock -= 1; // Decrease stock
            updateCartDisplay(); // Update cart display
            updateCartCount(); // Update cart count
            updateProductDisplay(currentProductIndex); // Update product display
            checkout(); // Go to checkout option
        }
    }

    // Add to cart function
    function addToCart() {
        const product = products[currentProductIndex]; // Get the current product
        if (product.stock > 0) { // If product is in stock
            cart.push({ // Add product to cart
                ...product,
                cartId: Date.now() // Unique ID for cart item
            });
            product.stock -= 1; // Decrease stock
            updateCartDisplay(); // Update cart display
            updateCartCount(); // Update cart count
            updateProductDisplay(currentProductIndex); // Update product display
            
            // Show feedback
            const feedback = document.createElement('div');
            feedback.className = 'add-to-cart-feedback';
            feedback.textContent = 'Added to cart!'; // Feedback message
            document.body.appendChild(feedback); // Append feedback to body
            
            setTimeout(() => {
                feedback.remove(); // Remove feedback after 2 seconds
            }, 2000);
        }
    }

    // Update cart count
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        cartCount.textContent = cart.length; // Update cart count display
    }

    // Toggle cart sidebar
    function toggleCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');
        cartSidebar.classList.toggle('open'); // Toggle cart sidebar visibility
        overlay.classList.toggle('active'); // Toggle overlay visibility
    }

    // Update cart display
    function updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        let total = 0; // Initialize total price

        cartItems.innerHTML = ''; // Clear current cart items
        
        if (cart.length === 0) { // If cart is empty
            emptyCartMessage.style.display = 'block'; // Show empty cart message
            document.querySelector('.checkout-btn').disabled = true; // Disable checkout button
        } else { // If cart has items
            emptyCartMessage.style.display = 'none'; // Hide empty cart message
            document.querySelector('.checkout-btn').disabled = false; // Enable checkout button
            
            cart.forEach((item) => { // Loop through cart items
                total += item.price; // Calculate total price
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}"> <!-- Product image -->
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div> <!-- Product title -->
                        <div class="cart-item-price">₹${item.price.toFixed(2)}</div> <!-- Product price -->
                    </div>
                    <div class="remove-item" onclick="removeFromCart('${item.cartId}')">×</div> <!-- Remove item button -->
                `;
                
                cartItems.appendChild(cartItem); // Append cart item to cart display
            });

            // Display order summary
            const orderSummary = document.createElement('div');
            orderSummary.className = 'order-summary';
            orderSummary.innerHTML = `
                <h3>Order Summary</h3>
                <ul>
                ${cart.map(item => `<li>${item.name}: ₹${item.price.toFixed(2)}</li>`).join('')} <!-- List of items in cart -->
                </ul>
                <div class="order-total">Total: ₹${total.toFixed(2)}</div> <!-- Total price -->
            `;
            cartItems.appendChild(orderSummary); // Append order summary to cart display
        }

        cartTotal.textContent = total.toFixed(2); // Update total price display
    }

    // Remove item from cart
    function removeFromCart(cartId) {
        console.log('removeFromCart called with cartId:', cartId);
        const numericCartId = Number(cartId);
        const itemIndex = cart.findIndex(item => item.cartId === numericCartId); // Find item index in cart
        if (itemIndex !== -1) { // If item is found
            const removedItem = cart[itemIndex]; // Get removed item
            // Return item to stock
            const product = products.find(p => p.id === removedItem.id); // Find product by ID
            if (product) {
                product.stock += 1; // Increase stock
                updateProductDisplay(currentProductIndex); // Update product display
            }
            
            cart.splice(itemIndex, 1); // Remove item from cart
            updateCartDisplay(); // Update cart display
            updateCartCount(); // Update cart count
        }
    }

    // Expose functions to global scope for inline event handlers
    window.addToCart = addToCart;
    window.buyProduct = buyProduct;
    window.removeFromCart = removeFromCart;
    window.toggleCart = toggleCart;
    window.checkout = checkout;

    // Event listener for shipping icon click
    const shippingIcon = document.getElementById('shippingIcon');
    if (shippingIcon) {
        shippingIcon.addEventListener('click', function() {
            const shippingOverlay = document.getElementById('shippingOverlay');
            if (shippingOverlay.style.display === 'flex') {
                shippingOverlay.style.display = 'none'; // Hide shipping overlay
            } else {
                shippingOverlay.style.display = 'flex'; // Show shipping overlay
            }
        });
    }

    // Event listener for closing shipping overlay
    const closeShipping = document.getElementById('closeShipping');
    if (closeShipping) {
        closeShipping.addEventListener('click', function() {
            const shippingOverlay = document.getElementById('shippingOverlay');
            shippingOverlay.style.display = 'none'; // Hide shipping overlay
        });
    }

    // Add event listeners for saveShipping and openShipping buttons
    const saveShippingBtn = document.getElementById('saveShipping');
    const openShippingBtn = document.getElementById('openShipping');

    if (saveShippingBtn) {
        saveShippingBtn.addEventListener('click', () => {
            alert('Shipping details saved.');
            const shippingOverlay = document.getElementById('shippingOverlay');
            shippingOverlay.style.display = 'none';
            finalizeCheckout();
        });
    }

    // Add submit event listener to shipping form to handle Enter key submission
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm) {
        shippingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            finalizeCheckout();
        });
    }

    if (openShippingBtn) {
        openShippingBtn.addEventListener('click', () => {
            alert('Open shipping details.');
            // Implement open shipping details logic here if needed
        });
    }

    // Authentication form toggle
    if (toggleText) {
        toggleText.addEventListener('click', function(event) {
            if (event.target && event.target.id === 'toggleLink') {
                event.preventDefault(); // Prevent default link behavior
                isLoginMode = !isLoginMode; // Toggle login mode
                if (isLoginMode) { // If in login mode
                    formTitle.textContent = 'Login'; // Set form title
                    submitButton.textContent = 'Login'; // Set submit button text
                    toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Sign up</a>'; // Update toggle text
                } else { // If in sign-up mode
                    formTitle.textContent = 'Sign Up'; // Set form title
                    submitButton.textContent = 'Sign Up'; // Set submit button text
                    toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleLink">Login</a>'; // Update toggle text
                }
            }
        });
    }

    // Authentication form submit
        if (authForm) {
            authForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent default form submission
                const username = usernameInput.value.trim(); // Get username input
                const password = passwordInput.value.trim(); // Get password input

                if (!username || !password) { // If username or password is empty
                    alert('Please enter both username and password.'); // Alert user
                    return;
                }

                if (isLoginMode) { // If in login mode
                    // Simulate login: check if user exists in localStorage
                    const storedPassword = localStorage.getItem(`user_${username}`); // Get stored password
                    if (storedPassword === password) { // If password matches
                        loggedInUser = username; // Set logged in user
                        hideAuthForm(); // Hide authentication form
                        alert(`Welcome back, ${loggedInUser}! You can now shop.`); // Welcome message
                    } else {
                        alert('Invalid username or password.'); // Alert user
                    }
                } else { // If in sign-up mode
                    // Sign up: save user to localStorage
                    if (localStorage.getItem(`user_${username}`)) { // If username already exists
                        alert('Username already exists. Please choose another.'); // Alert user
                    } else {
                        localStorage.setItem(`user_${username}`, password); // Save new user
                        loggedInUser = username; // Set logged in user
                        hideAuthForm(); // Hide authentication form
                        alert(`Account created. Welcome, ${loggedInUser}! You can now shop.`); // Welcome message
                    }
                }
            });
        }

        // Show authentication form
        function showAuthForm() {
            authOverlay.style.display = 'flex'; // Show authentication overlay
    }

    // Hide authentication form
    function hideAuthForm() {
        authOverlay.style.display = 'none'; // Hide authentication overlay
    }

    // Finalize checkout function
    async function finalizeCheckout() {
        if (!loggedInUser) { // If user is not logged in
            alert('Please log in or sign up before checking out.'); // Alert user
            showAuthForm(); // Show authentication form
            return;
        }

        // Get shipping details inputs
        const shippingAddressInput = document.getElementById('shippingAddress');
        const phoneNumberInput = document.getElementById('phoneNumber');

        if (!shippingAddressInput || !phoneNumberInput) { // If shipping details inputs are missing
            alert('Please provide shipping address and phone number.'); // Alert user
            return;
        }

        const shippingAddress = shippingAddressInput.value.trim(); // Get shipping address
        const phoneNumber = phoneNumberInput.value.trim(); // Get phone number

        if (!shippingAddress || !phoneNumber) { // If shipping address or phone number is empty
            alert('Please fill in both shipping address and phone number.'); // Alert user
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price, 0); // Calculate total price

        // Prepare order data including shipping details
        const orderData = {
            customer: loggedInUser, // Customer name
            status: 'Processing', // Order status
            total: total, // Total price
            shippingAddress: shippingAddress, // Shipping address
            phoneNumber: phoneNumber // Phone number
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST', // HTTP method
                headers: {
                    'Content-Type': 'application/json' // Content type
                },
                body: JSON.stringify(orderData) // Order data as JSON
            });

            if (response.ok) { // If order is successful
                const successMessage = document.createElement('div');
                successMessage.className = 'checkout-success';
                successMessage.innerHTML = `
                    <h3>Thank you for your purchase!</h3>
                    <p>Your order has been placed successfully.</p>
                `;

                const cartItems = document.getElementById('cartItems');
                cartItems.innerHTML = ''; // Clear cart items
                cartItems.appendChild(successMessage); // Show success message

                cart = []; // Clear cart
                updateCartCount(); // Update cart count
                updateCartDisplay(); // Update cart display to clear UI
                currentProductIndex = 0; // Reset to first product
                updateProductDisplay(currentProductIndex); // Update product display
                setTimeout(() => {
                    toggleCart(); // Close cart after 2 seconds
                    window.location.reload(); // Reload page to reset state
                }, 2000);
            } else {
                alert('Failed to place order. Please try again.'); // Alert user
            }
        } catch (error) {
            console.error('Error placing order:', error); // Log any errors
            alert('Error placing order. Please try again.'); // Alert user
        }
    }

    // Checkout function
    function checkout() {
        if (cart.length === 0) { // If cart is empty
            alert('Your cart is empty!'); // Alert user
            return;
        }

        // Show shipping detail overlay on checkout
        const shippingOverlay = document.getElementById('shippingOverlay');
        shippingOverlay.classList.add('active');

        // Optionally, close the cart sidebar to focus on shipping form
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
    }

    // Navigation dots functionality
    const dots = document.querySelectorAll('.dot');
    if (dots) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentProductIndex = index; // Update current product index
                updateProductDisplay(currentProductIndex); // Update product display
            });
        });
    }

    // Next button functionality
    const nextButton = document.querySelector('.next-button');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentProductIndex = (currentProductIndex + 1) % products.length; // Update current product index
            updateProductDisplay(currentProductIndex); // Update product display
        });
    }

    // Previous button functionality
    const prevButton = document.querySelector('.prev-button');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentProductIndex = (currentProductIndex - 1 + products.length) % products.length; // Update current product index
            updateProductDisplay(currentProductIndex); // Update product display
        });
    }

    // Initialize the store
    fetchProducts();
    showAuthForm();


