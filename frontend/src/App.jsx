import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import StaffLoginPage from './pages/StaffLoginPage.jsx'
import RiderPage from './pages/RiderPage-SHELL.jsx'
import AdminPage from './pages/AdminPage.jsx'

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppProvider>
                    <Routes>
                        <Route path="/" element={<Navigate to="/staff-login" replace />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/staff-login" element={<StaffLoginPage />} />
                        <Route path="/rider" element={<RiderPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="*" element={<Navigate to="/staff-login" replace />} />
                    </Routes>
                </AppProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
