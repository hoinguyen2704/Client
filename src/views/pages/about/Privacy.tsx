import React from 'react';
import { SHOP } from '@/constants/shopConstants';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Chính sách bảo mật</h1>
      
      <div className="prose prose-blue max-w-none dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {SHOP.name} tôn trọng và cam kết bảo vệ dữ liệu cá nhân của người dùng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng trang web và dịch vụ của chúng tôi.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Thu thập thông tin cá nhân</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Chúng tôi có thể thu thập các thông tin sau từ bạn:</p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li><strong>Thông tin định danh:</strong> Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng.</li>
            <li><strong>Thông tin tài khoản:</strong> Tên đăng nhập, mật khẩu (được mã hóa), lịch sử mua hàng.</li>
            <li><strong>Thông tin thanh toán:</strong> Chi tiết thẻ tín dụng/ghi nợ hoặc thông tin tài khoản ngân hàng (được xử lý an toàn qua cổng thanh toán của bên thứ ba).</li>
            <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành, thông tin thiết bị và dữ liệu cookie.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Mục đích sử dụng thông tin</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Thông tin cá nhân của bạn được sử dụng cho các mục đích:</p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>Xử lý đơn hàng, giao hàng và cung cấp dịch vụ hỗ trợ khách hàng.</li>
            <li>Quản lý tài khoản người dùng và xác thực danh tính.</li>
            <li>Cải thiện trải nghiệm người dùng và tối ưu hóa giao diện trang web.</li>
            <li>Gửi thông báo về tình trạng đơn hàng, cập nhật chính sách hoặc các chương trình khuyến mãi (nếu bạn đồng ý nhận).</li>
            <li>Phát hiện, ngăn chặn các hoạt động gian lận và bảo vệ an ninh hệ thống.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Chia sẻ thông tin</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chúng tôi không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:
          </p>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mt-2">
            <li>Với các đối tác cung cấp dịch vụ (đơn vị vận chuyển, cổng thanh toán) để thực hiện đơn hàng.</li>
            <li>Khi có yêu cầu hợp pháp từ các cơ quan chức năng có thẩm quyền theo quy định của pháp luật.</li>
            <li>Để bảo vệ quyền lợi, tài sản hoặc sự an toàn của {SHOP.name} và người dùng khác.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Bảo mật dữ liệu</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chúng tôi áp dụng các biện pháp kỹ thuật và an ninh phù hợp để bảo vệ thông tin cá nhân của bạn khỏi việc truy cập, sử dụng, thay đổi hoặc tiết lộ trái phép. Tuy nhiên, không có phương thức truyền tải dữ liệu qua internet nào là an toàn 100%, do đó chúng tôi không thể đảm bảo an ninh tuyệt đối.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Quyền của người dùng</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất cứ lúc nào thông qua phần quản lý tài khoản hoặc bằng cách liên hệ trực tiếp với bộ phận hỗ trợ khách hàng của chúng tôi.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Liên hệ</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua trang Liên hệ hoặc gửi email đến địa chỉ hỗ trợ của {SHOP.name}.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>
    </div>
  );
}
