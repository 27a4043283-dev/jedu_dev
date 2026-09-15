# V-SAT Student Website - Local HTML/CSS/JS Prototype

Prototype chuyển đổi từ Sitemap & Information Architecture V-SAT Student Website v1.0.

## Chạy local

Cách 1: mở trực tiếp `index.html` bằng Chrome/Edge.

Cách 2 (khuyến nghị):

```bash
cd vsat_student_local_demo
python -m http.server 8080
```

Mở: `http://localhost:8080`

## Tài khoản demo

- CCCD: `001204012345`
- Mật khẩu: `Demo@123`
- OTP demo: `123456`

## Phạm vi prototype

- Public/Vãng lai: Trang chủ, Kỳ thi V-SAT, Địa điểm thi, Hướng dẫn, Liên hệ, Thi thử external, Đăng ký/Đăng nhập/Quên mật khẩu.
- Student Portal 1 cấp: Thông tin thí sinh, Đăng ký thi, Thanh toán, Kết quả thi, Thông báo, Tài khoản.
- Đăng ký thi: Điểm thi → Đợt thi → Môn thi; action enable/disable theo trạng thái.
- Thanh toán: invoice chưa paid lên trước; 1 invoice → 1 QR → 1 beneficiary; có nút mô phỏng Payment Success.
- Profile sau lock: thay đổi → OTP → tạo invoice → payment success mới apply.
- Kết quả: bảng có vùng điểm môn cuộn ngang + xem phiếu + In/Lưu PDF bằng chức năng Print của browser.
- Thông báo: 2 tab, click mở popup.
- Tài khoản: 3 tab, đổi mật khẩu/đổi email demo.

## Lưu ý

Đây là prototype frontend local, không có backend thật, không gọi VietQR thật, không gửi Email/OTP thật và không lưu dữ liệu vào database. Các thao tác nghiệp vụ được mô phỏng bằng JavaScript trong phiên chạy hiện tại.

## Nhận diện JEDU áp dụng trong bản này

- JEDU Navy: `#003B8F`
- JEDU Blue: `#087BFF`
- JEDU Cyan: `#00B8E8`
- JEDU Gold: `#F7B500`
- Deep Navy: `#061B4E`
- Light Blue: `#F4F8FF`
- Header dùng logo JEDU đầy đủ trên nền sáng; sidebar dùng phiên bản logo trên nền đậm; favicon dùng icon JEDU.
- Font stack ưu tiên `Inter` và các font sans-serif hệ thống để bản demo vẫn chạy local/offline.


## Cập nhật nhận diện HVNH

- Logo ở Header đã chuyển sang `assets/brand/hvnh-logo.png`. Hãy đặt file logo chính thức của Học viện Ngân hàng tại đúng đường dẫn này.
- Footer public và Student Portal: `Powered by JEDU. ©2026 JEDU. All rights reserved.`
