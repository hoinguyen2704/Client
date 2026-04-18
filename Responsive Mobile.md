# Kế Hoạch Responsive Mobile Cho Storefront + Checkout

## Summary
- Phạm vi triển khai là luồng khách hàng trên điện thoại: home, listing/search, wishlist/flash sale, product detail, cart, checkout; không gồm admin.
- Mục tiêu là triệt tiêu vỡ layout ở viewport 320-430px, bỏ horizontal overflow toàn trang, và chặn mọi trường hợp FAB/chat đè lên CTA mua hàng.
- Baseline hiện tại ổn định về build: `npm run lint` và `npm run build` đang pass, nên có thể triển khai như một đợt refactor UI riêng.

## Implementation Changes
- Thiết lập policy breakpoint theo mobile-first: base cho 320-389px, `min-[390px]` mở 2 cột cho grid sản phẩm, `md` và `lg` giữ lại bố cục tablet/desktop. Thêm lớp chống tràn ngang ở layout gốc và chừa `padding-bottom` mobile để vùng có FAB không đè nội dung cuối trang.
- Chuẩn hóa layout shared ở storefront: mobile header chỉ giữ logo + các action chính + menu, các action phụ như wishlist/account/search chuyển vào mobile menu hoặc search sheet; nav ngang vẫn ẩn dưới `md`.
- Sửa toàn bộ module listing dùng `ProductCard`: bỏ `min-w-[240px]/[280px]` trong grid mode, đổi sang `grid-cols-1 min-[390px]:grid-cols-2 md:grid-cols-3 ...`, giảm density card ở base breakpoint, cho price/status wrap an toàn, và đảm bảo CTA trong card không bị squeeze/truncate gây vỡ hàng.
- Với các section đang “giả scroll” bằng grid + `min-w`, đổi về đúng hành vi: mobile là danh sách ngang snap-scroll, từ `md` trở lên mới quay lại grid nếu cần.
- Ở `ProductDetail`, ép gallery + info về 1 cột ở mobile, bỏ giới hạn width gây lệch, giữ thumbnail strip là horizontal scroll, và cho block giá dùng full width thay vì `inline-flex max-w`.
- Refactor `VariantSelector` từ `flex-wrap + min-w` sang grid responsive với `min-w-0`, button full-width trong ô, text được wrap; quantity/helper/clear action xếp dọc ở phone; cụm wishlist/add-to-cart/buy-now xếp thành 1 cột dưới `sm`, trở lại hàng ngang từ `sm`.
- `ProductTabs` chuyển tab header sang kiểu horizontal-scroll/slide để không ép 3 tab cùng chiều rộng trên phone. Phần specs dùng card key/value ở mobile và chỉ giữ table từ `md`; rich description phải ép ảnh/video/table về `max-width: 100%` và bọc overflow cục bộ nếu có bảng rộng.
- `MainLayout` trở thành điểm điều phối chat mobile: dưới `640px` chỉ render đúng 1 launcher, với guest ưu tiên AI chatbot và user đăng nhập ưu tiên support chat; desktop giữ nguyên. Popup chat dùng cùng offset/safe-area chuẩn để không che CTA và không chạm mép máy.
- `Cart` và `Checkout` giữ luồng 1 cột trên mobile, summary chỉ sticky từ desktop, hàng item trong cart đẩy quantity/delete xuống dưới content thay vì ép nằm ngang, và các hàng coupon/tổng tiền dùng `min-w-0` + wrap-safe để không kéo tràn viewport.

## Interfaces / Public APIs
- Không thay đổi backend API, route, schema dữ liệu hay type contract public.
- Nếu cần, chỉ thêm helper/hook nội bộ để `MainLayout` nhận biết viewport mobile và quyết định launcher chat duy nhất.

## Test Plan
- Kiểm tra thủ công ở các viewport: `320x568`, `375x812`, `390x844`, `430x932`, `768x1024`.
- Cover các màn: home, products, search, wishlist/flash sale, product detail có nhiều thuộc tính và specs dài, cart với tên sản phẩm dài, checkout có coupon + address list, guest mobile, logged-in user mobile.
- Acceptance criteria: không còn horizontal scroll toàn trang, header không wrap/clipped, card sản phẩm đọc được và CTA bấm được, variant/spec tabs không tràn, chat launcher không che CTA mua hàng, và sau khi sửa vẫn pass `npm run lint` + `npm run build`.

## Assumptions
- Mật độ mặc định trên phone là 1 card mỗi hàng dưới `390px`, từ `390px` trở lên là 2 card mỗi hàng.
- Đây là đợt ổn định responsive, không đổi visual direction tổng thể của storefront.
- Admin responsive issues để dành cho iteration khác.
