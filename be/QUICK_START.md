# Quick Start Guide - Testing OTP & Password Reset

## ✅ Đã hoàn thành
- ✅ Cấu hình email: hoangdhfpt1103@gmail.com
- ✅ Build thành công
- ✅ Tất cả endpoints đã sẵn sàng

## 🚀 Bước 1: Chạy ứng dụng

```bash
cd d:\Ky_7\CarRentalSystem\be
mvn spring-boot:run
```

Đợi đến khi thấy: `Started CarRentalSystemApplication`

## 📧 Bước 2: Test đăng ký với OTP

### 2.1. Gửi request đăng ký

Mở file `test-auth-endpoints.http` và chạy request đầu tiên:

```http
POST http://localhost:8080/api/auth/register
```

**Kết quả mong đợi:**
- Status: 201 Created
- Email được gửi đến test@example.com với mã OTP 6 số

### 2.2. Kiểm tra email

1. Đăng nhập vào email test@example.com
2. Tìm email từ "EV Fleet Car Rental"
3. Sao chép mã OTP 6 số

### 2.3. Xác thực OTP

Thay `123456` bằng mã OTP từ email và chạy:

```http
POST http://localhost:8080/api/auth/verify-otp
{
  "email": "test@example.com",
  "otpCode": "123456"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Message: "Email verified successfully"

### 2.4. Đăng nhập

```http
POST http://localhost:8080/api/auth/login
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Nhận được access token

## 🔐 Bước 3: Test quên mật khẩu

### 3.1. Yêu cầu reset password

```http
POST http://localhost:8080/api/auth/forgot-password
{
  "email": "test@example.com"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Email được gửi với link reset password

### 3.2. Kiểm tra email

1. Mở email từ "EV Fleet Car Rental"
2. Click vào nút "Đặt lại mật khẩu" hoặc copy link
3. Lấy token từ URL (phần sau `?token=`)

### 3.3. Reset password

Thay `paste-token-from-email-here` bằng token từ email:

```http
POST http://localhost:8080/api/auth/reset-password
{
  "token": "paste-token-from-email-here",
  "newPassword": "NewPassword123!"
}
```

**Kết quả mong đợi:**
- Status: 200 OK
- Message: "Password reset successfully"

### 3.4. Đăng nhập với mật khẩu mới

```http
POST http://localhost:8080/api/auth/login
{
  "email": "test@example.com",
  "password": "NewPassword123!"
}
```

## 🧪 Test các trường hợp lỗi

### Test OTP hết hạn
- Đợi 10 phút sau khi nhận OTP
- Thử verify → Sẽ báo lỗi "OTP expired"

### Test resend OTP
```http
POST http://localhost:8080/api/auth/resend-otp
{
  "email": "test@example.com"
}
```

### Test login khi chưa verify
- Đăng ký user mới
- Không verify OTP
- Thử login → Sẽ báo "Vui lòng xác thực email trước khi đăng nhập"

### Test reset token đã dùng
- Reset password thành công 1 lần
- Thử dùng lại token cũ → Sẽ báo lỗi "Invalid or expired token"

## 📊 Kiểm tra database

Sau khi test, kiểm tra các bảng:

```sql
-- Xem OTP codes
SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 5;

-- Xem password reset tokens
SELECT * FROM password_reset_tokens ORDER BY created_at DESC LIMIT 5;

-- Xem user status
SELECT id, email, full_name, status FROM users WHERE email = 'test@example.com';
```

## ⚠️ Lưu ý

1. **Email thật**: Để test đầy đủ, dùng email thật của bạn thay vì test@example.com
2. **Spam folder**: Nếu không thấy email, kiểm tra thư mục spam
3. **Rate limiting**: Chỉ gửi được 1 OTP/phút cho mỗi email
4. **Expiration**: 
   - OTP: 10 phút
   - Reset token: 1 giờ

## 🎯 Checklist hoàn thành

- [ ] Ứng dụng chạy thành công
- [ ] Đăng ký user mới
- [ ] Nhận được email OTP
- [ ] Verify OTP thành công
- [ ] Login thành công
- [ ] Yêu cầu forgot password
- [ ] Nhận được email reset password
- [ ] Reset password thành công
- [ ] Login với password mới thành công

## 🐛 Troubleshooting

### Không nhận được email
1. Kiểm tra log console có lỗi gì không
2. Kiểm tra email credentials trong env.example
3. Kiểm tra spam folder
4. Thử gửi lại với resend-otp

### Build lỗi
```bash
mvn clean install -DskipTests
```

### Database lỗi
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra database `ev_fleet` đã tạo chưa

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs
2. Database tables (otp_codes, password_reset_tokens, users)
3. Email spam folder
4. File `EMAIL_SETUP.md` để biết thêm chi tiết
