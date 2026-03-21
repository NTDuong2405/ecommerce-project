INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị hệ thống'),
('STAFF', 'Nhân viên'),
('BUYER', 'Người mua');

INSERT INTO permissions (code, description) VALUES
('product.create', 'Tạo sản phẩm'),
('product.update', 'Cập nhật sản phẩm'),
('product.delete', 'Xóa sản phẩm'),
('order.view', 'Xem đơn hàng'),
('order.update', 'Cập nhật đơn hàng'),
('inventory.manage', 'Quản lý kho'),
('user.manage', 'Quản lý người dùng'),
('notification.send', 'Gửi thông báo');

INSERT INTO categories (name, slug, description) VALUES
('Thời trang', 'thoi-trang', 'Danh mục thời trang'),
('Điện tử', 'dien-tu', 'Danh mục điện tử'),
('Mỹ phẩm', 'my-pham', 'Danh mục mỹ phẩm');

INSERT INTO warehouses (name, code, address, phone) VALUES
('Kho chính', 'WH001', 'Hà Nội', '0123456789');

INSERT INTO users (email, password_hash, full_name, phone, status) VALUES
('admin@example.com', '$2b$10$examplehashedpassword', 'System Admin', '0900000001', 'ACTIVE'),
('staff1@example.com', '$2b$10$examplehashedpassword', 'Nhân viên 1', '0900000002', 'ACTIVE'),
('buyer1@example.com', '$2b$10$examplehashedpassword', 'Khách hàng 1', '0900000003', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 4), (2, 5), (2, 8);