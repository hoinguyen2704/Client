import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
} from "react-icons/fa";
import LogoIcon from "../ui/LogoIcon";
import { SHOP } from '@/constants/shopConstants';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Col 1: Brand & Contact */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3">
              <LogoIcon />
            <span className="text-2xl font-bold text-[#2539e6] dark:text-white">
              {SHOP.name}
            </span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-md leading-relaxed">
            {SHOP.name} là nền tảng thương mại điện tử chuyên cung cấp các sản phẩm
            công nghệ chính hãng, uy tín và chất lượng hàng đầu Việt Nam.
          </p>
          <div className="space-y-2 text-md">
            <p>
              <strong className="text-slate-800 dark:text-white">
                Địa chỉ:
              </strong>{" "}
              123 Đường Công Nghệ, Quận 1, TP.HCM
            </p>
            <p>
              <strong className="text-slate-800 dark:text-white">
                Điện thoại:
              </strong>{" "}
              1900 1234 (8:00 - 21:00)
            </p>
            <p>
              <strong className="text-slate-800 dark:text-white">Email:</strong>{" "}
              {SHOP.supportEmail}
            </p>
          </div>
        </div>

        {/* Col 2: Về chúng tôi */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-md">
            Về {SHOP.name}
          </h3>
          <ul className="space-y-3 text-md">
            <li>
              <Link
                to="/about"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Giới thiệu công ty
              </Link>
            </li>
            <li>
              <Link
                to="/careers"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Tuyển dụng
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Liên hệ hợp tác
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Hỗ trợ khách hàng */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-md">
            Hỗ trợ khách hàng
          </h3>
          <ul className="space-y-3 text-md">
            <li>
              <Link
                to="/support/shopping"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Hướng dẫn mua hàng
              </Link>
            </li>
            <li>
              <Link
                to="/support/payment"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Hướng dẫn thanh toán
              </Link>
            </li>
            <li>
              <Link
                to="/support/shipping"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Chính sách giao hàng
              </Link>
            </li>
            <li>
              <Link
                to="/support/warranty"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Chính sách bảo hành
              </Link>
            </li>
            <li>
              <Link
                to="/support/returns"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Chính sách đổi trả
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Kết nối & Thanh toán */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-md">
            Kết nối với chúng tôi
          </h3>
          <div className="flex gap-4 mb-8">
            <a
              href="https://www.facebook.com/hoinguyen.2704"
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all"
            >
              <FaFacebook className="text-xl" />
            </a>
            <a
              href="https://www.youtube.com/@hozinium"
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all"
            >
              <FaYoutube className="text-xl" />
            </a>
            <a
              href="https://www.tiktok.com/@hozinium"
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white transition-all"
            >
              <FaTiktok className="text-xl" />
            </a>
            <a
              href="https://www.instagram.com/hoinguyen.2704"
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white transition-all"
            >
              <FaInstagram className="text-xl" />
            </a>
          </div>

          <h3 className="text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-md">
            Phương thức thanh toán
          </h3>
          <div className="flex gap-3 text-3xl text-slate-400 dark:text-slate-500">
            <FaCcVisa className="hover:text-blue-600 dark:hover:text-white transition-colors" />
            <FaCcMastercard className="hover:text-orange-500 dark:hover:text-white transition-colors" />
            <FaCcPaypal className="hover:text-blue-500 dark:hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 lg:pl-12 lg:pr-25 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-md text-slate-500">
        <p>{SHOP.copyright}</p>
        <p>Thiết kế và phát triển bởi Hội Nguyễn</p>
      </div>
    </footer>
  );
}
