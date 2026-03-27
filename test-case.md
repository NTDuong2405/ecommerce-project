# 🧪 VibeCart - Master Test Case Documentation

Tài liệu này dùng để kiểm duyệt (QA/QC) toàn bộ luồng nghiệp vụ của dự án VibeCart phiên bản 3.0.

---

## 🛒 1. Customer Shopping Flow (Khách hàng)

| ID | Test Case | Expected Result (Kết quả kỳ vọng) |
| :--- | :--- | :--- |
| **TC.C1** | Responsive Trang chủ | Mọi thành phần (Hero, Features, Product Grid) phải hiển thị đúng layout trên Mobile (375px), Tablet (768px) và Desktop. |
| **TC.C2** | Đa ngôn ngữ (i18n Sweep) | Chuyển EN: Toàn bộ Navbar, Footer, Toast thông báo, Tooltip Zalo, và trang Theo dõi đơn hàng phải đổi sang Tiếng Anh. |
| **TC.C3** | Tỷ giá Dynamic | Giá sản phẩm VND -> USD phải được chia theo tỉ giá thực tế (lấy từ API). Không bị lỗi nhân tỉ giá 2 lần (tiền tỷ). |
| **TC.C4** | Logic Giỏ hàng | Thêm sản phẩm cùng Size/Màu thì tăng số lượng. Thêm khác Size/Màu thì tách thành 2 dòng riêng biệt. |
| **TC.C5** | Checkout & Phí Ship | Tổng đơn > 150$ (hoặc 3.750.000đ) thì phí vận chuyển hiển thị "Miễn phí" (Free). Ngược lại tính phí ship mặc định. |
| **TC.C6** | Card Cân nặng (Smart Select) | Click mốc "50kg - 60kg" trên trang chi tiết -> Hệ thống tự động chọn Size M và highlight màu xanh indigo. |
| **TC.C7** | Deep Selection Sync | Giỏ hàng chọn (Size XL, Màu Đen) -> Click vào sản phẩm -> Trang chi tiết load lên phải tự động chọn sẵn XL và Đen. |
| **TC.C8** | Tracking Đơn hàng | Nhập mã đơn (Ví dụ: 1024) + Số điện thoại -> Hiện chi tiết đơn hàng, danh sách món đồ và tiến trình (PENDING/SHIPPING/...). |
| **TC.C9** | Navigation Mega Menu | Di chuột qua menu Sản phẩm hiện đúng 3 cột phân loại. Click Sub-category lọc đúng danh sách sản phẩm tương ứng. |
| **TC.C10** | Live ChatBox | Khách hàng nhắn tin -> Hiện thông báo "Đã nhận". Tin nhắn hiển thị tức thời khi Admin trả lời qua Socket.io. |

---

## 👩‍💼 2. Admin & Staff Management (Quản trị)

| ID | Test Case | Expected Result (Kết quả kỳ vọng) |
| :--- | :--- | :--- |
| **TC.A1** | Role-based Login | Admin login thấy Stats doanh thu. Staff login chỉ thấy Orders/Inventory/Chat (bị ẩn stats tài chính). |
| **TC.A2** | QL Sản phẩm (Mobile) | Danh sách sản phẩm trên màn hình nhỏ chuyển sang dạng Card (Thẻ) thay vì bảng ngang để tránh bị vỡ khung. |
| **TC.A3** | Dashboard Analytics | Biểu đồ doanh thu 7 ngày phải load đúng dữ liệu từ DB (Prama). Best Sellers liệt kê đúng top sản phẩm bán chạy. |
| **TC.A4** | Inventory Hotlist | Sản phẩm hết hàng (Stock = 0) phải hiện nhãn "Hết hàng" màu đỏ đậm và ưu tiên đẩy lên danh sách cảnh báo. |
| **TC.A5** | Excel Power Tools | Xuất file mẫu -> Điền thông tin -> Import. Hệ thống phải nhận diện được các cột Phân loại và Bảng size. |
| **TC.A6** | Phản hồi Chat | Admin chọn hội thoại của khách -> Trả lời. Khách nhận được tin nhắn ngay lập tức mà không cần F5. |

---

## ⚙️ 3. Security & Stability (Hệ thống)

| ID | Test Case | Expected Result (Kết quả kỳ vọng) |
| :--- | :--- | :--- |
| **TC.S1** | Protected Routes | Cố tình truy cập `/admin` khi chưa login (hoặc login tài khoản USER) phải bị chuyển hướng (Redirect) về `/admin/login`. |
| **TC.S2** | Socket.io Sync | Mở 2 cửa sổ. Admin edit Stock 50 -> 0. Cửa sổ Khách hàng ở Home/Product phải thấy nhãn "Sold Out" hiện lên ngay sau 1-2 giây. |
| **TC.S3** | Custom Validation | Để trống Email khi Register -> Input hiện viền đỏ rực và thông báo "Vui lòng nhập email" bằng tiếng Việt/Anh chuẩn. |
| **TC.S4** | API Robustness | Test API `/orders/track` với mã đơn không tồn tại -> Trả về lỗi 404 kèm message "Không tìm thấy đơn hàng" thân thiện với UX. |

---
🔍 *Tài liệu kiểm định v3.0 được tối ưu hóa toàn diện bởi Antigravity vào ngày 27/03/2026.*
