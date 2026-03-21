# 🛒 E-Commerce Solution System

Dự án xây dựng hệ thống giải pháp Thương mại điện tử toàn diện dành cho Doanh nghiệp, Nhân viên và Người mua.

---

## 🛠 Tech Stack

* **Frontend:** ReactJS, Tailwind CSS
* **Backend:** Node.js (Express/NestJS)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Infrastructure:** Docker, Docker Compose

---

## 🗺️ System Workflow (Luồng hệ thống)

### 1. Luồng Quản trị & Vận hành (Admin/Staff)
* **Doanh nghiệp:** Nhập sản phẩm -> Quản lý kho -> Cấu hình đơn vị vận chuyển -> Theo dõi báo cáo doanh thu.
* **Nhân viên:** Tiếp nhận đơn hàng -> Cập nhật trạng thái (Đang xử lý/Đang giao) -> Chat hỗ trợ khách hàng -> Chăm sóc khách hàng (Gửi thiệp, khuyến mãi).

### 2. Luồng Người mua (Customer)
* Tìm kiếm sản phẩm -> Thêm vào giỏ hàng -> Thanh toán -> Theo dõi lộ trình đơn hàng -> Nhận thông báo ưu đãi/sinh nhật.

---

## 📋 User Stories (US)

| ID | Đối tượng | User Story |
| :--- | :--- | :--- |
| **US_01** | Doanh nghiệp | Là Admin, tôi muốn quản lý sản phẩm và đơn hàng để kiểm soát luồng hàng hóa. |
| **US_02** | Doanh nghiệp | Là Admin, tôi muốn quản lý kho và vận chuyển để tối ưu hóa quy trình logistics. |
| **US_03** | Doanh nghiệp | Là Admin, tôi muốn xem phân tích báo cáo để đưa ra quyết định kinh doanh. |
| **US_04** | Nhân viên | Là Nhân viên, tôi muốn quản lý thông tin và chat với khách để hỗ trợ kịp thời. |
| **US_05** | Nhân viên | Là Nhân viên, tôi muốn gửi thông báo khuyến mãi/sinh nhật để tăng tỷ lệ chuyển đổi. |
| **US_06** | Nhân viên | Là Nhân viên, tôi muốn cập nhật tình trạng sản phẩm để thông tin luôn chính xác. |
| **US_07** | Người mua | Là Người mua, tôi muốn mua hàng và chat với CSKH để có trải nghiệm tốt nhất. |
| **US_08** | Người mua | Là Người mua, tôi muốn nhận thông báo cá nhân hóa để không bỏ lỡ ưu đãi. |
| **US_09** | Người mua | Là Người mua, tôi muốn theo dõi đơn hàng để biết khi nào hàng đến tay. |

---

## 🐳 Docker Setup

Sử dụng `docker-compose.yml` để khởi tạo môi trường Database PostgreSQL 16:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16
    container_name: ecommerce_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: ecommerce_db
    ports:
      - "5432:5432"
    volumes:
      -  postgres_data:/var/lib/postgresql/data
      - ./db/init/01_init.sql:/docker-entrypoint-initdb.d/01_init.sql
      - ./db/seed/02_seed.sql:/docker-entrypoint-initdb.d/02_seed.sql
    networks:
      - ecommerce_network

volumes:
  postgres_data:

networks:
  ecommerce_network:
    driver: bridge
```

---

## 🚀 Khởi động nhanh với Docker Desktop

Dành cho bạn hoặc bạn bè muốn chạy nhanh toàn bộ dự án mà không cần cài đặt NodeJS/PostgreSQL thủ công.

### 1. Chuẩn bị
* Mở **Docker Desktop** trên máy.
* **QUAN TRỌNG:** Nếu bạn đang chạy `npm start` hoặc `npm run dev` ở ngoài, hãy nhấn `Ctrl + C` để **Dừng lại** (Tránh trùng cổng 3000, 3001).

### 2. Lệnh khởi động
Mở Terminal (PowerShell/CMD) tại thư mục gốc của dự án và chạy:

```bash
docker-compose up --build -d
```

### 3. Kiểm tra trên Docker Desktop
* Mở giao diện **Docker Desktop**, bạn sẽ thấy một Group tên là `ecommerce-project`.
* Bên trong có 3 Container đang chạy: `ecommerce_frontend`, `ecommerce_backend`, `ecommerce_postgres`.
* Bạn có thể nhấn vào từng cái để xem **Logs** (Nhật ký hoạt động) rất dễ dàng.

### 4. Truy cập hệ thống
* **Trang chủ (Shop):** [http://localhost:3001](http://localhost:3001)
* **Trang Admin:** [http://localhost:3001/admin](http://localhost:3001/admin)
* **API Backend:** [http://localhost:3000](http://localhost:3000)

### 5. Dừng hệ thống
Khi muốn tắt dự án, chạy lệnh: `docker-compose down`

### Chạy Database:
1. Đảm bảo bạn đã cài đặt Docker & Docker Compose.
2. Chạy lệnh: `docker-compose up -d`
3. Database sẽ sẵn sàng tại `localhost:5432`.