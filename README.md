# 🎁 Game Ô Vuông Bí Mật & Lắc Xí Ngầu (Next.js Fullstack)

Webapp game tương tác gồm 2 phân hệ **Player Panel** và **Admin Panel** với database SQLite + Prisma.

---

## 🚀 Khởi Chạy Nhanh

Server hiện đang chạy tại: **[http://localhost:3000](http://localhost:3000)**

Lệnh chạy dev:
```bash
npm run dev
```

Kiểm thử E2E Playwright qua Browser:
```bash
npm run test:e2e
```

---

## 🔑 Tài Khoản Mặc Định

| Phân hệ | Đường dẫn | Mật khẩu mặc định | Ghi chú |
|---|---|---|---|
| **Player (Người chơi)** | `/` | `play2024` | Nhập mật khẩu + Tên player để vào mở ô |
| **Admin (Quản trị)** | `/admin` | `admin123` | Cổng cấu hình câu hỏi, ô bí mật & xí ngầu |

---

## 🎯 Chi Tiết Tính Năng Mới

### 1. Phân Hệ Người Chơi (Player Panel)
- **Lưới Ô Vuông Bí Mật (Mystery Boxes Grid)**:
  - Hiển thị tất cả các ô vuông với emoji **❓** và số thứ tự `#01`, `#02`...
  - **Hiệu ứng chọn ô ngẫu nhiên**: Khi nhấn *"BẮT ĐẦU CHỌN Ô BÍ MẬT"*, ô sáng màu đỏ (`bg-red-600`) sẽ chạy lướt ngẫu nhiên qua các ô với tốc độ cực nhanh, sau đó giảm tốc dần và chốt dừng ở một ô bất kỳ.
  - **Phân loại kết quả**:
    - **Ô Câu hỏi**: Bật popup hiển thị câu hỏi thử thách, người chơi trả lời và có thể mở gợi ý/đáp án.
    - **Ô Chúc bạn may mắn lần sau**: Bật popup chúc mừng an toàn qua lượt mà không cần trả lời câu hỏi.
  - **Đánh dấu ô đã mở**: Ô đã được chọn sẽ chuyển sang biểu tượng **❌** kèm tên người mở, và không bị chọn lại ở các lượt tiếp theo.
  - **Tự động lưu**: Mọi lượt mở ô đều lưu vào cơ sở dữ liệu và hiển thị ở bảng *Lịch sử lượt chơi*.
- **Mode Lắc Xí Ngầu 3D**:
  - Chuyển tab qua lắc xí ngầu 3D với hiệu ứng xúc xắc lộn vòng chân thực kèm âm thanh.

### 2. Phân Hệ Quản Trị (Admin Panel)
- **Quản lý Ô Vuông Bí Mật (`/admin/boxes`)**:
  - Khai báo số lượng ô *"Chúc bạn may mắn lần sau"*.
  - Tự động tính toán tổng số ô = Số câu hỏi + Số ô may mắn lần sau.
  - Theo dõi danh sách trạng thái từng ô (ô câu hỏi hay ô may mắn, đã mở bởi ai hay chưa mở).
  - Nút **Xáo & Đặt lại tất cả các ô** khi muốn bắt đầu ván mới.
- **Quản lý Bộ Câu Hỏi (`/admin/questions`)**:
  - Thêm, sửa, xóa ngân hàng câu hỏi & đáp án gợi ý.
- **Quản lý Xí Ngầu (`/admin/dice`)**:
  - Cấu hình các mặt xí ngầu và hành động.
- **Cài đặt Mật khẩu (`/admin/settings`)**:
  - Đổi mật khẩu Player và Admin.
