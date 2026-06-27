# Anti-Cheat Exam Web

Ứng dụng web quản lý và giám sát bài thi trực tuyến, gồm backend (Node.js/Express) và frontend (Next.js + TypeScript). Mục tiêu chính là cung cấp nền tảng tổ chức, nộp bài, và phát hiện hành vi gian lận (cheating) bằng cách ghi lại log và xử lý dữ liệu camera/face-detection ở phía client.

## Tính năng chính
- Quản lý bài thi: tạo, chỉnh sửa, xóa đề và bài thi.
- Thiết lập/chỉnh sửa đề thi cho sinh viên.
- Ghi lại và lưu trữ logs liên quan đến hành vi gian lận (thư mục `backend/uploads/cheating-logs/`).
- Xác thực người dùng (roles: admin, student).
- Giao diện admin và dashboard cho sinh viên.
- Face-detection/giám sát phía client (frontend) để phát hiện hành vi khả nghi.

## Kiến trúc dự án
- Backend: Node.js + Express, cấu trúc theo `controllers/`, `models/`, `routes/`.
- Frontend: Next.js với TypeScript, component-based, sử dụng store để quản lý trạng thái.
- Database: (không bắt buộc trong README này) thường dùng MongoDB — cấu hình kết nối được đặt bằng biến môi trường.

Cấu trúc thư mục (tóm tắt):

- `backend/` - API server, model, controllers, routes, file upload và seed dữ liệu.
- `frontend/` - Next.js app (TypeScript), components, pages, styles, store.

## Yêu cầu
- Node.js (>=14)
- npm hoặc yarn
- MongoDB (cục bộ hoặc hosted)

## Biến môi trường (gợi ý)
- `MONGO_URI` - chuỗi kết nối MongoDB
- `JWT_SECRET` - khóa JWT cho xác thực
- `PORT` - cổng cho backend (ví dụ `3001`)
- `NEXT_PUBLIC_API_URL` hoặc `FRONTEND_URL` - URL tới API backend

## Thiết lập và chạy (phổ thông)

1. Cài đặt backend

```bash
cd backend
npm install
# Tùy repo có script dev hoặc start; nếu không có, dùng:
# node app.js
```

2. Seed dữ liệu mẫu 

```bash
# Trong thư mục backend
node seed.js
```

3. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Lưu ý: Các script chính xác (`dev`, `start`) phụ thuộc vào `package.json` trong mỗi thư mục; hãy kiểm tra và điều chỉnh cho phù hợp.

## API chính (tóm tắt)
- Các route nằm trong `backend/routes/`:
  - `auth.js` - đăng nhập / đăng ký
  - `admin.js` - endpoint quản trị
  - `exam.js` - tạo/điều khiển bài thi
  - `cheating.js` - ghi nhận / truy vấn logs gian lận

## Lưu trữ logs
- Logs ghi lại hành vi nghi vấn được lưu trong `backend/uploads/cheating-logs/` theo cấu trúc phân tầng (ví dụ: `/<examId>/<...>`). Kiểm tra controller `controllers/cheating.js` để biết chi tiết lưu file.

## Kiểm thử
- Frontend có cấu hình Jest (xem `frontend/jest.config.js`, `__tests__`).
- Chạy test frontend:

```bash
cd frontend
npm test
```

