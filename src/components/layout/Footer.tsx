import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
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
import useShopStore from '@/stores/useShopStore';

const SOCIAL_LINK_CLASS =
  "w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-body-soft flex items-center justify-center transition-all";

export default function Footer() {
  const { t } = useTranslation('layout');
  const { shop, fetchShopInfo } = useShopStore();
  useEffect(() => { fetchShopInfo(); }, [fetchShopInfo]);

  return (
    <footer className="bg-white dark:bg-slate-900 text-body-soft pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Col 1: Brand & Contact */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3">
              <LogoIcon />
            <span className="text-2xl font-bold text-[#2539e6] dark:text-white">
              {shop.shopName}
            </span>
          </Link>
          <p className="text-muted text-md leading-relaxed">
            {t('footer.brandDescription', { shopName: shop.shopName })}
          </p>
          <div className="space-y-2 text-md">
            <p>
              <strong className="text-slate-800 dark:text-white">
                {t('footer.address')}:
              </strong>{" "}
              {shop.address}
            </p>
            <p>
              <strong className="text-slate-800 dark:text-white">
                {t('footer.phone')}:
              </strong>{" "}
              {shop.hotline}
            </p>
            <p>
              <strong className="text-slate-800 dark:text-white">{t('footer.email')}:</strong>{" "}
              {shop.supportEmail}
            </p>
          </div>
        </div>

        {/* Col 2: Về chúng tôi */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-md">
            {t('footer.aboutTitle', { shopName: shop.shopName })}
          </h3>
          <ul className="space-y-3 text-md">
            <li>
              <Link
                to="/about"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.company')}
              </Link>
            </li>
            <li>
              <Link
                to="/careers"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.careers')}
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.terms')}
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.partnership')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Hỗ trợ khách hàng */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-md">
            {t('footer.supportTitle')}
          </h3>
          <ul className="space-y-3 text-md">
            <li>
              <Link
                to="/support/shopping"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.shoppingGuide')}
              </Link>
            </li>
            <li>
              <Link
                to="/support/payment"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.paymentGuide')}
              </Link>
            </li>
            <li>
              <Link
                to="/support/shipping"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.shippingPolicy')}
              </Link>
            </li>
            <li>
              <Link
                to="/support/warranty"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.warrantyPolicy')}
              </Link>
            </li>
            <li>
              <Link
                to="/support/returns"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {t('footer.returnPolicy')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Kết nối & Thanh toán */}
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-md">
            {t('footer.connectTitle')}
          </h3>
          <div className="flex gap-4 mb-8">
            <a
              href="https://www.facebook.com/hoinguyen.2704"
              className={`${SOCIAL_LINK_CLASS} hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white`}
            >
              <FaFacebook className="text-xl" />
            </a>
            <a
              href="https://www.youtube.com/@hozinium"
              className={`${SOCIAL_LINK_CLASS} hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white`}
            >
              <FaYoutube className="text-xl" />
            </a>
            <a
              href="https://www.tiktok.com/@hozinium"
              className={`${SOCIAL_LINK_CLASS} hover:bg-black hover:text-white dark:hover:bg-black dark:hover:text-white`}
            >
              <FaTiktok className="text-xl" />
            </a>
            <a
              href="https://www.instagram.com/hoinguyen.2704"
              className={`${SOCIAL_LINK_CLASS} hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white`}
            >
              <FaInstagram className="text-xl" />
            </a>
          </div>

          <h3 className="text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-md">
            {t('footer.paymentTitle')}
          </h3>
          <div className="flex gap-3 text-3xl text-subtle">
            <FaCcVisa className="hover:text-blue-600 dark:hover:text-white transition-colors" />
            <FaCcMastercard className="hover:text-orange-500 dark:hover:text-white transition-colors" />
            <FaCcPaypal className="hover:text-blue-500 dark:hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 lg:pl-12 lg:pr-25 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-md text-slate-500">
        <p>{t('footer.rightsReserved', { year: new Date().getFullYear(), shopName: shop.shopName })}</p>
        <p>{t('footer.builtBy')}</p>
      </div>
    </footer>
  );
}
