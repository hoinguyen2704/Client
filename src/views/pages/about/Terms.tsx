import React from 'react';
import { SHOP } from '@/constants/shopConstants';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Điều khoản sử dụng</h1>
      
      <div className="prose prose-blue max-w-none dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Chào mừng bạn đến với {SHOP.name}. Khi truy cập và sử dụng trang web của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Chấp nhận điều khoản</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Bằng việc truy cập, duyệt hoặc sử dụng trang web {SHOP.name}, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này cũng như Chính sách bảo mật của chúng tôi. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng trang web.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Quyền và trách nhiệm của người dùng</h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>Bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản hoặc đặt hàng.</li>
            <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình.</li>
            <li>Không sử dụng trang web cho các mục đích bất hợp pháp, lừa đảo hoặc vi phạm quyền của bên thứ ba.</li>
            <li>Không can thiệp, phá hoại hoặc làm gián đoạn hoạt động của trang web và hệ thống máy chủ.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Thông tin sản phẩm và giá cả</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chúng tôi luôn cố gắng cung cấp thông tin sản phẩm và giá cả chính xác nhất. Tuy nhiên, sai sót vẫn có thể xảy ra. Trong trường hợp giá sản phẩm hiển thị không chính xác do lỗi hệ thống, chúng tôi có quyền từ chối hoặc hủy các đơn hàng đối với sản phẩm đó và sẽ thông báo cho bạn.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Chính sách thanh toán và giao hàng</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Các quy định chi tiết về phương thức thanh toán, thời gian và chi phí giao hàng được quy định cụ thể tại các trang chính sách tương ứng trên website. Bằng việc đặt hàng, bạn đồng ý với các chính sách này.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Quyền sở hữu trí tuệ</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Mọi nội dung trên trang web này, bao gồm nhưng không giới hạn ở văn bản, hình ảnh, logo, video và mã nguồn, đều thuộc sở hữu của {SHOP.name} hoặc các nhà cung cấp nội dung của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Thay đổi điều khoản</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {SHOP.name} có quyền sửa đổi, cập nhật các Điều khoản sử dụng này bất cứ lúc nào mà không cần báo trước. Việc bạn tiếp tục sử dụng trang web sau khi các thay đổi được đăng tải đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>
    </div>
  );
}
