# EV Fleet - Hướng dẫn Setup máy mới (Windows)

## Files cần copy từ máy gốc (KHÔNG có trên Git)

Copy các file sau sang USB / Google Drive / Zalo để mang qua máy mới:

```
1. C:\Users\ADMIN\.cloudflared\4a1b7b96-8713-4861-8284-fe9c17688055.json
   → Copy vào: C:\Users\<USER_MÁY_MỚI>\.cloudflared\

2. D:\...\CarRentalSystem\be\env.production
   → Copy vào: <THƯ_MỤC_PROJECT>\be\env.production
```

**env.production** chứa tất cả API keys, database password, email password - KHÔNG được push lên git.

---

## Hướng dẫn từng bước (máy mới chưa cài gì)

### Bước 1: Mở PowerShell (Run as Administrator)

Click phải nút Start → Terminal (Admin)

### Bước 2: Cài Scoop (package manager)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
irm get.scoop.sh | iex
```

**ĐÓNG PowerShell, mở lại PowerShell (Admin) mới.**

### Bước 3: Cài tất cả tools (1 lệnh)

```powershell
scoop bucket add java
scoop install temurin21-jdk maven nodejs-lts cloudflared git
```

Chờ xong, kiểm tra:

```powershell
java -version
mvn -version
node -v
cloudflared version
```

Tất cả phải hiện version, không lỗi.

### Bước 4: Clone project

```powershell
cd D:\
git clone https://github.com/ToanAltF4/CarRentalSystem.git
cd CarRentalSystem
git checkout dev
```

### Bước 5: Copy 2 file từ máy gốc

**File 1:** Tunnel credentials
```
Từ:  C:\Users\ADMIN\.cloudflared\4a1b7b96-8713-4861-8284-fe9c17688055.json
Vào: C:\Users\<USER>\.cloudflared\4a1b7b96-8713-4861-8284-fe9c17688055.json
```

Tạo thư mục trước nếu chưa có:
```powershell
mkdir "$env:USERPROFILE\.cloudflared" -Force
```

**File 2:** Environment production
```
Từ:  máy gốc: be\env.production
Vào: máy mới: be\env.production
```

### Bước 6: Setup Cloudflare Tunnel

```cmd
setup-tunnel.bat
```

Trình duyệt mở → chọn **fpt.tokyo** → Authorize.

### Bước 7: Cài frontend dependencies

```cmd
cd fe
npm install
cd ..
```

### Bước 8: Chạy!

```cmd
start.bat
```

Hoặc double-click **start-silent.vbs** để chạy ẩn (không hiện cửa sổ đen).

Chờ ~30 giây, truy cập:
- https://fpt.tokyo (Frontend)
- https://api.fpt.tokyo (Backend API)
- https://api.fpt.tokyo/swagger-ui/index.html (API Docs)

---

## Các file .bat có sẵn

| File | Chức năng |
|------|-----------|
| `start.bat` | Chạy tất cả (có cửa sổ CMD) |
| `start-silent.vbs` | Chạy ẩn, không cửa sổ |
| `stop.bat` | Tắt tất cả services |
| `rebuild.bat` | Build lại sau khi code thay đổi |
| `setup-new-machine.bat` | Cài tools tự động (thay cho bước 2-3) |
| `setup-tunnel.bat` | Setup Cloudflare tunnel (bước 6) |

---

## Xử lý sự cố

### Backend không start được
- Kiểm tra Java: `java -version` (cần Java 21)
- Kiểm tra file `be\env.production` đã copy chưa
- Xem log: `be\backend.log` (nếu chạy silent)

### Frontend không build được
- Chạy: `cd fe && npm install` rồi thử lại
- Kiểm tra Node: `node -v` (cần v18+)

### Tunnel không kết nối
- Kiểm tra file credentials: `C:\Users\<USER>\.cloudflared\4a1b7b96-...json`
- Kiểm tra config: `C:\Users\<USER>\.cloudflared\config-evfleet.yml`
- Chạy test: `cloudflared tunnel --config %USERPROFILE%\.cloudflared\config-evfleet.yml ingress validate`

### Trang web trắng / lỗi API
- Backend chưa start xong (chờ thêm 15-30 giây)
- Kiểm tra: http://localhost:8080/actuator/health
- Kiểm tra: http://localhost:4000

---

## Ports sử dụng

| Service | Port |
|---------|------|
| Backend API | 8080 |
| Frontend | 4000 |
