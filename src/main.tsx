import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/home.tsx";
import { AboutPage } from "./pages/about/about.tsx";
import { BlogPage } from "./pages/blog/blog.tsx";
import { BlogPost } from "./pages/blog/blog-post.tsx";
import { PhotosPage } from "./pages/photos/photos.tsx";
import { AdminPage } from "./pages/admin/admin.tsx";
import { BooksPage } from "./pages/books/books.tsx";
import { BoardPage } from "./pages/board/board.tsx";
import { LoginPage } from "./pages/login/login.tsx";
import RegisterPage from "./pages/auth/register.tsx";
import { BlogProvider } from "./stores/blog-store.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BlogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/photos" element={<PhotosPage />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </BlogProvider>
    </AuthProvider>
  </React.StrictMode>
);