# 🧪 VibeCart - Master Test Case Documentation

Tài liệu này dùng để kiểm duyệt (QA/QC) toàn bộ luồng nghiệp vụ của dự án VibeCart.

---

## 🛒 1. Customer Shopping Flow (Luồng khách hàng)

| ID | Test Case | Expected Result (Kết quả kỳ vọng) | Status |
| :--- | :--- | :--- | :---: |
| **TC.C1** | Kiểm tra Responsive Trang chủ | Hiển thị Banner Hero, Features và Sản phẩm Trending mượt mà trên Mobile/Tablet. | [⚠️] |
| **TC.C2** | Chuyển đổi Ngôn ngữ (Switch VN/EN) | Sau khi click đổi tiếng, Header, Footer và TOÀN BỘ GIÁ SẢN PHẨM phải cập nhật đúng ngôn ngữ/tỉ giá. | [⚠️] |
| **TC.C3** | Tỉ giá Động (Dynamic Rate) | Khi truy cập, tỉ giá VND/USD phải khớp với thị trường thực tế (không phải cứng 25.000đ). | [✅] |
| **TC.C4** | Thêm sản phẩm vào Giỏ hàng | Clicking "Add to Cart" hiển thị Toast thông báo và Badge ở giỏ hàng tăng số lượng tức thì. | [✅] |
| **TC.C5** | Checkout & Khuyến mãi | Giá cũ gạch ngang, giá mới hiển thị rõ. Phí ship miễn phí nếu đơn hàng trên 150$. | [✅] |
| **TC.C6** | Chọn Biến thể & Cân nặng | Click vào Card cân nặng -> Hệ thống chọn Size tương ứng và highlight xanh. | [✅] |
| **TC.C7** | Link ngược từ Giỏ hàng | Giỏ hàng -> Click sản phẩm -> Trang chi tiết load đúng Size/Màu đã chọn. | [✅] |
| **TC.C8** | Theo dõi đơn hàng (Tracking) | Nhập mã đơn hàng và xem được trạng thái (PENDING -> SHIPPING -> ...) real-time. | [⚠️] |
| **TC.C9** | Mega Menu 3 Tầng & Hover | Di chuột vào 'Products' hiện 3 cột (Main -> Sub -> Hot Items). Dữ liệu mượt mà, không giật lag. | [✅] |
| **TC.C10** | Lọc theo Danh mục con | Chọn 'Pants' -> URL đổi thành `category=Fashion&subCategory=Pants` và hiển thị đúng 100% sản phẩm Quần. | [✅] |

---

## 👩‍💼 2. Admin Management Flow (Luồng Quản trị)

| ID | Test Case | Expected Result (Kết quả kỳ vọng) | Status |
| :--- | :--- | :--- | :---: |
| **TC.A1** | Login Admin | Đăng nhập đúng Account ADMIN/STAFF dẫn vào `/admin`. Sai Account báo lỗi khung đỏ. | [✅] |
| **TC.A2** | Quản lý Sản phẩm (Mobile) | Trên điện thoại, danh sách sản phẩm hiển thị dạng THẺ (Cards), nút Edit/Delete to rõ, dễ thao tác. | [✅] |
| **TC.A3** | Cập nhật Đơn hàng (Responsive Modal) | Mở chi tiết đơn hàng trên Mobile, modal phải xếp dọc thông minh, chọn được trạng thái (Status) mượt mà. | [✅] |
| **TC.A4** | Import/Export Excel FULL | Xuất được file Excel có đủ variants/ảnh. Chỉnh sửa và Import lại thành công. | [✅] |
| **TC.A5** | Marketing Dashboard | Quản lý các chiến dịch (Active/Expired). Các chiến dịch cũ vẫn được lưu trữ để xem báo cáo. | [⚠️] |

---

## ⚙️ 3. System & Security (Hệ thống & Bảo mật)

| ID | Test Case | Expected Result (Kết quả kỳ vọng) | Status |
| :--- | :--- | :--- | :---: |
| **TC.S1** | Phân quyền Protected Path | Cố tình truy cập `/admin` bằng tài khoản khách hàng thông thường phải bị đá về `/login`. | [✅] |
| **TC.S2** | Socket.io Stock Sync | Mở 2 trình duyệt (1 Admin, 1 Khách). Admin cập nhật số lượng kho -> Khách thấy giá trị nhảy ngay lập tức. | [ ] |
| **TC.S3** | Custom Validation UI | Để trống các trường bắt buộc khi Register -> Khung input hiện viền đỏ rực (Tailwind) và báo lỗi tiếng Việt. | [✅] |
| **TC.S4** | Route Collision Fix | Truy cập `/api/products/export-template` không bị hiểu nhầm thành `:id` (trả về tệp thay vì lỗi ID). | [✅] |

---
🔍 *Tài liệu kiểm định được cập nhật bởi Antigravity vào ngày 23/03/2026 (Phiên bản 2.4 - Hierarchical Navigation).*
