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
import { WarehousePage } from "./pages/warehouse/warehouse.tsx";
import { WarehouseAppsPage } from "./pages/warehouse/apps.tsx";
import { WarehouseSoftwarePage } from "./pages/warehouse/software.tsx";
import { WarehouseMediaPage } from "./pages/warehouse/media.tsx";
import { WarehouseCoursesPage } from "./pages/warehouse/courses.tsx";
import { UnderDevelopmentPage } from "./pages/under-development.tsx";
import { JapaneseFlashcardHome } from "./pages/learning/flashcard-home.tsx";
import { JapaneseFlashcardStudy } from "./pages/learning/flashcard-study.tsx";
import { JapaneseFlashcardUpload } from "./pages/learning/flashcard-upload.tsx";
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
            <Route path="/warehouse" element={<WarehousePage />} />
            <Route path="/warehouse/apps" element={<WarehouseAppsPage />} />
            <Route path="/warehouse/software" element={<WarehouseSoftwarePage />} />
            <Route path="/warehouse/media" element={<WarehouseMediaPage />} />
            <Route path="/warehouse/courses" element={<WarehouseCoursesPage />} />
            
            {/* Japanese Flashcard routes */}
            <Route path="/learning" element={<JapaneseFlashcardHome />} />
            <Route path="/learning/study/:setId" element={<JapaneseFlashcardStudy />} />
            <Route path="/learning/upload" element={
              <ProtectedRoute>
                <JapaneseFlashcardUpload />
              </ProtectedRoute>
            } />
            
            {/* Under development routes */}
            <Route path="/training/*" element={<UnderDevelopmentPage />} />
            <Route path="/music" element={<UnderDevelopmentPage />} />
            <Route path="/movies" element={<UnderDevelopmentPage />} />
            <Route path="/stories" element={<UnderDevelopmentPage />} />
            <Route path="/memories" element={<UnderDevelopmentPage />} />
            <Route path="/architecture" element={<UnderDevelopmentPage />} />
            <Route path="/apps" element={<UnderDevelopmentPage />} />
            <Route path="/projects/*" element={<UnderDevelopmentPage />} />
            <Route path="/contact" element={<UnderDevelopmentPage />} />
          </Routes>
        </BrowserRouter>
      </BlogProvider>
    </AuthProvider>
  </React.StrictMode>
);