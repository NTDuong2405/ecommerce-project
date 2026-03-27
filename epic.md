# 🛒 VibeCart Master Epic & Project Overview

Tài liệu này tổng hợp toàn bộ các dòng chảy nghiệp vụ (Flows), User Stories (US), và phân định nhiệm vụ của các vai trò trong hệ thống VibeCart cao cấp.

---

## 👥 1. Các Vai Trò Trong Hệ Thống (Roles)

| Vai trò | Nhiệm vụ chính | Ghi chú bảo mật |
| :--- | :--- | :--- |
| **Doanh nghiệp (Admin)** | Quản trị toàn diện: Sản phẩm, nhân sự, báo cáo doanh thu, Marketing, và hội thoại Chat. | Quyền hạn cao nhất. Xem được biểu đồ Doanh thu và Lợi nhuận. |
| **Nhân viên (Staff)** | Vận hành hàng ngày: Quản lý đơn hàng, kho bãi, hỗ trợ khách hàng. | Bị giới hạn không xem được số liệu tài chính nhạy cảm trên Dashboard. |
| **Khách hàng (Customer)** | Mua sắm: Tìm kiếm, đặt hàng, nhận ưu đãi, chat hỗ trợ và theo dõi đơn hàng. | Truy cập công khai hoặc qua tài khoản cá nhân. |

---

## 🚀 2. Các Tính Năng Trọng Yếu (Key Features)

### A. Hệ thống Marketing & Đa ngôn ngữ Toàn cầu
- **Dynamic Localization**: Hỗ trợ 100% Tiếng Việt và Tiếng Anh. Tự động chuyển đổi toàn bộ UI, thông báo (Toast), và logic tra cứu đơn hàng.
- **Smart Currency Converter**: Tự động cập nhật tỷ giá USD/VND thời gian thực từ API. Hệ thống tự nhận diện Base Currency (VND) để hiển thị giá chính xác, tránh lạm phát số liệu khi chuyển vùng.
- **Flash Sale & Campaign Management**: Tự động áp dụng giá chiết khấu. Quản lý trạng thái chiến dịch (Active/Expired) chuyên nghiệp.

### B. Trung tâm Hỗ trợ Khách hàng Real-time (Socket.io)
- **Omni-channel Chat**: Tích hợp ChatBox ngay tại shop. Admin/Staff phản hồi trực tiếp từ bảng điều khiển tập trung.
- **Instant Stock Sync**: Số lượng tồn kho (Stock) được cập nhật tới người dùng ngay lập tức khi Admin thay đổi (không cần load lại trang).
- **Notification Hub**: Thông báo tin nhắn mới và trạng thái đơn hàng tức thời.

### C. Quản lý Kho & Vận hành Thông minh
- **Inventory Hotlist**: Dashboard tự động cảnh báo các mặt hàng sắp hết hoặc đã cháy hàng để Admin kịp thời nhập kho.
- **Excel Power Tools**: Hỗ trợ xuất mẫu Template Excel, Import/Export sản phẩm hàng loạt cùng các phân loại phức tạp.
- **Analytics Visualizer**: Biểu đồ doanh thu (Area Chart), thống kê Best Sellers và hành vi khách hàng trực quan bằng Recharts.

### D. Trải nghiệm Sản phẩm Đẳng cấp (UX/UI)
- **Visual Size Selection**: Hệ thống chọn Size dựa trên cân nặng thông minh. Click mốc cân nặng -> Auto select & highlight size tương ứng.
- **Deep Selection Recovery**: Khi khách nhấn quay lại sản phẩm từ giỏ hàng, hệ thống tự động khôi phục chính xác Size/Màu sắc đã chọn trước đó.
- **Premium Aesthetics**: Giao diện tối giản (Minimalist), hiệu ứng Glassmorphism, Rounded 3xl, cùng bộ animation mượt mà (Slide-in, Swing, Pulse) tạo cảm giác cao cấp.

---

## 📝 3. User Stories (US) Nâng Cao

### 🧖‍♂️ Đối với Khách hàng (Customer)
- **US.C5**: Tôi muốn giá sản phẩm tự động chuyển sang USD với tỉ giá chuẩn khi tôi chọn ngôn ngữ Tiếng Anh.
- **US.C7**: Tôi muốn trạng thái "Thêm vào giỏ hàng" phải hiển thị bằng ngôn ngữ tôi đang chọn để dễ hiểu.
- **US.C10**: Tôi muốn tra cứu hành trình đơn hàng của mình bằng mã ID và xem được thông tin chi tiết (Người nhận, Địa chỉ, Sản phẩm) bằng ngôn ngữ đã chọn.

### 👩‍💼 Đối với Admin/Staff
- **US.A7**: Là Admin, tôi muốn xem biểu đồ doanh thu 7 ngày gần nhất. Là Staff, tôi chỉ muốn thấy danh sách đơn hàng cần xử lý để tập trung làm việc.
- **US.A9**: Tôi muốn xuất dữ liệu tồn kho ra Excel để làm việc với nhà cung cấp bên ngoài.
- **US.A10**: Tôi muốn nhận được tin nhắn chat từ khách hàng ngay khi họ gửi mà không cần phải F5 trang quản trị.

---

## 🛠 4. Ma Trận Chức Năng (Functional Matrix)

| Module | Khách hàng | Nhân viên (Staff) | Doanh nghiệp (Admin) |
| :--- | :---: | :---: | :---: |
| Biểu đồ Doanh thu (Revenue) | ❌ | ❌ | ✅ |
| Quản lý Đơn hàng (Orders) | ❌ | ✅ | ✅ |
| Quản lý Sản phẩm (Inventory) | ❌ | ✅ | ✅ |
| Real-time Notification | ✅ | ✅ | ✅ |
| Tỉ giá Động (Exchange Rate) | ✅ | ✅ | ✅ |

---

## 🎨 5. Tiêu Chuẩn Kỹ Thuật (Technical Excellence)
- **Frontend**: React + Vite, Tailwind CSS (Mobile First).
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL.
- **Real-time**: Socket.io v4.
- **Animation**: CSS Keyframes (Gentle-swing, Slide-in-right) & Lucide Icons.
- **Validation**: Frontend custom validation (Tailwind Ring/Shadow) + Server-side Prisma check.

---
🚀 *Tài liệu cập nhật chuẩn hóa bởi Antigravity vào ngày 27/03/2026 (Phiên bản 3.0 - Global Commerce).*
