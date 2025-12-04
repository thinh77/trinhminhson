import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/home.tsx";
import { AboutPage } from "./pages/about/about.tsx";
import { BlogPage } from "./pages/blog/blog.tsx";
import { PhotosPage } from "./pages/photos/photos.tsx";
import { AdminPage } from "./pages/admin/admin.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);