import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Giới thiệu về Hozitech</h1>
      
      <div className="prose prose-blue max-w-none dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Về chúng tôi</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Hozitech là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm công nghệ, thiết bị điện tử, linh kiện máy tính và phụ kiện chính hãng. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng cao với giá cả cạnh tranh nhất trên thị trường.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Được thành lập với sứ mệnh kết nối người tiêu dùng với những công nghệ tiên tiến nhất, Hozitech không ngừng nỗ lực cải thiện chất lượng dịch vụ, đa dạng hóa sản phẩm và tối ưu hóa trải nghiệm mua sắm trực tuyến.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tầm nhìn & Sứ mệnh</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Tầm nhìn:</strong> Trở thành điểm đến mua sắm công nghệ số 1 tại Việt Nam, nơi khách hàng có thể tìm thấy mọi thứ họ cần với sự an tâm tuyệt đối.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Sứ mệnh:</strong> Mang công nghệ đến gần hơn với mọi người bằng cách cung cấp các sản phẩm chất lượng, dịch vụ tận tâm và trải nghiệm mua sắm tuyệt vời.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Về chủ sở hữu</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Hozitech được sáng lập và điều hành bởi đội ngũ những người đam mê công nghệ, có nhiều năm kinh nghiệm trong lĩnh vực bán lẻ thiết bị điện tử và thương mại điện tử. Chúng tôi hiểu rõ nhu cầu của khách hàng và luôn đặt lợi ích của người tiêu dùng lên hàng đầu.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tại sao chọn Hozitech?</h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
            <li>Sản phẩm chính hãng 100%, nguồn gốc xuất xứ rõ ràng.</li>
            <li>Chính sách bảo hành uy tín, hỗ trợ đổi trả dễ dàng.</li>
            <li>Đội ngũ tư vấn nhiệt tình, chuyên môn cao.</li>
            <li>Giao hàng nhanh chóng trên toàn quốc.</li>
            <li>Nhiều chương trình khuyến mãi và ưu đãi hấp dẫn.</li>
          </ul>
        </section>

        <div className="mt-12 text-center">
          <Link to="/contact" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Liên hệ với chúng tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
