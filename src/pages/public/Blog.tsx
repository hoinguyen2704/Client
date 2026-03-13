import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowRight, FiSearch, FiTag } from 'react-icons/fi';
import { motion } from 'motion/react';

const mockPosts = [
  {
    id: 1,
    title: 'Đánh giá chi tiết iPhone 15 Pro Max: Đáng đồng tiền bát gạo?',
    excerpt: 'iPhone 15 Pro Max mang đến nhiều cải tiến đáng giá như khung titan, camera tele 5x và cổng USB-C. Cùng tìm hiểu xem liệu đây có phải là chiếc smartphone đáng mua nhất hiện nay.',
    image: 'https://picsum.photos/seed/iphone15/800/500',
    date: '15/03/2026',
    author: 'Tech Reviewer',
    category: 'Đánh giá'
  },
  {
    id: 2,
    title: 'Top 5 laptop gaming đáng mua nhất trong tầm giá 20-30 triệu',
    excerpt: 'Bạn đang tìm kiếm một chiếc laptop gaming mạnh mẽ nhưng ngân sách có hạn? Hãy tham khảo danh sách 5 mẫu laptop gaming tốt nhất trong phân khúc 20-30 triệu đồng.',
    image: 'https://picsum.photos/seed/laptop/800/500',
    date: '12/03/2026',
    author: 'Gaming Expert',
    category: 'Tư vấn'
  },
  {
    id: 3,
    title: 'Hướng dẫn chọn mua bàn phím cơ phù hợp với nhu cầu',
    excerpt: 'Bàn phím cơ có rất nhiều loại switch, layout và tính năng khác nhau. Bài viết này sẽ giúp bạn hiểu rõ và chọn được chiếc bàn phím cơ ưng ý nhất.',
    image: 'https://picsum.photos/seed/keyboard/800/500',
    date: '10/03/2026',
    author: 'Setup Master',
    category: 'Hướng dẫn'
  },
  {
    id: 4,
    title: 'So sánh AirPods Pro 2 và Sony WF-1000XM5: Đâu là vua tai nghe TWS?',
    excerpt: 'Hai mẫu tai nghe true wireless chống ồn hàng đầu hiện nay đang cạnh tranh gay gắt. Cùng xem xét ưu nhược điểm của từng sản phẩm để đưa ra quyết định.',
    image: 'https://picsum.photos/seed/earbuds/800/500',
    date: '08/03/2026',
    author: 'Audio Fanatic',
    category: 'So sánh'
  },
  {
    id: 5,
    title: 'Xu hướng công nghệ năm 2026: AI tiếp tục lên ngôi',
    excerpt: 'Trí tuệ nhân tạo đang ngày càng được tích hợp sâu vào các thiết bị công nghệ từ điện thoại, laptop đến đồ gia dụng. Cùng điểm qua những xu hướng nổi bật trong năm nay.',
    image: 'https://picsum.photos/seed/ai/800/500',
    date: '05/03/2026',
    author: 'Tech Analyst',
    category: 'Tin tức'
  },
  {
    id: 6,
    title: 'Cách tối ưu hóa pin cho MacBook để sử dụng cả ngày dài',
    excerpt: 'MacBook nổi tiếng với thời lượng pin ấn tượng, nhưng bạn vẫn có thể làm nhiều cách để kéo dài thời gian sử dụng hơn nữa. Hãy thử áp dụng các mẹo sau.',
    image: 'https://picsum.photos/seed/macbook/800/500',
    date: '01/03/2026',
    author: 'Apple Guru',
    category: 'Thủ thuật'
  }
];

const tags = ['Đánh giá', 'Mẹo vặt', 'Tin đồn', 'Apple', 'Samsung', 'Laptop', 'Gaming', 'Phụ kiện', 'AI'];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Blog Công Nghệ
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Cập nhật những tin tức công nghệ mới nhất, đánh giá sản phẩm chi tiết và các thủ thuật hữu ích từ đội ngũ chuyên gia của Hozitech.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Post */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <Link to={`/blog/${mockPosts[0].id}`} className="group block relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="aspect-[21/9] w-full overflow-hidden">
                  <img 
                    src={mockPosts[0].image} 
                    alt={mockPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                  <span className="inline-block px-4 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-full mb-4 w-max">
                    {mockPosts[0].category}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                    {mockPosts[0].title}
                  </h2>
                  <p className="text-slate-300 mb-6 max-w-3xl line-clamp-2 md:line-clamp-3">
                    {mockPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser />
                      <span>{mockPosts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar />
                      <span>{mockPosts[0].date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mockPosts.slice(1).map((post, index) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link to={`/blog/${post.id}`} className="group block h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="aspect-[16/9] w-full overflow-hidden relative">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <FiUser />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiCalendar />
                            <span>{post.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <button className="px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                Xem thêm bài viết <FiArrowRight />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex flex-col gap-8">
            {/* Search */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-4">Tìm kiếm bài viết</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập từ khóa..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600">
                  <FiSearch className="text-xl" />
                </button>
              </div>
            </div>

            {/* Featured Posts */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-4">Bài viết nổi bật</h3>
              <div className="space-y-4">
                {mockPosts.slice(1, 4).map(post => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="flex gap-4 group">
                    <img src={post.image} alt={post.title} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2 group-hover:text-purple-600 transition-colors mb-1">
                        {post.title}
                      </h4>
                      <span className="text-xs text-slate-500">{post.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tag Cloud */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <FiTag className="text-purple-600" />
                <h3 className="text-lg font-bold">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link 
                    key={tag} 
                    to={`/blog?tag=${tag}`}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
