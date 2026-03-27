# 🧠 VibeCart - Engineering Excellence & AI-Handover Standards

Tài liệu này không chỉ ghi lại công nghệ, mà là **Bộ Nguyên Tắc Lập Trình (Coding Principles)** cốt lõi. Bất kỳ AI hoặc lập trình viên nào kế nhiệm (Successor) đều phải tuân thủ nghiêm ngặt để duy trì sự ổn định của hệ thống.

---

## 🚫 1. Anti-Hardcoding (Nói không với dữ liệu cứng)
- **Environment Driven**: Mọi URL API, cổng (Port), hay Token tuyệt đối không viết cứng vào mã nguồn. Luôn sử dụng `.env` qua `process.env` (Backend) hoặc `import.meta.env` (Frontend).
- **Constant Management**: Các giá trị mặc định, tỷ giá tiền tệ, hoặc phí ship được tập trung tại một nơi (constants/config).
- **Dynamic Routing**: Sử dụng `params` và `searchParams` để thay đổi giao diện thay vì tạo nhiều trang tĩnh giống nhau.

## 🧼 2. Clean Code & Modular Architecture (Mã nguồn sạch & Module hóa)
- **Single Responsibility (SRP)**: Một Component hoặc Function chỉ làm một việc duy nhất. (Ví dụ: `ProductService` chỉ lo về dữ liệu, `ProductController` chỉ lo về điều hướng API).
- **Atomic Components**: Tách nhỏ giao diện thành các thành phần tái sử dụng (Button, Input, Badge, Pagination).
- **DRY (Don't Repeat Yourself)**: Các logic tính toán giá, format tiền tệ, hoặc validate form được đưa vào `utils` hoặc `hooks`.

## 🛡️ 3. Defensive Programming (Lập trình phòng thủ)
- **Optional Chaining Only**: Tuyệt đối không truy cập sâu vào Object mà không dùng `?.` (Ví dụ: `data?.product?.variants?.[0]?.name`).
- **Robust Parsing**: Mọi dữ liệu JSON nhận về từ Database (như `sizeChart`) phải được bọc trong `try-catch` với giá trị fallback `[]` hoặc `{}`.
- **Null-Safety UI**: Luôn hiển thị trạng thái Loading hoặc Skeleton khi dữ liệu chưa về, tránh hiện tượng nhảy (layout shift) hoặc lỗi rendering.

## 🔌 4. Async & Real-time Patterns (Giao thức Bất đồng bộ)
- **Await Consistency**: Luôn sử dụng `async/await` kết hợp với `try-catch` để xử lý lời gọi API, không dùng `.then().catch()` lồng nhau khó đọc.
- **Sync State**: Logic Socket.io phải được khởi tạo ở lớp cao nhất (Context) và sử dụng Hook để truy cập, đảm bảo chỉ có 1 kết nối duy nhất tồn tại.

## 📐 5. Standardized Interaction (Quy chuẩn tương tác)
- **Naming Convention**: Biến/Hàm đặt tên theo kiểu `camelCase`, Component đặt tên kiểu `PascalCase`. Tên phải có nghĩa (Ví dụ: `handleAddToCart` thay vì `clickButton`).
- **Standard API Response**: Mọi API Route phải tuân thủ cấu trúc trả về: `{ success: boolean, message: string, data: any }`.
- **CSS Utility First**: Sử dụng Tailwind CSS một cách hệ thống. Không viết inline styles (style={{...}}) trừ khi đó là các giá trị động cần tính toán.

## 🌍 6. Internationalization (i18n) - Đa ngôn ngữ hệ thống
- **No Hardcoded Text**: Tuyệt đối không để chuỗi văn bản hiển thị (Labels, Placeholders, Messages) cứng trong mã nguồn. 100% phải qua hàm `t()` của `i18next`.
- **Lexicon Integrity**: Files `vi.json` và `en.json` phải luôn được cập nhật song song. Mọi Key mới phải tồn tại ở cả hai ngôn ngữ.
- **Dynamic Keys**: Sử dụng Key động (Interpolation/Dynamic access) cho các dữ liệu từ Database như Danh mục (`categories.${cat}`) để đảm bảo đồng bộ.

## ✨ 7. Premium Aesthetics & Micro-animations (Thẩm mỹ & Chuyển động)
- **Staggered Entrance**: Các danh sách (Products, Menu) nên sử dụng hiệu ứng hiện ra tuần tự (Staggered) để tăng trải nghiệm người dùng.
- **Interactive Feedback**: Các nút bấm, thẻ sản phẩm phải có phản hồi thị giác (Hover Scale, Shadow, Transition).
- **Subtle Motion**: Sử dụng các animation nhẹ nhàng (`animate-gentle-swing`, `animate-zoom-in-up`) để làm giao diện "sống động" nhưng không làm người dùng xao nhãng.

---

## 🤖 8. Note for AI Successors (Ghi chú cho AI kế nhiệm)
Hệ thống này được xây dựng bởi **Antigravity (Google DeepMind Team)** dựa trên tư duy **Full-stack Orchestration**. Khi thực hiện nhiệm vụ mới:
1. Đọc file `prisma/schema.prisma` để hiểu cấu trúc dữ liệu trước.
2. Kiểm tra `utils/api.js` và `context/` để biết cách các phần kết nối với nhau.
3. Luôn cập nhật `test-case.md` và `epic.md` sau khi hoàn thành một User Story mới.
4. **Tuyệt đối không phá vỡ tính an toàn dữ liệu (Optional Chaining) đã được thiết lập.**
5. **Duy trì 100% độ bao phủ của i18n và các chuyển động cao cấp đã thiết lập.**

---
🚀 *Hành trình kiến tạo VibeCart - Antigravity & USER - 23/03/2026*
