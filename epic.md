# 🛒 VibeCart Master Epic & Project Overview

Tài liệu này tổng hợp toàn bộ các dòng chảy nghiệp vụ (Flows), User Stories (US), và phân định nhiệm vụ của các vai trò trong hệ thống VibeCart cao cấp.

---

## 👥 1. Các Vai Trò Trong Hệ Thống (Roles)

| Vai trò | Nhiệm vụ chính |
| :--- | :--- |
| **Doanh nghiệp (Admin)** | Quản trị toàn diện hệ thống: Quản lý sản phẩm, nhân sự, xem báo cáo doanh thu, cấu hình Marketing (Flash Sale, Birthday), và quản trị hội thoại Chat. |
| **Nhân viên (Staff)** | Xử lý các nghiệp vụ vận hành hàng ngày: Quản lý đơn hàng, theo dõi kho bãi, tương tác hỗ trợ khách hàng qua Chat. |
| **Khách hàng (Customer)** | Trải nghiệm mua sắm: Tìm kiếm sản phẩm, đặt hàng, nhận ưu đãi tự động, chat hỗ trợ và theo dõi đơn hàng thời gian thực. |

---

## 🚀 2. Các Tính Năng Trọng Yếu (Key Features)

### A. Hệ thống Marketing & Khuyến mãi Tự động
- **Flash Sale / Catalog Sale**: Tự động áp dụng giá chiết khấu trên toàn sàn dựa theo lịch trình chiến dịch. Hiển thị nhãn giảm giá đỏ chéo và giá gốc gạch ngang đồng bộ từ Trang chủ đến Thanh toán.
- **Birthday Campaign**: Tự động quét và gửi Voucher mừng sinh nhật cho khách hàng. Voucher có hiệu lực "kỷ luật" (chỉ trong tháng sinh nhật).
- **Voucher Cá nhân hóa**: Hệ thống tách biệt Voucher toàn sàn (đã tính vào giá) và Voucher riêng tư (Sinh nhật, Khách quen) giúp khách hàng hưởng ưu đãi chồng ưu đãi.

### B. Trung tâm Hỗ trợ Khách hàng Real-time
- **Chat trực tuyến**: Khách hàng và Admin trao đổi trực tiếp qua Socket.io. Tự động lưu lịch sử hội thoại, thông báo tin nhắn mới tức thì.
- **Notification Center**: Thông báo real-time khi có đơn hàng mới (cho Admin) hoặc khi đơn hàng đổi trạng thái (cho Khách).

### C. Quản lý Kho & Vận hành Thông minh
- **Sync Tồn kho Real-time**: Số lượng kho tự động cập nhật trên mọi thiết bị người dùng ngay khi có biến động (Nhập kho hoặc Bán ra) qua Socket.io.
- **Excel Power Tools**: Hỗ trợ xuất mẫu Template Excel, Import sản phẩm hàng loạt (kèm Phân loại/Bảng size) và Export FULL dữ liệu hiện có để sao lưu/chỉnh sửa.
- **Thanh toán Đa kênh**: Tích hợp VNPAY, MoMo, VietQR và thanh toán khi nhận hàng (COD).

### E. Advanced Product Intelligence
- **Visual Size Chart**: Hệ thống "Card cân nặng" trực quan. Khách hàng click vào mốc cân nặng để hệ thống tự động chọn Size phù hợp nhất.
- **Detailed Variants**: Quản lý đa chiều (Size + Màu sắc + Kho riêng). Mỗi biến thể có mã SKU và số lượng tồn kho độc lập.
- **Deep Selection Sync**: Tự động khôi phục lựa chọn Size/Màu khi khách hàng quay lại trang chi tiết từ Giỏ hàng qua URL thông minh.

### D. Trải nghiệm người dùng (UX) & Bảo mật
- **Custom UI Validation**: Thay thế thông báo mặc định của trình duyệt bằng hệ thống khung đỏ rực rỡ (Tailwind CSS) và thông báo tiếng Việt tinh tế.
- **Bảo mật JWT**: Hệ thống phân quyền chặt chẽ giữa Khách hàng, Nhân viên và Admin. Tự động kiểm tra phiên làm việc và điều hướng đăng nhập thông minh.

---

## 📝 3. User Stories (US) Nâng Cao

### 🧖‍♂️ Đối với Khách hàng (Customer)
- **US.C5**: Tôi muốn thấy rõ số tiền mình tiết kiệm được (giá cũ gạch ngang) ngay trong giỏ hàng để có động lực thanh toán.
- **US.C6**: Tôi muốn nhận được quà tặng bất ngờ vào tháng sinh nhật của mình và sử dụng nó ngay tại bước thanh toán.
- **US.C7**: Tôi muốn chat trực tiếp với cửa hàng khi có thắc mắc về kích cỡ sản phẩm mà không cần tải lại trang.
- **US.C8**: Tôi muốn chọn Size/Màu sắc sản phẩm một cách mượt mà, và nếu tôi chọn Size qua "Card cân nặng", hệ thống phải tự động highlight và cập nhật trạng thái chọn.
- **US.C9**: Khi tôi click vào sản phẩm từ Giỏ hàng để xem lại chi tiết, trang sản phẩm phải tự động chọn đúng Size/Màu mà tôi đã bỏ vào giỏ trước đó.
- **US.C10**: Tôi muốn nhập mã đơn hàng và xem được trạng thái đơn hàng của mình (PENDING -> SHIPPING -> ...) một cách real-time.

### 👩‍💼 Đối với Admin/Staff
- **US.A6**: Tôi muốn nhập hàng nghìn sản phẩm từ tệp Excel có sẵn để tiết kiệm thời gian vận hành.
- **US.A7**: Tôi muốn biết ngay đơn hàng nào đã được thanh toán qua VNPAY/MoMo để tiến hành đóng gói mà không cần kiểm tra thủ công ngân hàng.
- **US.A8**: Tôi muốn quản lý các chiến dịch Marketing cũ (Hết hạn) để phân tích hiệu quả kinh doanh.
- **US.A9**: Tôi muốn xuất toàn bộ dữ liệu sản phẩm, đơn hàng, khách hàng ra file Excel để sao lưu hoặc chỉnh sửa hàng loạt.

---

## 🛠 4. Ma Trận Chức Năng (Functional Matrix)

| Module | Khách hàng | Nhân viên (Staff) | Doanh nghiệp (Admin) |
| :--- | :---: | :---: | :---: |
| Marketing & Sale Tag | ✅ (Hưởng lợi) | ❌ | ✅ (Quản trị) |
| Real-time Chat | ✅ | ✅ | ✅ |
| Import/Export Excel | ❌ | ✅ | ✅ |
| Custom Validation UX | ✅ | ✅ | ✅ |
| VNPAY/MoMo/VietQR | ✅ | ❌ | ✅ (Xem báo cáo) |

---

## 🎨 5. Tiêu Chuẩn Giao diện (Premium Aesthetics)
- **Visual**: Minimalist, Dark mode friendly, Rounded 3xl, Glassmorphism.
- **UX Feedback**: Red frames for errors, Pulsing animations for active campaigns, Smooth transitions.
- **Localization & Finance**: 100% Tiếng Việt/English hỗ trợ, tỉ giá USD/VND cập nhật tự động.
- **Responsiveness**: Chuẩn chỉnh 100% trên Desktop, Tablet và Mobile cho cả Shop và Admin.

---
🚀 *Tài liệu cập nhật lần cuối bởi Antigravity (Google DeepMind Team) vào ngày 23/03/2026.*
