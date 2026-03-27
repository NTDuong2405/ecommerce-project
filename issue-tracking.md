# 🐞 Master Issue tracking (Production)

Tài liệu ghi lại các vấn đề/lỗi phát hiện trong quá trình test thực tế trên môi trường production.

| ID | Feature | Issue Description (Mô tả lỗi) | Severity (Mức độ) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG.01** | Currency (EN) | Khi đổi sang Tiếng Anh, ký hiệu tiền tệ là "$" nhưng giá trị vẫn là số tiền VNĐ (Ví dụ: $10,990,000). Chưa áp dụng tỉ giá chuyển đổi. | Critical | Fixed (Ready for Push) |
| **BUG.02** | Price (VI) | Giá sản phẩm ở mode Tiếng Việt bị lỗi tính toán cực đại (Ví dụ: Apple Watch hiện 288.501.567.200 ₫). | Critical | Fixed (Ready for Push) |
| **BUG.03** | i18n (Toast) | Thông báo "Thêm vào giỏ hàng" luôn hiện tiếng Việt dù đang ở mode English. | Medium | Fixed (Ready for Push) |
| **BUG.04** | i18n (Tracking) | Toàn bộ trang Theo dõi đơn hàng (`OrderTracking.jsx`) chưa được dịch, vẫn hiển thị 100% tiếng Việt. | High | Fixed (Ready for Push) |
| **BUG.05** | i18n (ChatBox) | Tooltip của nút Zalo ("Chat qua Zalo") bị fix cứng, không thay đổi theo ngôn ngữ. | Low | Fixed (Ready for Push) |
| **BUG.06** | Performance | Trang Products có độ trễ lớn (2-3s) khi chuyển category trên môi trường production. | Medium | Investigating |
