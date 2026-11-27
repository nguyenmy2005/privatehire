# Phân công & cách làm chung — PrivateHire

Nhóm 2 người: **Mỹ** và **Linh**. Code được tách theo mô hình **MVC**, mỗi người giữ một tầng để hai bên ít khi sửa trùng file.

## 1. Cấu trúc MVC

```
models/        M — Dữ liệu: kiểu (type), dữ liệu gốc, đọc/ghi localStorage
controllers/   C — Nghiệp vụ: tính giá, kiểm tra tuyến, đặt xe, đăng nhập, mã giảm giá...
app/           V — Các trang (route của Next.js)
components/    V — Thành phần giao diện dùng lại
lib/           Tiện ích chung: format.ts (mọi tầng), ui.ts + images.ts (chỉ View)
```

Luồng gọi **chỉ đi một chiều**:

```
View (app/, components/)  ──gọi──▶  Controller  ──gọi──▶  Model  ──▶  localStorage
```

| Tầng | Được import | KHÔNG được import |
|---|---|---|
| View | `@/controllers/*`, `import type` từ `@/models/*`, `@/lib/*` | giá trị từ `@/models/*`, `localStorage` trực tiếp |
| Controller | `@/models/*`, `@/lib/format` | `react`, `next/*`, `@/components/*`, `@/app/*` |
| Model | `./storage`, model khác, `@/lib/format` | `@/controllers/*`, View |

Các luật này được **ESLint kiểm tra tự động** (xem `eslint.config.mjs`). Chạy `npm run lint` mà báo `no-restricted-imports` là đang gọi sai tầng.

### View đọc dữ liệu thế nào

Dữ liệu nằm trong localStorage nên server không đọc được. Đừng đọc trong `useEffect` rồi `setState` (ESLint sẽ báo lỗi). Dùng hook `useStoreVersion` và đọc thẳng lúc render:

```tsx
import { useStoreVersion } from "@/lib/useStore";

const v = useStoreVersion();            // 0 trên server, > 0 trên trình duyệt
const user = v ? currentUser() : null;  // tự vẽ lại mỗi khi Model ghi dữ liệu
```

Mỗi lần Model gọi `set()` (hay đăng nhập/đăng xuất), mọi component đang dùng hook này sẽ tự cập nhật, không cần tải lại trang. Form cần giá trị ban đầu từ dữ liệu thì tách thành component con, truyền dữ liệu qua props và đặt `key` (xem `app/account/page.tsx`).

### Bản đồ file

| File | Chứa gì |
|---|---|
| `models/storage.ts` | `get` / `set` localStorage |
| `models/user.model.ts` | `User`, tài khoản, phiên đăng nhập |
| `models/booking.model.ts` | `Booking`, `Trip`, `Review`, đọc/lưu đơn |
| `models/vehicle.model.ts` | `Vehicle`, `Driver`, danh sách xe & tài xế |
| `models/offer.model.ts` | `Offer`, mã công khai |
| `models/enquiry.model.ts` | `Enquiry` |
| `models/message.model.ts` | `Message` (hộp thư) |
| `models/place.model.ts` | Khu vực, địa danh, khách sạn, sân bay, bảng giá cố định |
| `models/service.model.ts` | `SERVICES`, `DURATION` |
| `models/search.model.ts` | Bản nháp tìm chuyến giữa trang chủ và `/book` |
| `controllers/auth.controller.ts` | `register`, `login`, `logout`, `currentUser`, `createStaff` |
| `controllers/booking.controller.ts` | `available`, `canChange`, `isFuture`, đọc/lưu đơn, đội xe |
| `controllers/pricing.controller.ts` | `quote`, `fromPrice`, `rateForSeats` |
| `controllers/route.controller.ts` | `checkRoute`, `tripFare`, `groupsFor`, `labelsFor` |
| `controllers/offer.controller.ts` | `findOffer`, `redeemOffer`, `findPublic`, `redeemPublic` |
| `controllers/message.controller.ts` | `send`, `messages`, `markRead`, `unread` |
| `controllers/enquiry.controller.ts` | đọc/lưu câu hỏi |
| `controllers/seed.ts` | Dữ liệu demo, tự chạy lần đầu mở web |
| `controllers/store.controller.ts` | Cho View nghe "dữ liệu vừa đổi" |
| `lib/useStore.ts` | Hook `useStoreVersion` cho View |

