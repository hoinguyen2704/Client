/**
 * Thông tin cửa hàng — Single source of truth cho toàn bộ frontend.
 * Khi đổi tên/branding chỉ cần sửa file này.
 */
export const SHOP = {
  name: 'Hozitech',
  fullName: 'HoziTech',
  slogan: 'Cửa hàng công nghệ hàng đầu',
  email: 'hozinium@gmail.com',
  supportEmail: 'support@hozitech.com',
  hotline: '0889452997',
  address: '132 Cầu Diễn, ',
  website: 'https://hozitech.com',
  copyright: `© ${new Date().getFullYear()} Hozitech. All rights reserved.`,
} as const;
