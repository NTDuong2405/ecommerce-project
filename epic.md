# 🛒 VibeCart Master Epic & Project Overview

Tài liệu này tổng hợp toàn bộ các dòng chảy nghiệp vụ (Flows), User Stories (US), và phân định nhiệm vụ của các vai trò trong hệ thống VibeCart.

---

## 👥 1. Các Vai Trò Trong Hệ Thống (Roles)

| Vai trò | Nhiệm vụ chính |
| :--- | :--- |
| **Doanh nghiệp (Admin)** | Quản trị toàn diện hệ thống: Quản lý sản phẩm, nhân sự, xem báo cáo doanh thu, cấu hình khuyến mãi mkt, và thiết lập hệ thống. |
| **Nhân viên (Staff)** | Xử lý các nghiệp vụ vận hành hàng ngày: Quản lý đơn hàng (Xác nhận, Giao hàng), theo dõi kho bãi, tương tác chăm sóc khách hàng. |
| **Khách hàng (Customer)** | Trải nghiệm mua sắm: Tìm kiếm sản phẩm, đặt hàng, thanh toán trực tuyến, theo dõi đơn hàng và quản lý thông tin cá nhân. |

---

## 🚀 2. Dòng Chảy Nghiệp Vụ Chính (Main Project Flows)

### A. Flow Mua Hàng & Thanh Toán (Customer Flow)
1. **Khám phá**: Khách hàng xem trang Chủ -> Xem danh sách Sản phẩm -> Xem Chi tiết sản phẩm.
2. **Giỏ hàng**: Thêm sản phẩm vào giỏ, điều chỉnh số lượng.
3. **Thanh toán**:
   - Nhập thông tin giao hàng (Guest hoặc User).
   - Chọn phương thức: COD, Chuyển khoản (VietQR), MoMo hoặc VNPay.
4. **Xác nhận**: Nhận email xác nhận kèm link Theo dõi đơn hàng thông minh (Auto-tracking).
5. **Theo dõi**: Sử dụng tính năng "Track Order" để xem trạng thái đơn thực tế.

### B. Flow Quản Lý Vận Hành (Admin/Staff Flow)
1. **Sản phẩm & Kho**: Tạo mới sản phẩm, quản lý Biến thể (Size/Color), cập nhật tồn kho tự động khi có đơn hàng.
2. **Xử lý Đơn hàng**:
   - Nhận thông báo Real-time khi khách đặt đơn.
   - Cập nhật trạng thái: `PENDING` -> `CONFIRMED` -> `SHIPPING` -> `DELIVERED`.
3. **Marketing & Khách hàng**:
   - Quản lý danh sách khách hàng, theo dõi lịch sử mua sắm.
   - Tạo các chiến dịch khuyến mãi (Promotion), gửi mail chúc mừng sinh nhật (Marketing Module).
4. **Phân tích (Analytics)**: Xem biểu đồ doanh thu, sản phẩm bán chạy qua Dashboard.

---

## 📝 3. User Stories (US) Chi Tiết theo Vai Trò

### 🧖‍♂️ Đối với Khách hàng (Customer)
- **US.C1**: Là khách hàng, tôi muốn xem danh sách sản phẩm theo danh mục để dễ dàng lựa chọn món đồ ưng ý.
- **US.C2**: Là khách hàng, tôi muốn thanh toán qua MoMo/VNPay để quy trình mua hàng nhanh gọn và bảo mật.
- **US.C3**: Là khách hàng, tôi muốn nhận được email chứa link tracking sau khi đặt hàng để tiết kiệm thời gian tra cứu.
- **US.C4**: Là khách hàng, tôi muốn hệ thống tự động điền thông tin khi tôi vào trang Tracking từ email để tăng tính tiện lợi.

### 👩‍💼 Đối với Doanh nghiệp/Staff (Admin/Staff)
- **US.A1**: Là Admin, tôi muốn xem biểu đồ doanh thu theo thời gian thực để đưa ra các quyết định kinh doanh kịp thời.
- **US.A2**: Là Admin, tôi muốn tạo mã giảm giá cho một nhóm sản phẩm nhất định để thúc đẩy bán hàng.
- **US.A3**: Là Staff, tôi muốn nhận thông báo khi có đơn hàng mới để xác nhận và đóng gói nhanh chóng.
- **US.A4**: Là Staff, tôi muốn quản lý tồn kho chặt chẽ để trả lời khách hàng về tình trạng còn/hết hàng ngay lập tức.
- **US.A5**: Là Admin, tôi muốn gửi email marketing tự động đến khách hàng có sinh nhật trong tháng để tăng tỷ lệ quay lại của khách.

---

## 🛠 4. Ma Trận Chức Năng (Functional Matrix)

| Module | Khách hàng | Nhân viên (Staff) | Doanh nghiệp (Admin) |
| :--- | :---: | :---: | :---: |
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Đặt hàng & Thanh toán | ✅ | ❌ | ❌ |
| Quản lý Đơn hàng | ✅ (Theo dõi) | ✅ (Xử lý đơn) | ✅ (Full quyền) |
| Quản lý Kho sản phẩm | ❌ | ✅ (Xem & Sửa) | ✅ (Full quyền) |
| Marketing (MKT) | ❌ | ❌ | ✅ |
| Báo cáo & Thống kê | ❌ | ❌ | ✅ |
| Quản lý nhân sự | ❌ | ❌ | ✅ |

---

## 🎨 5. Tiêu Chuẩn Giao diện (Premium Aesthetics)
- **Visual**: Minimalist, Glassmorphism, Rounded 3xl+, Smooth Transitions.
- **Interaction**: Micro-animations (Lottie/Tailwind), Real-time sync (Socket.io).
- **SEO**: Tối ưu thẻ meta, Heading hierarchy và Schema.org cho sản phẩm.

---
*Tài liệu được cập nhật bởi Antigravity (Google DeepMind Team) vào ngày 22/03/2026.*
