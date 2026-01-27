# Hướng dẫn cấu hình Email cho OTP và Reset Password

## Tổng quan

Hệ thống đã được tích hợp chức năng gửi email OTP khi đăng ký và reset mật khẩu. Email được gửi qua Gmail SMTP.

## Cách tạo App Password cho Gmail

### Bước 1: Bật xác thực 2 bước (2FA)

1. Truy cập https://myaccount.google.com/security
2. Tìm mục "2-Step Verification" (Xác minh 2 bước)
3. Nhấn "Get Started" và làm theo hướng dẫn để bật 2FA

### Bước 2: Tạo App Password

1. Sau khi bật 2FA, quay lại https://myaccount.google.com/security
2. Tìm mục "App passwords" (Mật khẩu ứng dụng)
3. Nhấn vào "App passwords"
4. Chọn "Mail" và "Other (Custom name)"
5. Nhập tên: "EV Fleet Car Rental"
6. Nhấn "Generate"
7. **Sao chép mật khẩu 16 ký tự** (dạng: xxxx xxxx xxxx xxxx)

### Bước 3: Cấu hình trong dự án

Tạo file `.env` hoặc cập nhật biến môi trường với thông tin sau:

```properties
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password từ bước 2
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=EV Fleet Car Rental

# Application URLs
APP_BASE_URL=http://localhost:8080
FE_BASE_URL=http://localhost:5173

# OTP Configuration
OTP_EXPIRATION_MINUTES=10
PASSWORD_RESET_EXPIRATION_HOURS=1
```

## Kiểm tra cấu hình

### 1. Test đăng ký với OTP

```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!",
  "fullName": "Test User",
  "phoneNumber": "0123456789",
  "licenseNumber": "ABC123"
}
```

**Kết quả mong đợi:**
- Status: 201 Created
- Email chứa mã OTP 6 số được gửi đến test@example.com
- User có status `PENDING_VERIFICATION`

### 2. Test xác thực OTP

```bash
POST http://localhost:8080/api/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otpCode": "123456"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- User status chuyển thành `ACTIVE`
- Có thể đăng nhập

### 3. Test resend OTP

```bash
POST http://localhost:8080/api/auth/resend-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Email mới chứa OTP được gửi
- Rate limit: 1 OTP/phút

### 4. Test quên mật khẩu

```bash
POST http://localhost:8080/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Email chứa link reset password được gửi
- Link có dạng: http://localhost:5173/reset-password?token=uuid

### 5. Test reset password

```bash
POST http://localhost:8080/api/auth/reset-password
Content-Type: application/json

{
  "token": "uuid-from-email",
  "newPassword": "NewPassword123!"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Mật khẩu được cập nhật
- Token bị đánh dấu đã sử dụng
- Có thể đăng nhập với mật khẩu mới

## Luồng hoạt động

### Đăng ký với OTP

```
1. User đăng ký → POST /api/auth/register
2. Hệ thống tạo user với status PENDING_VERIFICATION
3. Hệ thống tạo OTP 6 số, lưu vào database
4. Gửi email chứa OTP (hiệu lực 10 phút)
5. User nhập OTP → POST /api/auth/verify-otp
6. Hệ thống kiểm tra OTP
7. Nếu đúng: status → ACTIVE, user có thể login
8. Nếu sai/hết hạn: báo lỗi
```

### Quên mật khẩu

```
1. User yêu cầu reset → POST /api/auth/forgot-password
2. Hệ thống tạo UUID token, lưu vào database
3. Gửi email chứa link reset (hiệu lực 1 giờ)
4. User click link → Frontend hiển thị form reset
5. User nhập password mới → POST /api/auth/reset-password
6. Hệ thống kiểm tra token
7. Nếu hợp lệ: cập nhật password, đánh dấu token đã dùng
8. User login với password mới
```

## Lưu ý bảo mật

1. **App Password**: Không commit App Password vào Git
2. **OTP**: Chỉ hiệu lực 10 phút, 1 lần sử dụng
3. **Reset Token**: Chỉ hiệu lực 1 giờ, 1 lần sử dụng
4. **Rate Limiting**: OTP chỉ gửi tối đa 1 lần/phút
5. **Email Template**: Có cảnh báo không chia sẻ OTP

## Troubleshooting

### Lỗi: Failed to send email

**Nguyên nhân:**
- Sai App Password
- Chưa bật 2FA
- Gmail chặn ứng dụng

**Giải pháp:**
1. Kiểm tra lại App Password
2. Đảm bảo 2FA đã bật
3. Kiểm tra Gmail Security settings

### Lỗi: OTP expired

**Nguyên nhân:**
- OTP quá 10 phút

**Giải pháp:**
- Sử dụng endpoint `/api/auth/resend-otp`

### Lỗi: Token already used

**Nguyên nhân:**
- Reset token đã được sử dụng

**Giải pháp:**
- Yêu cầu reset password mới qua `/api/auth/forgot-password`

## API Endpoints

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/api/auth/register` | POST | No | Đăng ký user mới, gửi OTP |
| `/api/auth/verify-otp` | POST | No | Xác thực OTP |
| `/api/auth/resend-otp` | POST | No | Gửi lại OTP |
| `/api/auth/forgot-password` | POST | No | Yêu cầu reset password |
| `/api/auth/reset-password` | POST | No | Reset password với token |

## Database Schema

### Table: otp_codes

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| email | VARCHAR(255) | Email nhận OTP |
| otp_code | VARCHAR(6) | Mã OTP 6 số |
| expires_at | DATETIME | Thời gian hết hạn |
| verified | BOOLEAN | Đã xác thực chưa |
| created_at | DATETIME | Thời gian tạo |

### Table: password_reset_tokens

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| email | VARCHAR(255) | Email yêu cầu reset |
| token | VARCHAR(255) | UUID token |
| expires_at | DATETIME | Thời gian hết hạn |
| used | BOOLEAN | Đã sử dụng chưa |
| created_at | DATETIME | Thời gian tạo |

## Tích hợp Frontend

Frontend cần implement các màn hình sau:

1. **OTP Verification Screen**: Hiển thị sau khi đăng ký thành công
2. **Forgot Password Form**: Form nhập email
3. **Reset Password Form**: Form nhập password mới (từ link trong email)

Xem chi tiết trong file `FRONTEND_INTEGRATION.md`