## 2. Ai giữ phần nào

| | **Mỹ — Model + Controller** | **Linh — View** |
|---|---|---|
| Thư mục | `models/`, `controllers/`, `lib/format.ts` | `app/`, `components/`, `lib/ui.ts`, `lib/images.ts`, `app/globals.css` |
| Việc chính | Kiểu dữ liệu, lưu trữ, quy tắc nghiệp vụ (giá, tuyến, xe trống, mã giảm, đăng nhập), dữ liệu demo | Trang, form, bố cục, responsive, thông báo, trải nghiệm người dùng |
| Review PR của | Linh | Mỹ |

"Giữ" nghĩa là người đó chịu trách nhiệm và review — không có nghĩa người kia cấm đụng. Nếu cần sửa file của người kia: báo trước trong nhóm, và người giữ phần đó review PR.

### Hợp đồng giữa hai tầng

Tên hàm + tham số + kiểu trả về được `export` từ `controllers/` chính là **"API" mà View dùng**.

- **Mỹ** muốn đổi tên/đổi tham số một hàm controller đang được View dùng → mở PR sửa luôn chỗ gọi trong View (hoặc báo Linh), không để build hỏng.
- **Linh** cần dữ liệu/hàm mới → mở issue (hoặc nhắn) mô tả *cần gì, đầu vào, đầu ra*. Trong lúc chờ có thể viết tạm hàm trong controller với `// TODO(Mỹ): ...` để không bị kẹt, Mỹ sẽ hoàn thiện sau.
- Thêm một tính năng mới thường đi theo thứ tự: Model (dữ liệu) → Controller (luật) → View (giao diện). Hai người thống nhất tên hàm trước rồi làm song song.

## 3. Quy trình Git

Mỗi người có **một nhánh riêng** trên GitHub:

| Nhánh | Của ai | Làm gì |
|---|---|---|
| `main` | chung | Code đã review, luôn chạy được. Không ai push thẳng vào. |
| `my` | Mỹ | Model + Controller |
| `linh` | Linh | View |

1. Lần đầu (clone xong) chuyển sang nhánh của mình:
   ```bash
   git switch my
   ```
   ```bash
   git switch linh
   ```
2. Mỗi lần bắt đầu làm, lấy code mới nhất của `main` vào nhánh mình (để có phần người kia đã merge):
   ```bash
   git pull && git pull origin main
   ```
3. Commit nhỏ, message rõ ràng, có tiền tố tầng:
   - `model: thêm trường note vào Booking`
   - `controller: giảm 10% cho chuyến trước 7h`
   - `view: thêm bộ lọc trạng thái ở trang My bookings`
4. Trước khi push, chạy cả hai (phải sạch lỗi build và không có lỗi `no-restricted-imports`):
   ```bash
   npm run build
   ```
   ```bash
   npm run lint
   ```
5. Push lên nhánh của mình (`git push`), rồi mở Pull Request **`my` → `main`** hoặc **`linh` → `main`**. GitHub Actions (`.github/workflows/ci.yml`) tự chạy lint + build; phải xanh ✅ và **người còn lại review** rồi mới merge.
6. Khi merge PR trên GitHub chọn **Create a merge commit** (không chọn Squash), để nhánh cá nhân vẫn khớp lịch sử với `main`. **Không xoá** nhánh `my` / `linh` sau khi merge, quay lại bước 2 làm tiếp.

### Tránh conflict

- Mỗi người chỉ sửa trong thư mục mình giữ là gần như không bao giờ conflict.
- File hay bị đụng chung: `controllers/booking.controller.ts` (export cho View) và `app/globals.css`. Sửa ít, merge sớm.
- Mở PR và merge sớm (vài ngày một lần), đừng để nhánh `my` / `linh` lệch `main` quá lâu.
- Pull `main` vào nhánh của mình mỗi ngày (`git pull origin main`).

## 4. Chạy dự án

```bash
npm install
```
```bash
npm run dev
```

Mở http://localhost:3000. Tài khoản demo (mật khẩu trong `controllers/seed.ts`): khách `anna@gmail.com`, nhân viên `staff@gmail.com`. Muốn reset dữ liệu demo: xoá localStorage của trang trong DevTools rồi tải lại.
