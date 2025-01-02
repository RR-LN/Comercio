from django.shortcuts import render
from frontend.models import Product
from decimal import Decimal

class Cart:
    """
    A class to represent a shopping cart.

    Attributes:
        session (SessionBase): The session object for storing cart data.
        cart (dict): The dictionary storing cart items.
    """
    def __init__(self, request):
        """
        Initialize the cart with the session from the request.

        Args:
            request (HttpRequest): The HTTP request object containing session data.
        """
        self.session = request.session
        cart = self.session.get('cart')
        if not cart:
            cart = self.session['cart'] = {}
        self.cart = cart

    def add(self, product, quantity=1):
        """
        Add a product to the cart.

        Args:
            product (Product): The product object to be added to the cart.
            quantity (int, optional): The quantity of the product to add. Defaults to 1.
        """
        product_id = str(product.id)
        if product_id not in self.cart:
            self.cart[product_id] = {'quantity': quantity, 'price': product.price}  # Store price as Decimal
        else:
            self.cart[product_id]['quantity'] += quantity
        self.session.modified = True

    def remove(self, product):
        """
        Remove a product from the cart.

        Args:
            product (Product): The product object to be removed from the cart.
        """
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]
            self.session.modified = True

    def clear(self):
        """
        Clear the cart by removing all items.
        """
        self.session['cart'] = {}
        self.session.modified = True

    def update_quantity(self, product, quantity):
        """
        Update the quantity of a product in the cart.

        Args:
            product (Product): The product object to be updated.
            quantity (int): The new quantity of the product.
        """
        product_id = str(product.id)
        if product_id in self.cart:
            self.cart[product_id]['quantity'] = quantity
            self.session.modified = True

    def has_item(self, product):
        """
        Check if a product is in the cart.

        Args:
            product (Product): The product object to be checked.

        Returns:
            bool: True if the product is in the cart, False otherwise.
        """
        product_id = str(product.id)
        return product_id in self.cart

    def get_total_quantity(self):
        """
        Get the total quantity of items in the cart.

        Returns:
            int: The total quantity of items in the cart.
        """
        return sum(item['quantity'] for item in self.cart.values())

    def get_total_price(self):
        """
        Calculate the total price of all items in the cart.

        Returns:
            Decimal: The total price of all items in the cart.
        """
        total = sum(Decimal(item['price']) * item['quantity'] for item in self.cart.values())
        return total

    def get_total_price_in_currency(self, currency):
        """
        Get the total price of all items in the cart in a specific currency.

        Args:
            currency (str): The currency code.

        Returns:
            Decimal: The total price of all items in the cart in the specified currency.
        """
        # Implement currency conversion logic here
        pass

    def clear_after_purchase(self):
        """
        Clear the cart after a purchase.
        """
        self.clear()

def cart_view(request):
    """
    View to display the shopping cart.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The rendered cart page.
    """
    cart = Cart(request)
    total = cart.get_total_price()
    return render(request, 'store/cart.html', {'cart': cart, 'total': total})