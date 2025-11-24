import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import ParticlesBackground from './components/common/ParticlesBackground'
import AppRoutes from './routes'

function AppContent() {
  const { isDark } = useTheme()
  
  return (
    <>
      <ParticlesBackground preset="minimal" dark={isDark} density={40} />
      <AppRoutes />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
