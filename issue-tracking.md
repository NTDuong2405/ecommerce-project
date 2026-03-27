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
| **BUG.06** | Product Listing | Lỗi "0 sản phẩm" do dữ liệu CATEGORIES trong UI lệch với Database seeding. | High | ✅ **Fixed (Ready for push)** |
| **BUG.07** | Detail Stability | Các Product ID cụ thể bị kẹt Skeleton hoặc báo "Product not found". | High | ✅ **Fixed (Robust Catching)** |
| **BUG.08** | Data Integrity | Lỗi "Watch Placeholder": Search Nike hiện mặt đồng hồ do fallback hình ảnh chưa chuẩn. | Medium | ✅ **Fixed (New Placeholder)** |
| **BUG.09** | Size Guide | Đa số sản phẩm báo "Size chart info is being updated...". | Low | ⚠️ **Data Dependency** (UI Fixed) |

---

## 🚀 2. Nhật ký Fix & Audit (Audit Log)

### **Session 27/03/2026 - Master Patch Fix**
*   **Người thực hiện:** Antigravity.
*   **Chi tiết Fix:**
    *   Cập nhật `CATEGORIES` trong `Products.jsx` khớp với DB (`Clothing`, `Shoes`, `Bags`, `Accessories`).
    *   Đổi logic Search từ `OR` sang `AND` trong `product.service.js` để tăng độ chính xác tìm kiếm 100%.
    *   Thay đổi fallback image từ Apple Watch sang hình ảnh Shop-display trung lập để tránh gây nhầm lẫn khi Nike shoes không có ảnh.
    *   Thêm xử lý lỗi API tại trang `ProductDetail.jsx` để ngăn chặn việc kẹt ở Skeleton khi ID không tồn tại.

---
🔍 *Tài liệu cập nhật lần cuối ngày 27/03/2026.*
