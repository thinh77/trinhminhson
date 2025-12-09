import { warehouseCategories, calculateWarehouseStats } from "@/constants/warehouse";
import { Navbar } from "@/components/layout/navbar";
import { CategoryCard } from "@/components/warehouse/CategoryCard";

export function WarehousePage() {
    const stats = calculateWarehouseStats();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Fixed Navbar with proper spacing */}
            <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-sm" />
            
            {/* Main Content - Account for fixed navbar */}
            <div>
                {/* Hero Section - Minimalist */}
                <section className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-4">
                                Nhà kho
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                                Khám phá bộ sưu tập tài nguyên, công cụ và tài liệu được tuyển chọn
                            </p>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-8 mt-8 text-sm text-slate-600">
                                <div>
                                    <span className="font-semibold text-slate-900">{stats.totalCategories}</span> danh mục
                                </div>
                                <div className="w-px h-4 bg-slate-300" />
                                <div>
                                    <span className="font-semibold text-slate-900">{stats.totalResources}+</span> tài nguyên
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouseCategories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
