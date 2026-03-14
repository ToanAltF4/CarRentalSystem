# EV Fleet - Hướng dẫn cài đặt trên máy mới (Windows)

## Máy mới chưa cài gì - Chạy lần lượt các lệnh sau trong PowerShell (Run as Admin)

### Bước 1: Cài Scoop (package manager - giống apt trên Linux)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex
```

Đóng PowerShell, mở lại PowerShell mới.

### Bước 2: Cài tất cả tools cần thiết (1 lệnh)

```powershell
scoop bucket add java
scoop install temurin21-jdk maven nodejs-lts cloudflared git
```

### Bước 3: Verify đã cài xong

```powershell
java -version
mvn -version
node -v
npm -v
cloudflared version
git --version
```

Tất cả phải hiện version, không có lỗi.

### Bước 4: Clone project

```powershell
cd D:\
git clone https://github.com/YOUR_REPO/CarRentalSystem.git
cd CarRentalSystem
```

### Bước 5: Setup Cloudflare Tunnel (chỉ cần 1 lần)

**Cách 1: Copy từ máy gốc (nhanh nhất)**

Copy toàn bộ thư mục `C:\Users\ADMIN\.cloudflared\` từ máy gốc sang máy mới tại `C:\Users\<TEN_USER>\.cloudflared\`

Files cần copy:
- `cert.pem`
- `4a1b7b96-8713-4861-8284-fe9c17688055.json`
- `config-evfleet.yml`

Sau đó sửa đường dẫn trong `config-evfleet.yml`:
```
credentials-file: C:\Users\<TEN_USER>\.cloudflared\4a1b7b96-8713-4861-8284-fe9c17688055.json
```

Và sửa đường dẫn trong `start.bat`:
```
set "CLOUDFLARED_CONFIG=C:\Users\<TEN_USER>\.cloudflared\config-evfleet.yml"
```

**Cách 2: Login lại (nếu không copy được)**

```powershell
cloudflared tunnel login
```
Chọn domain `fpt.tokyo` trên trình duyệt.

Rồi tạo config file `C:\Users\<TEN_USER>\.cloudflared\config-evfleet.yml`:
```yaml
tunnel: 4a1b7b96-8713-4861-8284-fe9c17688055
credentials-file: C:\Users\<TEN_USER>\.cloudflared\4a1b7b96-8713-4861-8284-fe9c17688055.json

ingress:
  - hostname: api.fpt.tokyo
    service: http://localhost:8080
  - hostname: fpt.tokyo
    service: http://localhost:3000
  - hostname: www.fpt.tokyo
    service: http://localhost:3000
  - hostname: kimngan.site
    service: http://localhost:5000
  - hostname: www.kimngan.site
    service: http://localhost:5000
  - service: http_status:404
```

### Bước 6: Chạy project

Double-click `start.bat`

Hoặc chạy trong CMD:
```cmd
start.bat
```

---

## Tóm tắt nhanh (copy-paste)

```powershell
# PowerShell (Admin) - Chạy 1 lần duy nhất
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex

# Đóng mở lại PowerShell rồi chạy:
scoop bucket add java
scoop install temurin21-jdk maven nodejs-lts cloudflared git

# Clone project
git clone https://github.com/YOUR_REPO/CarRentalSystem.git
cd CarRentalSystem

# Chạy
start.bat
```

## Ports sử dụng

| Service | Port |
|---------|------|
| Backend API | 8080 |
| Frontend | 3000 |

## URLs khi chạy tunnel

| URL | Service |
|-----|---------|
| https://fpt.tokyo | Frontend |
| https://api.fpt.tokyo | Backend API |
| https://api.fpt.tokyo/swagger-ui/index.html | API Docs |

## Tài khoản test (trong database)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@evfleet.com | admin123 |
| Staff | staff@evfleet.com | staff123 |
| Customer | customer1@evfleet.com | customer123 |

(Kiểm tra lại password trong migration scripts nếu không đúng)
