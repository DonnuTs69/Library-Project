import { Routes, Route } from "react-router-dom"
import LandingPage from "./components/Home/LandingPage"
import Navbar from "./components/Navbar/Navbar"
import SignIn from "./components/Sign/SignIn"
import SignUp from "./components/Sign/SignUp"
import SignInOutContainer from "./components/Sign/Sign"
import ShowAdminBooks from "./pages/admin/showAdminBooks/showAdminBooks.pages"
import Category from "./pages/admin/categories/Category"
// import AdminDashboard from "./pages/admin/Dashboard"

const LibraryRoutes = () => {
  return (
    <>
      <main>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/sign" element={<SignInOutContainer />} />
          <Route path="/admin-books" element={<ShowAdminBooks />} />

          {/* Admin Path */}
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          <Route path="/admin/categories" element={<Category />} />
        </Routes>
      </main>
    </>
  )
}

export default LibraryRoutes
