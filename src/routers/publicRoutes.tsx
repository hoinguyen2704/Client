import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Home = lazy(() => import('@/views/pages/home/Home'));
const Search = lazy(() => import('@/views/pages/category/Search'));
const ProductsPage = lazy(() => import('@/views/pages/product/Products'));
const Compare = lazy(() => import('@/views/pages/product/Compare'));
const Wishlist = lazy(() => import('@/views/pages/product/Wishlist'));
const Blog = lazy(() => import('@/views/pages/blog/Blog'));
const BlogDetail = lazy(() => import('@/views/pages/blog/BlogDetail'));
const ProductDetail = lazy(() => import('@/views/pages/product/ProductDetail'));
const FlashSale = lazy(() => import('@/views/pages/promotions/FlashSale'));
const Contact = lazy(() => import('@/views/pages/contact/Contact'));
const About = lazy(() => import('@/views/pages/about/About'));
const Terms = lazy(() => import('@/views/pages/about/Terms'));
const Privacy = lazy(() => import('@/views/pages/about/Privacy'));
const Cart = lazy(() => import('@/views/pages/cart/Cart'));
const Checkout = lazy(() => import('@/views/pages/payments/Checkout'));
const Login = lazy(() => import('@/views/pages/auth/Login'));
const Register = lazy(() => import('@/views/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/views/pages/auth/ForgotPassword'));
const Forbidden = lazy(() => import('@/views/pages/forbidden/Forbidden'));

export const publicRoutes = (
  <>
    <Route index element={<Home />} />
    <Route path="search" element={<Search />} />
    <Route path="products" element={<ProductsPage />} />
    <Route path="compare" element={<Compare />} />
    <Route path="wishlist" element={<Wishlist />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:slug" element={<BlogDetail />} />
    <Route path="product/:slug" element={<ProductDetail />} />
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
