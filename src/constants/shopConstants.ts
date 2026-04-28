/**
 * Store information — single source of truth for the frontend.
 * Update this file when the shop name or branding changes.
 */
export const SHOP = {
  name: 'Hozitech',
  fullName: 'HoziTech',
  slogan: 'Leading tech store',
  email: 'hozinium@gmail.com',
  supportEmail: 'support@hozitech.com',
  hotline: '0828443833',
  address: '132 Cầu Diễn, Hà Nội',
  website: 'https://hozitech.com',
  copyright: `© ${new Date().getFullYear()} Hozitech. All rights reserved.`,
} as const;
