import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { BookOpen, Star, Calendar, Clock, ChevronRight, X, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

// Book data type
interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  dateRead: string;
  readTime: string;
  category: string;
  summary: string;
  review: string;
  keyTakeaways: string[];
  favoriteQuote?: string;
}

// Sample book data
const books: Book[] = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    rating: 5,
    dateRead: "2024-11-15",
    readTime: "2 weeks",
    category: "Self-Development",
    summary: "A comprehensive guide on how small, incremental changes in behavior can lead to remarkable results over time. The book breaks down the science of habits into practical, actionable strategies.",
    review: "Cuốn sách này đã thay đổi hoàn toàn cách tôi nhìn nhận về thói quen. James Clear giải thích rõ ràng về hệ thống 4 bước để xây dựng thói quen tốt: Cue, Craving, Response, Reward. Điều tôi thích nhất là phương pháp 'habit stacking' - gắn thói quen mới với thói quen đã có sẵn. Sau khi đọc, tôi đã áp dụng thành công việc đọc sách 30 phút mỗi tối.",
    keyTakeaways: [
      "1% better every day compounds to 37x improvement in a year",
      "Focus on systems, not goals",
      "Make good habits obvious, attractive, easy, and satisfying",
      "Environment design is more important than motivation"
    ],
    favoriteQuote: "You do not rise to the level of your goals. You fall to the level of your systems."
  },
  {
    id: 2,
    title: "Deep Work",
    author: "Cal Newport",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    rating: 5,
    dateRead: "2024-10-20",
    readTime: "10 days",
    category: "Productivity",
    summary: "Rules for focused success in a distracted world. Cal Newport argues that the ability to perform deep work is becoming increasingly rare and valuable in our economy.",
    review: "Một cuốn sách cực kỳ cần thiết trong thời đại của notifications và social media. Newport phân biệt rõ giữa 'shallow work' và 'deep work', đồng thời đưa ra các chiến lược cụ thể để tăng khả năng tập trung sâu. Tôi đã áp dụng phương pháp 'time blocking' và thấy năng suất làm việc tăng đáng kể.",
    keyTakeaways: [
      "Deep work is rare and valuable in the modern economy",
      "Embrace boredom to strengthen your focus muscle",
      "Quit social media or use it intentionally",
      "Drain the shallows - minimize shallow work"
    ],
    favoriteQuote: "If you don't produce, you won't thrive—no matter how skilled or talented you are."
  },
  {
    id: 3,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    cover: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    rating: 4,
    dateRead: "2024-09-05",
    readTime: "1 week",
    category: "Finance",
    summary: "Timeless lessons on wealth, greed, and happiness. The book explores how personal experiences shape our relationship with money and investing.",
    review: "Morgan Housel viết về tiền bạc theo cách rất khác biệt - không phải về công thức hay con số, mà về tâm lý và hành vi của con người. Cuốn sách giúp tôi hiểu rằng việc giàu có không chỉ về kiếm tiền mà còn về cách giữ tiền và tâm lý khi đối mặt với rủi ro tài chính.",
    keyTakeaways: [
      "Wealth is what you don't see (money not spent)",
      "Compounding is the 8th wonder of the world",
      "Reasonable > Rational when it comes to money decisions",
      "Room for error is the most important part of any plan"
    ],
    favoriteQuote: "Spending money to show people how much money you have is the fastest way to have less money."
  },
  {
    id: 4,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop",
    rating: 4,
    dateRead: "2024-08-10",
    readTime: "3 weeks",
    category: "Psychology",
    summary: "A groundbreaking exploration of the two systems that drive the way we think: System 1 (fast, intuitive) and System 2 (slow, deliberate).",
    review: "Đây là một trong những cuốn sách quan trọng nhất về tâm lý học ra quyết định. Kahneman - người đoạt giải Nobel - giải thích tại sao chúng ta thường đưa ra quyết định sai lầm và làm thế nào để cải thiện. Cuốn sách khá dày và đòi hỏi sự tập trung, nhưng những insight rất đáng giá.",
    keyTakeaways: [
      "System 1 is automatic and fast; System 2 is effortful and slow",
      "We are overconfident in our judgments",
      "Loss aversion: losses feel twice as painful as equivalent gains feel good",
      "Anchoring bias affects almost every decision we make"
    ]
  },
  {
    id: 5,
    title: "Show Your Work!",
    author: "Austin Kleon",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    rating: 4,
    dateRead: "2024-07-25",
    readTime: "3 days",
    category: "Creativity",
    summary: "10 ways to share your creativity and get discovered. A guide for people who hate self-promotion.",
    review: "Cuốn sách ngắn gọn nhưng đầy cảm hứng về việc chia sẻ công việc và quá trình sáng tạo. Austin Kleon khuyến khích chúng ta 'show the process, not just the product'. Đây là động lực để tôi bắt đầu viết blog và chia sẻ những gì mình học được.",
    keyTakeaways: [
      "You don't have to be a genius to share your work",
      "Think process, not product",
      "Share something small every day",
      "Be an amateur - embrace not knowing everything"
    ],
    favoriteQuote: "Become a documentarian of what you do."
  },
  {
    id: 6,
    title: "Ikigai",
    author: "Héctor García & Francesc Miralles",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
    rating: 4,
    dateRead: "2024-06-12",
    readTime: "4 days",
    category: "Philosophy",
    summary: "The Japanese secret to a long and happy life. Explores the concept of Ikigai - your reason for being.",
    review: "Một cuốn sách nhẹ nhàng và sâu sắc về triết lý sống của người Nhật. Ikigai - điểm giao nhau của những gì bạn yêu thích, giỏi, thế giới cần và có thể kiếm tiền - là một concept đơn giản nhưng mạnh mẽ. Sách cũng chia sẻ về lối sống của người dân Okinawa - nơi có nhiều người sống trên 100 tuổi nhất thế giới.",
    keyTakeaways: [
      "Find your Ikigai - the intersection of passion, mission, profession, and vocation",
      "Stay active and don't retire",
      "Nurture friendships and social connections",
      "Live in the moment and practice mindfulness"
    ]
  }
];

