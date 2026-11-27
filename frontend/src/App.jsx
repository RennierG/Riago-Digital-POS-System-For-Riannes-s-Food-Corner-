import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'

// NOTE: Page imports will be added per task:
// import LoginPage from './pages/LoginPage.jsx'       <- task 1.1.1
// import StaffLoginPage from './pages/StaffLoginPage.jsx' <- task 1.2.1
// import CustomerPage from './pages/CustomerPage.jsx' <- task 4.1.1
// import CashierPage from './pages/CashierPage.jsx'   <- task 3.1.1
// import KitchenPage from './pages/KitchenPage.jsx'   <- task 3.2.1
// import RiderPage from './pages/RiderPage.jsx'       <- task 1.3.1
// import AdminPage from './pages/AdminPage.jsx'       <- task 1.2.1

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppProvider>
                    <Routes>
                        {/* Routes will be added per task */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </AppProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
