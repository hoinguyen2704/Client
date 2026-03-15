// ===== Customers =====
export const mockCustomers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0987654321', totalOrders: 12, totalSpent: 154000000, status: 'active', joinDate: '15/01/2023', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', totalOrders: 5, totalSpent: 45000000, status: 'active', joinDate: '20/03/2023', avatar: 'https://i.pravatar.cc/100?img=5' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0909090909', totalOrders: 1, totalSpent: 4990000, status: 'banned', joinDate: '05/11/2023', avatar: 'https://i.pravatar.cc/100?img=8' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0988888888', totalOrders: 0, totalSpent: 0, status: 'active', joinDate: '10/11/2023', avatar: 'https://i.pravatar.cc/100?img=15' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '0977777777', totalOrders: 24, totalSpent: 320000000, status: 'vip', joinDate: '01/12/2022', avatar: 'https://i.pravatar.cc/100?img=22' },
];

// ===== Customer Detail =====
export const mockCustomerDetail = {
  id: 1,
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0987654321',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
  joinDate: '15/01/2023',
  status: 'active',
  avatar: 'https://i.pravatar.cc/150?img=1',
  stats: {
    totalOrders: 12,
    totalSpent: 154000000,
    averageOrderValue: 12833333,
    rank: 'Khách hàng VIP'
  },
  recentOrders: [
    { id: 'ORD-20231025-001', date: '25/10/2023', total: 34990000, status: 'delivered', items: 2 },
    { id: 'ORD-20230915-088', date: '15/09/2023', total: 2490000, status: 'delivered', items: 1 },
    { id: 'ORD-20230802-045', date: '02/08/2023', total: 15990000, status: 'cancelled', items: 1 },
  ]
};

// ===== Orders =====
export const mockAdminOrders = [
  { id: 'ORD-20231025-001', customer: 'Nguyễn Văn A', phone: '0987654321', date: '25/10/2023 14:30', total: 34990000, status: 'delivered', payment: 'Thẻ tín dụng' },
  { id: 'ORD-20231101-042', customer: 'Trần Thị B', phone: '0912345678', date: '01/11/2023 09:15', total: 15990000, status: 'pending', payment: 'COD' },
  { id: 'ORD-20231105-112', customer: 'Lê Văn C', phone: '0909090909', date: '05/11/2023 16:45', total: 4990000, status: 'shipping', payment: 'Chuyển khoản' },
  { id: 'ORD-20230915-088', customer: 'Phạm Thị D', phone: '0988888888', date: '15/09/2023 10:20', total: 2490000, status: 'cancelled', payment: 'COD' },
  { id: 'ORD-20231110-005', customer: 'Hoàng Văn E', phone: '0977777777', date: '10/11/2023 11:00', total: 20990000, status: 'verified', payment: 'Thẻ tín dụng' },
];

// ===== Order Detail =====
export const mockOrderDetails = {
  id: 'ORD-20231101-042',
  date: '01/11/2023 14:30',
  status: 'pending',
  total: 15990000,
  subtotal: 15990000,
  shippingFee: 30000,
  discount: 30000,
  paymentMethod: 'Thanh toán khi nhận hàng (COD)',
  paymentStatus: 'Chưa thanh toán',
  customer: {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    totalOrders: 5,
  },
  shippingAddress: {
    name: 'Trần Thị B',
    phone: '0912345678',
    address: '456 Đường DEF, Phường UVW, Quận 3, TP. Hồ Chí Minh'
  },
  items: [
    {
      id: 2,
      name: 'iPad Air 5 M1 64GB',
      variant: 'Xanh dương',
      price: 15990000,
      quantity: 1,
      image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:100:100/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-air-5-m1-1.png',
      sku: 'IPAD-AIR5-BLU-64'
    }
  ],
  notes: 'Giao hàng trong giờ hành chính giúp mình nhé.'
};

// ===== Products (Admin) =====
export const mockAdminProducts = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', category: 'Điện thoại', price: 34990000, stock: 150, status: 'active', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png' },
  { id: 2, name: 'MacBook Air M2 2022', category: 'Laptop', price: 26990000, stock: 45, status: 'active', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-pro-14-2024-m4-1.png' },
  { id: 3, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 4990000, stock: 0, status: 'out_of_stock', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_169_1.png' },
  { id: 4, name: 'iPad Pro 11 inch M2', category: 'Tablet', price: 20990000, stock: 20, status: 'hidden', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-air-5-m1-1.png' },
  { id: 5, name: 'Samsung Galaxy S24 Ultra', category: 'Điện thoại', price: 33990000, stock: 85, status: 'active', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra.png' },
];

// ===== Feedbacks (Reviews) =====
export const mockAdminReviews = [
  { id: 1, product: 'iPhone 15 Pro Max', customer: 'Nguyễn Văn A', rating: 5, content: 'Sản phẩm rất tuyệt vời, giao hàng nhanh chóng. Đóng gói cẩn thận.', date: '20/10/2023', status: 'approved', images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png'] },
  { id: 2, product: 'MacBook Pro M3', customer: 'Trần Thị B', rating: 4, content: 'Máy đẹp, chạy mượt nhưng giá hơi cao. Pin trâu.', date: '19/10/2023', status: 'pending', images: [] },
  { id: 3, product: 'AirPods Pro 2', customer: 'Lê Văn C', rating: 1, content: 'Tai nghe bị rè một bên, yêu cầu đổi trả ngay lập tức. Rất thất vọng về chất lượng.', date: '18/10/2023', status: 'hidden', images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_169_1.png', 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra.png'] },
  { id: 4, product: 'Samsung S24 Ultra', customer: 'Phạm D', rating: 5, content: 'Link mua hàng giá rẻ tại đây: http://spam-link.com', date: '17/10/2023', status: 'spam', images: [] },
];

// ===== Categories =====
export const initialCategories = [
  { id: 1, name: 'Điện thoại', slug: 'dien-thoai', productCount: 150, status: 'active' },
  { id: 2, name: 'Laptop', slug: 'laptop', productCount: 85, status: 'active' },
  { id: 3, name: 'Tai nghe', slug: 'tai-nghe', productCount: 120, status: 'active' },
  { id: 4, name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', productCount: 45, status: 'inactive' },
  { id: 5, name: 'Phụ kiện', slug: 'phu-kien', productCount: 300, status: 'active' },
];

// ===== Tickets =====
export const mockTickets = [
  { id: 'TKT-1024', customer: 'Nguyễn Văn A', subject: 'Sản phẩm bị lỗi màn hình', status: 'open', priority: 'high', date: '20/10/2023 14:30' },
  { id: 'TKT-1023', customer: 'Trần Thị B', subject: 'Hỏi về chính sách bảo hành', status: 'in_progress', priority: 'medium', date: '19/10/2023 09:15' },
  { id: 'TKT-1022', customer: 'Lê Văn C', subject: 'Yêu cầu xuất hóa đơn đỏ', status: 'open', priority: 'low', date: '18/10/2023 16:45' },
  { id: 'TKT-1021', customer: 'Phạm D', subject: 'Thay đổi địa chỉ giao hàng', status: 'closed', priority: 'medium', date: '17/10/2023 10:20' },
];

export const mockChatHistory = [
  { id: 1, sender: 'customer', name: 'Nguyễn Văn A', time: '14:30', text: 'Chào shop, mình mới nhận được điện thoại hôm qua nhưng màn hình bị sọc xanh. Mình muốn đổi trả thì làm thế nào ạ?' },
  { id: 2, sender: 'customer', name: 'Nguyễn Văn A', time: '14:31', text: 'Đây là hình ảnh sản phẩm ạ.', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png' },
  { id: 3, sender: 'admin', name: 'Admin Support', time: '14:45', text: 'Chào bạn, shop rất xin lỗi về sự cố bạn gặp phải. Bạn vui lòng cung cấp mã đơn hàng để shop kiểm tra và hướng dẫn thủ tục đổi trả nhé.' },
];

// ===== CMS =====
export const mockBanners = [
  { id: 1, title: 'Khuyến mãi mùa hè', link: '/sale-summer', order: 1, status: 'visible', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=300&fit=crop' },
  { id: 2, title: 'Ra mắt iPhone 15', link: '/iphone-15', order: 2, status: 'visible', image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&h=300&fit=crop' },
  { id: 3, title: 'Giảm giá phụ kiện', link: '/accessories', order: 3, status: 'hidden', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=300&fit=crop' },
];

export const mockPosts = [
  { id: 1, title: 'Đánh giá chi tiết iPhone 15 Pro Max sau 1 tháng sử dụng', author: 'Admin', category: 'Review', date: '20/10/2023', status: 'published' },
  { id: 2, title: 'Top 5 laptop sinh viên đáng mua nhất 2023', author: 'Content Team', category: 'Tư vấn', date: '18/10/2023', status: 'published' },
  { id: 3, title: 'Hướng dẫn vệ sinh tai nghe AirPods đúng cách', author: 'Admin', category: 'Thủ thuật', date: '15/10/2023', status: 'draft' },
];

// ===== Vouchers =====
export const mockVouchers = [
  { id: 1, code: 'HOZITECH100K', type: 'discount', value: '100,000đ', minOrder: '1,000,000đ', usageLimit: 100, used: 45, startDate: '01/11/2023', endDate: '31/12/2023', status: 'active' },
  { id: 2, code: 'FREESHIP50K', type: 'shipping', value: '50,000đ', minOrder: '500,000đ', usageLimit: 500, used: 480, startDate: '01/10/2023', endDate: '15/11/2023', status: 'active' },
  { id: 3, code: 'NEWUSER200K', type: 'discount', value: '200,000đ', minOrder: '0đ', usageLimit: 1000, used: 1000, startDate: '01/01/2023', endDate: '31/12/2023', status: 'expired' },
  { id: 4, code: 'FLASH500K', type: 'discount', value: '500,000đ', minOrder: '5,000,000đ', usageLimit: 50, used: 12, startDate: '11/11/2023', endDate: '12/11/2023', status: 'scheduled' },
];

// ===== Promotions =====
export const mockPromotions = [
  { id: 1, name: 'Siêu Sale 11.11', type: 'Giảm giá toàn sàn', value: 'Lên đến 50%', startDate: '10/11/2023', endDate: '12/11/2023', status: 'active' },
  { id: 2, name: 'Black Friday', type: 'Flash Sale', value: 'Đồng giá 99k', startDate: '24/11/2023', endDate: '26/11/2023', status: 'scheduled' },
  { id: 3, name: 'Mừng Xuân Mới', type: 'Tặng quà', value: 'Tặng tai nghe', startDate: '01/01/2023', endDate: '15/01/2023', status: 'expired' },
];

// ===== Home Banners =====
export const homeBanners = [
  { id: 1, image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=400&fit=crop', title: 'Siêu Sale Công Nghệ', subtitle: 'Giảm đến 50%' },
  { id: 2, image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1200&h=400&fit=crop', title: 'Laptop Gaming Mới', subtitle: 'Tặng kèm balo & chuột' },
  { id: 3, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&h=400&fit=crop', title: 'Apple Week', subtitle: 'Ưu đãi độc quyền' },
];
