import { Route } from 'react-router-dom';

import Home from '@/views/pages/home/Home';
import Search from '@/views/pages/catalogry/Search';
import ProductsPage from '@/views/pages/product/Products';
import Compare from '@/views/pages/product/Compare';
import Wishlist from '@/views/pages/product/Wishlist';
import Blog from '@/views/pages/blog/Blog';
import BlogDetail from '@/views/pages/blog/BlogDetail';
import ProductDetail from '@/views/pages/product/ProductDetail';
import FlashSale from '@/views/pages/promotions/FlashSale';
import Contact from '@/views/pages/contact/Contact';
import About from '@/views/pages/about/About';
import Terms from '@/views/pages/about/Terms';
import Privacy from '@/views/pages/about/Privacy';
import Cart from '@/views/pages/cart/Cart';
import Checkout from '@/views/pages/payments/Checkout';
import Login from '@/views/pages/auth/Login';
import Register from '@/views/pages/auth/Register';
import ForgotPassword from '@/views/pages/auth/ForgotPassword';
import Forbidden from '@/views/pages/forbidden/Forbidden';

export const publicRoutes = (
  <>
    <Route index element={<Home />} />
    <Route path="search" element={<Search />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="compare" element={<Compare />} />
    <Route path="wishlist" element={<Wishlist />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:id" element={<BlogDetail />} />
    <Route path="product/:id" element={<ProductDetail />} />
    <Route path="flash-sale" element={<FlashSale />} />
    <Route path="contact" element={<Contact />} />
    <Route path="about" element={<About />} />
    <Route path="terms" element={<Terms />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="cart" element={<Cart />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="forgot-password" element={<ForgotPassword />} />
    <Route path="403" element={<Forbidden />} />
  </>
);
