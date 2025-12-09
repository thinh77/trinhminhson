import {
  Smartphone,
  HardDrive,
  Image as ImageIcon,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import type { WarehouseCategory } from "@/types/warehouse";

export const warehouseCategories: WarehouseCategory[] = [
  {
    id: "apps",
    title: "Kho App Online",
    description: "Ứng dụng web, công cụ trực tuyến và dịch vụ SaaS hữu ích",
    icon: Smartphone,
    href: "/warehouse/apps",
    count: 42,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "software",
    title: "Kho phần mềm",
    description: "Phần mềm máy tính, công cụ phát triển và tiện ích hệ thống",
    icon: HardDrive,
    href: "/warehouse/software",
    count: 38,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "media",
    title: "Kho Media",
    description: "Hình ảnh, video, âm thanh và tài nguyên đa phương tiện",
    icon: ImageIcon,
    href: "/warehouse/media",
    count: 156,
    color: "from-orange-500 to-red-500"
  },
  {
    id: "courses",
    title: "Kho giáo trình",
    description: "Khóa học, tài liệu học tập và hướng dẫn chuyên sâu",
    icon: GraduationCap,
    href: "/warehouse/courses",
    count: 24,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "books",
    title: "Kho sách",
    description: "Sách điện tử, tài liệu nghiên cứu và tủ sách cá nhân",
    icon: BookOpen,
    href: "/books",
    count: 67,
    color: "from-indigo-500 to-blue-500"
  }
];

export const calculateWarehouseStats = () => {
  const totalCategories = warehouseCategories.length;
  const totalResources = warehouseCategories.reduce((sum, cat) => sum + (cat.count || 0), 0);
  
  return {
    totalCategories,
    totalResources
  };
};
