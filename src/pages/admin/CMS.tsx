import { useState } from 'react';
import { FiImage, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPlus, FiUploadCloud, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const mockBanners = [
  { id: 1, title: 'Khuyến mãi mùa hè', link: '/sale-summer', order: 1, status: 'visible', image: 'https://picsum.photos/seed/b1/800/300' },
  { id: 2, title: 'Ra mắt iPhone 15', link: '/iphone-15', order: 2, status: 'visible', image: 'https://picsum.photos/seed/b2/800/300' },
  { id: 3, title: 'Giảm giá phụ kiện', link: '/accessories', order: 3, status: 'hidden', image: 'https://picsum.photos/seed/b3/800/300' },
];

const mockPosts = [
  { id: 1, title: 'Đánh giá chi tiết iPhone 15 Pro Max sau 1 tháng sử dụng', author: 'Admin', category: 'Review', date: '20/10/2023', status: 'published' },
  { id: 2, title: 'Top 5 laptop sinh viên đáng mua nhất 2023', author: 'Content Team', category: 'Tư vấn', date: '18/10/2023', status: 'published' },
  { id: 3, title: 'Hướng dẫn vệ sinh tai nghe AirPods đúng cách', author: 'Admin', category: 'Thủ thuật', date: '15/10/2023', status: 'draft' },
];

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'banners' | 'posts'>('banners');
  const [banners, setBanners] = useState(mockBanners);
  const [posts, setPosts] = useState(mockPosts);
  const [isEditingPost, setIsEditingPost] = useState(false);

  const toggleBannerStatus = (id: number, currentStatus: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, status: currentStatus === 'visible' ? 'hidden' : 'visible' } : b));
  };

  const togglePostStatus = (id: number, currentStatus: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: currentStatus === 'published' ? 'draft' : 'published' } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý Nội dung & Blog</h1>
        <div className="flex gap-2">
          {activeTab === 'posts' && !isEditingPost && (
            <button 
              onClick={() => setIsEditingPost(true)}
              className="px-4 h-10 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
            >
              <FiPlus /> Thêm bài viết
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => { setActiveTab('banners'); setIsEditingPost(false); }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'banners' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          Banner Trang chủ
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'posts' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          Bài viết Blog
        </button>
      </div>

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 border-dashed text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <FiUploadCloud />
            </div>
            <h3 className="text-lg font-bold mb-2">Kéo thả ảnh banner vào đây</h3>
            <p className="text-slate-500 text-sm mb-4">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB). Kích thước khuyến nghị: 1920x600px</p>
            <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-colors">
              Chọn tệp từ máy tính
            </button>
          </div>

          {/* Banners List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="p-4 font-medium w-16 text-center">Thứ tự</th>
                    <th className="p-4 font-medium">Ảnh Preview</th>
                    <th className="p-4 font-medium">Tiêu đề</th>
                    <th className="p-4 font-medium">Link đích</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                    <th className="p-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-center">{banner.order}</td>
                      <td className="p-4">
                        <img src={banner.image} alt={banner.title} className="w-32 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                      </td>
                      <td className="p-4 font-medium text-sm">{banner.title}</td>
                      <td className="p-4 text-sm text-blue-500 hover:underline">{banner.link}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          banner.status === 'visible' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {banner.status === 'visible' ? 'Đang hiện' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleBannerStatus(banner.id, banner.status)}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title={banner.status === 'visible' ? 'Ẩn' : 'Hiện'}
                          >
                            {banner.status === 'visible' ? <FiEyeOff /> : <FiEye />}
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Sửa">
                            <FiEdit2 />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Xóa">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {isEditingPost ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Thêm / Sửa Bài viết</h2>
                <button onClick={() => setIsEditingPost(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-sm">Quay lại danh sách</button>
              </div>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tiêu đề bài viết</label>
                    <input type="text" placeholder="Nhập tiêu đề..." className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Danh mục</label>
                    <select className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                      <option value="review">Review</option>
                      <option value="news">Tin tức</option>
                      <option value="tips">Thủ thuật</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ảnh bìa</label>
                  <div className="h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <FiImage className="text-2xl mb-2" />
                    <span className="text-sm">Click hoặc kéo thả ảnh vào đây</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung (Rich Text Editor)</label>
                  {/* Fake Rich Text Editor Toolbar */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex gap-2">
                      <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold">B</button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded italic">I</button>
                      <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded underline">U</button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 self-center"></div>
                      <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-sm"><FiImage /></button>
                    </div>
                    <textarea 
                      placeholder="Nhập nội dung bài viết..."
                      className="w-full h-64 p-4 bg-white dark:bg-slate-900 text-sm focus:outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsEditingPost(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Hủy
                  </button>
                  <button type="button" className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                    Lưu nháp
                  </button>
                  <button type="button" className="px-6 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors">
                    Xuất bản
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="p-4 font-medium">Tiêu đề</th>
                      <th className="p-4 font-medium">Tác giả</th>
                      <th className="p-4 font-medium">Danh mục</th>
                      <th className="p-4 font-medium">Ngày đăng</th>
                      <th className="p-4 font-medium">Trạng thái</th>
                      <th className="p-4 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-medium text-sm max-w-[300px] truncate">{post.title}</td>
                        <td className="p-4 text-sm text-slate-500">{post.author}</td>
                        <td className="p-4 text-sm"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">{post.category}</span></td>
                        <td className="p-4 text-sm text-slate-500">{post.date}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {post.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => togglePostStatus(post.id, post.status)}
                              className={`p-2 rounded-lg transition-colors ${post.status === 'published' ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                              title={post.status === 'published' ? 'Gỡ xuất bản' : 'Xuất bản'}
                            >
                              {post.status === 'published' ? <FiXCircle /> : <FiCheckCircle />}
                            </button>
                            <button onClick={() => setIsEditingPost(true)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Sửa">
                              <FiEdit2 />
                            </button>
                            <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Xóa">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