const categories = ["All", "Self-Development", "Productivity", "Finance", "Psychology", "Creativity", "Philosophy"];

export function BooksPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredBooks = selectedCategory === "All" 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navbar */}
      <Navbar className="fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-lg shadow-black/5" />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      {/* Main content */}
      <main className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header 
            className={cn(
              "mb-12 transition-all duration-700",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-accent/10">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                Book Reviews
              </span>
            </div>
            <h1 
              className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Sách Đã Đọc
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Tổng hợp những cuốn sách hay đã đọc, kèm tóm tắt và review chi tiết. 
              Mỗi cuốn sách là một hành trình khám phá mới.
            </p>
          </header>

          {/* Stats */}
          <div 
            className={cn(
              "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-100",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {[
              { label: "Sách đã đọc", value: books.length },
              { label: "Đang đọc", value: 2 },
              { label: "Muốn đọc", value: 15 },
              { label: "Rating trung bình", value: "4.5" }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="p-4 rounded-2xl bg-card border border-border/50 text-center"
              >
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <div 
            className={cn(
              "flex flex-wrap gap-2 mb-8 transition-all duration-700 delay-200",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  selectedCategory === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Books grid */}
          <div 
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-300",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {filteredBooks.map((book, index) => (
              <article
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={cn(
                  "group relative bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer",
                  "transition-all duration-300 ease-out",
                  "hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20 hover:-translate-y-1"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Book cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={book.cover}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-foreground backdrop-blur-sm">
                      {book.category}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium text-white">{book.rating}</span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-white/80">{book.author}</p>
                  </div>
                </div>

                {/* Book info */}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {book.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(book.dateRead)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{book.readTime}</span>
                    </div>
                  </div>

                  {/* Read more indicator */}
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all duration-200">
                    <span>Đọc review</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty state */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Chưa có sách nào trong danh mục này
              </h3>
              <p className="text-muted-foreground">
                Hãy quay lại sau nhé!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Book detail modal */}
      {selectedBook && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with cover */}
            <div className="relative h-48 sm:h-64 overflow-hidden rounded-t-3xl">
              <img
                src={selectedBook.cover}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              
              {/* Book info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                  {selectedBook.category}
                </span>
                <h2 
                  className="text-2xl sm:text-3xl font-bold text-foreground mb-1"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {selectedBook.title}
                </h2>
                <p className="text-muted-foreground">by {selectedBook.author}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Meta info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{selectedBook.rating}/5</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Đọc xong: {formatDate(selectedBook.dateRead)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Thời gian đọc: {selectedBook.readTime}</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Tóm tắt</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedBook.summary}
                </p>
              </div>

              {/* Review */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Review của tôi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedBook.review}
                </p>
              </div>

              {/* Key takeaways */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Key Takeaways</h3>
                <ul className="space-y-2">
                  {selectedBook.keyTakeaways.map((takeaway, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Favorite quote */}
              {selectedBook.favoriteQuote && (
                <div className="relative p-6 rounded-2xl bg-secondary/50 border border-border/50">
                  <Quote className="absolute top-4 left-4 w-8 h-8 text-accent/20" />
                  <blockquote className="pl-8 text-lg italic text-foreground">
                    "{selectedBook.favoriteQuote}"
                  </blockquote>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
