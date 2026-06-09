import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder } from '../actions/orderActions';

function PlaceOrderScreen({ history }) {
  const cart = useSelector(state => state.cart);
  const orderCreate = useSelector(state => state.orderCreate);
  const { success, order, error, loading } = orderCreate;

  const { cartItems, shipping, payment } = cart;

  // Extract values to variables for static checking
  const shippingAddress = shipping?.address;
  const paymentMethod = payment?.paymentMethod;

  // Move redirect logic to useEffect with proper dependencies
  useEffect(() => {
    if (!shippingAddress) {
      history.push("/shipping");
    } else if (!paymentMethod) {
      history.push("/payment");
    }
  }, [shippingAddress, paymentMethod, history]);

  // Memoize price calculations for performance
  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = useMemo(() => {
    const items = cartItems.reduce((a, c) => a + c.price * c.qty, 0);
    const shipping = items > 100 ? 0 : 10;
    const tax = parseFloat((0.15 * items).toFixed(2));
    const total = parseFloat((items + shipping + tax).toFixed(2));

    return {
      itemsPrice: parseFloat(items.toFixed(2)),
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total
    };
  }, [cartItems]);

  const dispatch = useDispatch();

  const placeOrderHandler = () => {
    // Validate before dispatching
    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }
    if (!shippingAddress || !paymentMethod) {
      alert("Please complete shipping and payment information");
      return;
    }

    dispatch(createOrder({
      orderItems: cartItems,
      shipping,
      payment,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    }));
  }

  useEffect(() => {
    if (success && order) {
      history.push("/order/" + order._id);
    }
  }, [success, order, history]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="placeorder">
        <div className="placeorder-info">
          <div>
            <h3>Shipping</h3>
            <div>
              {shipping?.address}, {shipping?.city},
              {shipping?.postalCode}, {shipping?.country}
            </div>
          </div>

          <div>
            <h3>Payment</h3>
            <div>
              Payment Method: {payment?.paymentMethod}
            </div>
          </div>

          <div>
            <ul className="cart-list-container">
              <li>
                <h3>Shopping Cart</h3>
                <div>Price</div>
              </li>
              {cartItems.length === 0 ? (
                <div>Cart is empty</div>
              ) : (
                cartItems.map(item => (
                  <li key={item.product}>
                    <div className="cart-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-name">
                      <div>
                        <Link to={`/product/${item.product}`}>
                          {item.name}
                        </Link>
                      </div>
                      <div>
                        Qty: {item.qty}
                      </div>
                    </div>
                    <div className="cart-price">
                      ${item.price}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="placeorder-action">
          <ul>
            <li>
              <button
                className="button primary full-width"
                onClick={placeOrderHandler}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </li>
            {error && (
              <li>
                <div className="error" style={{ color: 'red' }}>
                  {error}
                </div>
              </li>
            )}
            <li>
              <h3>Order Summary</h3>
            </li>
            <li>
              <div>Items</div>
              <div>${itemsPrice}</div>
            </li>
            <li>
              <div>Shipping</div>
              <div>${shippingPrice}</div>
            </li>
            <li>
              <div>Tax</div>
              <div>${taxPrice}</div>
            </li>
            <li>
              <div>Order Total</div>
              <div>${totalPrice}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrderScreen;