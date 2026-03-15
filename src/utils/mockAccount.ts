// ── User Orders ───────────────────────────────────────────────────
export const orderTabs = [
  { id: 'all', label: 'Tất cả đơn' },
  { id: 'processing', label: 'Chờ xác nhận' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Đã giao' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const mockOrders = [
  {
    id: 'ORD-20231025-001',
    date: '25/10/2023',
    status: 'completed',
    total: 34990000,
    items: [
      {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        variant: 'Titan Tự nhiên',
        price: 34990000,
        quantity: 1,
        image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png',
      }
    ]
  },
  {
    id: 'ORD-20231101-042',
    date: '01/11/2023',
    status: 'shipping',
    total: 15990000,
    items: [
      {
        id: 2,
        name: 'iPad Air 5 M1 64GB',
        variant: 'Xanh dương',
        price: 15990000,
        quantity: 1,
        image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-air-5-m1-1.png',
      }
    ]
  },
  {
    id: 'ORD-20231105-112',
    date: '05/11/2023',
    status: 'processing',
    total: 4990000,
    items: [
      {
        id: 3,
        name: 'AirPods Pro 2',
        variant: 'Trắng',
        price: 4990000,
        quantity: 1,
        image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_169_1.png',
      }
    ]
  },
  {
    id: 'ORD-20230915-088',
    date: '15/09/2023',
    status: 'cancelled',
    total: 2490000,
    items: [
      {
        id: 4,
        name: 'Bàn phím cơ Keychron K8 Pro',
        variant: 'Brown Switch',
        price: 2490000,
        quantity: 1,
        image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/k/e/keychron-q1-he.png',
      }
    ]
  }
];

// ── Order Tracking Detail ─────────────────────────────────────────
export const mockOrderDetails = {
  id: 'ORD-20231101-042',
  date: '01/11/2023 14:30',
  status: 'shipping',
  total: 15990000,
  shippingFee: 30000,
  discount: 0,
  paymentMethod: 'Thẻ tín dụng (Visa **** 4242)',
  trackingNumber: 'GHTK123456789',
  shippingProvider: 'Giao Hàng Tiết Kiệm',
  estimatedDelivery: '04/11/2023',
  shippingAddress: {
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh'
  },
  items: [
    {
      id: 2,
      name: 'iPad Air 5 M1 64GB',
      variant: 'Xanh dương',
      price: 15990000,
      quantity: 1,
      image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-air-5-m1-1.png',
    }
  ],
  timeline: [
    { id: 1, status: 'Đơn hàng đã đặt', date: '01/11/2023 14:30', description: 'Đơn hàng của bạn đã được hệ thống ghi nhận.', completed: true },
    { id: 2, status: 'Đã xác nhận thanh toán', date: '01/11/2023 14:35', description: 'Thanh toán qua thẻ Visa thành công.', completed: true },
    { id: 3, status: 'Đang chuẩn bị hàng', date: '01/11/2023 16:00', description: 'Người bán đang chuẩn bị kiện hàng của bạn.', completed: true },
    { id: 4, status: 'Đã giao cho ĐVVC', date: '02/11/2023 09:15', description: 'Đơn hàng đã được giao cho đơn vị vận chuyển (GHTK).', completed: true },
    { id: 5, status: 'Đang giao hàng', date: '03/11/2023 08:30', description: 'Đơn hàng đang trên đường giao đến bạn.', completed: true, current: true },
    { id: 6, status: 'Giao hàng thành công', date: '', description: 'Đơn hàng đã được giao thành công.', completed: false },
  ]
};

// ── Vouchers ──────────────────────────────────────────────────────
export const mockVouchers = [
  {
    id: 1,
    code: 'HOZITECH100K',
    title: 'Giảm 100K cho đơn từ 1 Triệu',
    description: 'Áp dụng cho tất cả sản phẩm công nghệ.',
    expiry: '31/12/2026',
    type: 'discount',
    value: '100K',
    status: 'active',
    progress: 0,
    condition: 'Đơn tối thiểu 1.000.000đ',
  },
  {
    id: 5,
    code: 'HOZITECH50K',
    title: 'Giảm 50K cho đơn từ 500K',
    description: 'Áp dụng cho phụ kiện.',
    expiry: 'Hôm nay',
    type: 'discount',
    value: '50K',
    status: 'expiring',
    progress: 80,
    condition: 'Đơn tối thiểu 500.000đ',
  },
  {
    id: 2,
    code: 'FREESHIP50K',
    title: 'Miễn phí vận chuyển 50K',
    description: 'Áp dụng cho đơn hàng từ 500K.',
    expiry: '15/11/2026',
    type: 'shipping',
    value: '50K',
    status: 'active',
    progress: 50,
    condition: 'Đơn tối thiểu 500.000đ',
  },
  {
    id: 3,
    code: 'NEWUSER200K',
    title: 'Giảm 200K cho khách hàng mới',
    description: 'Áp dụng cho đơn hàng đầu tiên.',
    expiry: '01/10/2023',
    type: 'discount',
    value: '200K',
    status: 'used',
    progress: 100,
    condition: 'Khách hàng mới',
  },
  {
    id: 4,
    code: 'FLASH500K',
    title: 'Giảm 500K Flash Sale',
    description: 'Áp dụng cho các sản phẩm trong danh mục Flash Sale.',
    expiry: '01/09/2023',
    type: 'discount',
    value: '500K',
    status: 'expired',
    progress: 0,
    condition: 'Sản phẩm Flash Sale',
  }
];

// ── Reviews ───────────────────────────────────────────────────────
export const mockToReview = [
  {
    id: 101,
    productId: 3,
    productName: 'Tai nghe Bluetooth AirPods Pro 2',
    productImage: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_169_1.png',
    date: '12/03/2026',
    orderId: 'ORD-20260312-001'
  },
  {
    id: 102,
    productId: 4,
    productName: 'Chuột không dây Logitech MX Master 3S',
    productImage: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/h/chuot-logitech-g-pro-x-superlight-2-01.png',
    date: '10/03/2026',
    orderId: 'ORD-20260310-005'
  }
];

export const mockReviews = [
  {
    id: 1,
    productId: 1,
    productName: 'iPhone 15 Pro Max 256GB',
    productImage: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png',
    rating: 5,
    content: 'Sản phẩm tuyệt vời, giao hàng nhanh chóng. Đóng gói cẩn thận. Sẽ ủng hộ shop dài dài.',
    date: '20/10/2025',
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png', 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra.png'],
    reply: 'Cảm ơn bạn đã tin tưởng và ủng hộ Hozitech. Chúc bạn có trải nghiệm tuyệt vời với sản phẩm!',
  },
  {
    id: 2,
    productId: 2,
    productName: 'MacBook Air M2 2022',
    productImage: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:200:200/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-pro-14-2024-m4-1.png',
    rating: 4,
    content: 'Máy đẹp, mỏng nhẹ. Tuy nhiên pin không được trâu như quảng cáo.',
    date: '15/09/2025',
    images: [],
    reply: null,
  }
];

// ── Addresses ─────────────────────────────────────────────────────
export const mockAddresses = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Nguyễn Văn A (Công ty)',
    phone: '0987654321',
    address: 'Tòa nhà Bitexco, Số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    isDefault: false,
  },
];

// ── Payment Methods ───────────────────────────────────────────────
export const mockPaymentMethods = [
  {
    id: 1,
    type: 'visa',
    last4: '4242',
    expiry: '12/25',
    name: 'NGUYEN VAN A',
    isDefault: true,
  },
  {
    id: 2,
    type: 'mastercard',
    last4: '5555',
    expiry: '08/24',
    name: 'NGUYEN VAN A',
    isDefault: false,
  },
];

// ── FAQs ──────────────────────────────────────────────────────────
export const mockFaqs = [
  {
    id: 1,
    question: 'Làm thế nào để đổi trả sản phẩm?',
    answer: 'Bạn có thể yêu cầu đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng. Vui lòng truy cập mục "Đơn hàng của tôi", chọn đơn hàng cần đổi trả và làm theo hướng dẫn. Sản phẩm phải còn nguyên vẹn, đầy đủ phụ kiện và tem mác.'
  },
  {
    id: 2,
    question: 'Thời gian giao hàng dự kiến là bao lâu?',
    answer: 'Thời gian giao hàng thường từ 1-3 ngày làm việc đối với khu vực nội thành (Hà Nội, TP.HCM) và 3-5 ngày đối với các tỉnh thành khác. Bạn có thể theo dõi trạng thái đơn hàng trong mục "Theo dõi đơn hàng".'
  },
  {
    id: 3,
    question: 'Hozitech có hỗ trợ trả góp không?',
    answer: 'Có, chúng tôi hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng của hơn 20 ngân hàng và trả góp qua công ty tài chính. Bạn có thể chọn phương thức trả góp ở bước thanh toán.'
  },
  {
    id: 4,
    question: 'Làm sao để sử dụng mã giảm giá (Voucher)?',
    answer: 'Tại trang Giỏ hàng hoặc Thanh toán, bạn sẽ thấy ô "Nhập mã giảm giá". Hãy nhập mã hoặc chọn từ danh sách Voucher của bạn để được áp dụng ưu đãi.'
  }
];

// ── Admin Categories ──────────────────────────────────────────────
export const mockCategories = [
  { id: 1, name: 'Điện thoại', slug: 'dien-thoai', productCount: 150, status: 'active' },
  { id: 2, name: 'Laptop', slug: 'laptop', productCount: 85, status: 'active' },
  { id: 3, name: 'Tai nghe', slug: 'tai-nghe', productCount: 120, status: 'active' },
  { id: 4, name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', productCount: 45, status: 'inactive' },
  { id: 5, name: 'Phụ kiện', slug: 'phu-kien', productCount: 300, status: 'active' },
];
