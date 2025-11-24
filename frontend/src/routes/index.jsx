import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { OAuth2RedirectHandler } from '../components/auth/OAuth2RedirectHandler'

// Pages
import HomePage from '../pages/public/HomePage'
import ProductsPage from '../pages/public/ProductsPage'
import ProductDetailPage from '../pages/public/ProductDetailPage'
import CartPage from '../pages/public/CartPage'
import CheckoutPage from '../pages/public/CheckoutPage'
import AboutPage from '../pages/public/AboutPage'
import FavoritesPage from '../pages/public/FavoritesPage'
import PoliciesPage from '../pages/public/PoliciesPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import NotFoundPage from '../pages/errors/NotFoundPage'
import ClientDashboard from '../pages/client/ClientDashboard'
import VendorDashboard from '../pages/vendor/VendorDashboard'
import AdminDashboard from '../pages/admin/AdminDashboard'
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard'

const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route path="/conocenos" element={<AboutPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/politicas" element={<PoliciesPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Client Routes */}
          <Route
            path="/cliente/dashboard"
            element={
              <ProtectedRoute allowedRoles={['cliente']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Vendor Routes */}
          <Route
            path="/vendedor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendedor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* SuperAdmin Routes */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default AppRoutes
