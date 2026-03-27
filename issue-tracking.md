# 📝 VibeCart - Production Issue Tracking

Tài liệu này dùng để theo dõi, quản lý và xác nhận trạng thái các lỗi (bugs) phát hiện được trên môi trường Production (Vercel).

---

## 🛠 1. Danh sách Lỗi & Trạng thái (Issue Log)

| ID | Chức năng (Feature) | Mô tả lỗi (Issue Description) | Mức độ (Severity) | Trạng thái (Status) |
| :--- | :--- | :--- | :--- | :--- |
| **BUG.01** | Currency (EN) | Khi đổi sang Tiếng Anh, ký hiệu tiền tệ là "$" nhưng giá trị vẫn là số tiền VNĐ. | Critical | ✅ **Verified Fixed** |
| **BUG.02** | Price (VI) | Giá sản phẩm ở mode Tiếng Việt bị lỗi tính toán cực đại (hàng tỷ đồng). | Critical | ✅ **Verified Fixed** |
| **BUG.03** | i18n (Toast) | Thông báo "Thêm vào giỏ hàng" luôn hiện tiếng Việt dù đang ở mode English. | Medium | ✅ **Verified Fixed** |
| **BUG.04** | i18n (Tracking) | Trang Theo dõi đơn hàng (`OrderTracking.jsx`) chưa được dịch. | High | ✅ **Verified Fixed** |
| **BUG.05** | i18n (ChatBox) | Tooltip của nút Zalo bị fix cứng tiếng Việt. | Low | ✅ **Verified Fixed** |
| **BUG.06** | Product Listing | Trang `/products` thường xuyên báo "0 sản phẩm" khi dùng bộ lọc hoặc chuyển trang. | High | ❌ **New Issue** (Investigating) |
| **BUG.07** | Detail Stability | Các Product ID cụ thể (128, 15, 65) bị kẹt ở màn hình Loading (Skeleton) vô thời hạn. | High | ❌ **New Issue** (Investigating) |
| **BUG.08** | Data Integrity | Tìm kiếm "Nike" nhưng kết quả trả về hình ảnh/mô tả của "Apple Watch". | Medium | ❌ **New Issue** (Data Mismatch) |
| **BUG.09** | Size Guide | Đa số sản phẩm báo "Size chart info is being updated..." không cho chọn theo cân nặng. | Low | ❌ **New Issue** (Missing Data) |

---

## 🚀 2. Nhật ký Fix & Audit (Audit Log)

### **Session 27/03/2026 - Master Production Audit (v3.0)**
*   **Người thực hiện:** Antigravity (QA Agent).
*   **Kết quả:**
    *   Hệ thống Đa ngôn ngữ và Tỷ giá Động đã hoạt động hoàn hảo sau bản vá.
    *   Cơ chế bảo mật Redirect `/admin` và Login phân quyền đã ổn định.
    *   Hệ thống Xuất file Excel (Inventory) và Biểu đồ (Analytics) đã chạy tốt trên Production.
    *   **Phát hiện mới:** Có vấn đề về độ ổn định của API lấy danh sách sản phẩm (Products) và dữ liệu sản phẩm bị lệch (Data Mismatch).

---
🔍 *Tài liệu cập nhật lần cuối ngày 27/03/2026.*
