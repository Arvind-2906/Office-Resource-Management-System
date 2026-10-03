import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import OrderStatusTracker from '../components/OrderStatusTracker';
import Button from '../components/Button';

// Test wrapper providing required Contexts and Router
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>{ui}</CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Frontend Component Tests', () => {
  test('Navbar renders brand logo and navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText(/Nova/i)).toBeInTheDocument();
    expect(screen.getByText(/Store/i)).toBeInTheDocument();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Products/i)).toBeInTheDocument();
  });

  test('ProductCard renders product details and stock information', () => {
    const mockProduct = {
      _id: '64f001122334455667788990',
      name: 'Wireless Studio Headphones',
      description: 'High-performance audio headphones with active noise cancellation.',
      price: 199.99,
      category: 'Audio',
      brand: 'AuraSound',
      rating: 4.8,
      numReviews: 45,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
    };

    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Wireless Studio Headphones')).toBeInTheDocument();
    expect(screen.getByText('$199.99')).toBeInTheDocument();
    expect(screen.getByText('AuraSound')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  test('OrderStatusTracker renders all 6 fulfillment stages', () => {
    render(
      <OrderStatusTracker
        currentStatus="SHIPPED"
        trackingEvents={[
          {
            status: 'SHIPPED',
            message: 'Package in transit with courier',
            timestamp: new Date().toISOString()
          }
        ]}
      />
    );

    expect(screen.getByText('Order Placed')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Packed')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Package in transit with courier')).toBeInTheDocument();
  });

  test('Button triggers onClick event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
