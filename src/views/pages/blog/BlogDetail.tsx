import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowLeft, FiMessageSquare, FiShare2, FiTag } from 'react-icons/fi';
import { motion } from 'motion/react';

const mockPost = {
  id: 1,
  slug: 'danh-gia-chi-tiet-iphone-15-pro-max',
  title: 'Đánh giá chi tiết iPhone 15 Pro Max: Đáng đồng tiền bát gạo?',
  content: `
    <p class="mb-6 text-lg">iPhone 15 Pro Max mang đến nhiều cải tiến đáng giá như khung titan, camera tele 5x và cổng USB-C. Cùng tìm hiểu xem liệu đây có phải là chiếc smartphone đáng mua nhất hiện nay.</p>
    
    <h3 class="text-2xl font-bold mb-4 mt-8">1. Thiết kế Titan mới mẻ và nhẹ nhàng hơn</h3>
    <p class="mb-4">Thay đổi lớn nhất về thiết kế trên iPhone 15 Pro Max chính là việc chuyển sang sử dụng khung viền Titanium thay vì thép không gỉ. Điều này không chỉ giúp máy bền bỉ hơn mà còn giảm trọng lượng đáng kể, mang lại cảm giác cầm nắm thoải mái hơn rất nhiều so với thế hệ trước.</p>
    <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png" alt="iPhone 15 Pro Max Design" class="w-full rounded-2xl my-8 object-cover aspect-video" />
    
    <h3 class="text-2xl font-bold mb-4 mt-8">2. Camera Tele 5x - Bước nhảy vọt về nhiếp ảnh</h3>
    <p class="mb-4">Apple đã trang bị cho iPhone 15 Pro Max ống kính tetraprism mới, cho phép zoom quang học lên đến 5x (tương đương tiêu cự 120mm). Đây là một nâng cấp cực kỳ đáng giá cho những ai đam mê nhiếp ảnh di động, đặc biệt là khi chụp chân dung hoặc các chủ thể ở xa.</p>
    
    <h3 class="text-2xl font-bold mb-4 mt-8">3. Cổng USB-C - Cuối cùng cũng xuất hiện</h3>
    <p class="mb-4">Việc chuyển đổi từ Lightning sang USB-C mang lại sự tiện lợi vô cùng lớn. Giờ đây bạn có thể sử dụng chung một sợi cáp cho Mac, iPad và iPhone. Hơn nữa, chuẩn USB 3 trên bản Pro mang lại tốc độ truyền tải dữ liệu lên đến 10Gbps.</p>
    <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max-blue.png" alt="iPhone 15 Pro Max USB-C" class="w-full rounded-2xl my-8 object-cover aspect-video" />
    
    <h3 class="text-2xl font-bold mb-4 mt-8">Kết luận</h3>
    <p class="mb-4">Với những nâng cấp thiết thực về thiết kế, camera và cổng kết nối, iPhone 15 Pro Max thực sự là một chiếc smartphone toàn diện và đáng để nâng cấp, đặc biệt là đối với những người đang sử dụng các thế hệ iPhone cũ hơn (từ iPhone 13 series trở về trước).</p>
  `,
  image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png',
  date: '15/03/2026',
  author: 'Tech Reviewer',
  category: 'Đánh giá',
  tags: ['Apple', 'iPhone 15', 'Smartphone', 'Review']
};

const relatedPosts = [
  {
    id: 2,
    slug: 'top-5-laptop-gaming-dang-mua-nhat-20-30-trieu',
    title: 'Top 5 laptop gaming đáng mua nhất trong tầm giá 20-30 triệu',
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_1__1_50.png',
    date: '12/03/2026',
  },
  {
    id: 3,
    slug: 'huong-dan-chon-mua-ban-phim-co',
    title: 'Hướng dẫn chọn mua bàn phím cơ phù hợp với nhu cầu',
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/k/e/keychron-q1-he.png',
    date: '10/03/2026',
  }
];

export default function BlogDetail() {
  const { slug } = useParams();

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-8 font-medium">
          <FiArrowLeft /> Quay lại Blog
        </Link>

        {/* Article Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-bold rounded-full mb-6">
            {mockPost.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {mockPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2">
              <FiUser className="text-lg" />
              <span className="font-medium">{mockPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-lg" />
              <span>{mockPost.date}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                <FiShare2 className="text-lg" /> Chia sẻ
              </button>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12 rounded-2xl overflow-hidden shadow-xl"
        >
          <img 
            src={mockPost.image} 
            alt={mockPost.title} 
            className="w-full aspect-[21/9] object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Article Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: mockPost.content }}
        />

        {/* Tags */}
        <div className="flex items-center gap-3 mb-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <FiTag className="text-slate-400 text-xl" />
          <div className="flex flex-wrap gap-2">
            {mockPost.tags.map(tag => (
              <Link 
                key={tag} 
                to={`/blog?tag=${tag}`}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 mb-16 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <FiMessageSquare className="text-2xl text-purple-600" />
            <h3 className="text-2xl font-bold">Bình luận & Đánh giá</h3>
          </div>
          
          <div className="flex gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xl shrink-0">
              U
            </div>
            <div className="flex-1">
              <textarea 
                placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..." 
                className="w-full h-32 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 resize-none mb-4"
              ></textarea>
              <div className="flex justify-end">
                <button className="btn btn-primary btn-lg">
                  Gửi bình luận
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div>
          <h3 className="text-2xl font-bold mb-8">Bài viết liên quan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-slate-800">
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <FiCalendar />
                    <span>{post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
