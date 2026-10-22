# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> Mystery Boxes Game E2E Flow >> 2. Full Admin Flow: Login -> Dashboard -> Manage Mystery Boxes -> Config Unlucky Count -> Questions -> Dice -> Settings
- Location: e2e/game.spec.ts:71:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Đã lưu cấu hình và khởi tạo lại các ô thành công!')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text=Đã lưu cấu hình và khởi tạo lại các ô thành công!') with timeout 5000ms
  - waiting for locator('text=Đã lưu cấu hình và khởi tạo lại các ô thành công!')

```

```yaml
- alert
- complementary:
  - text: 👑
  - heading "ADMIN PANEL" [level=2]
  - text: 1 User Quản Trị Duy Nhất
  - navigation:
    - link "📊 Tổng Quan & Kết Quả":
      - /url: /admin/dashboard
    - link "❓ Bộ Câu Hỏi & Trả Lời":
      - /url: /admin/questions
    - link "🎁 Ô Vuông Bí Mật":
      - /url: /admin/boxes
    - link "🎲 Cục Lắc Xí Ngầu":
      - /url: /admin/dice
    - link "⚙️ Cài Đặt Mật Khẩu":
      - /url: /admin/settings
  - link "🎮 Xem Giao Diện Người Chơi":
    - /url: /
  - button "🚪 Đăng xuất Quản trị"
- main:
  - heading "QUẢN LÝ Ô VUÔNG BÍ MẬT" [level=1]
  - paragraph: Tổng số ô vuông = Số câu hỏi + Số ô "May mắn lần sau" + Số ô "Lắc xí ngầu"
  - text: Tổng số ô 14 Ô câu hỏi 10 May mắn lần sau 4 Lắc xí ngầu 🎲 0 Đã mở / Chưa mở 2 / 12
  - heading "⚙️ Cấu Hình Số Lượng Ô" [level=2]
  - text: Số ô "Chúc bạn may mắn lần sau" *
  - spinbutton: "4"
  - paragraph: Người chơi trúng ô này sẽ không phải trả lời câu hỏi.
  - text: Số ô "Lắc xí ngầu" 🎲 *
  - spinbutton: "0"
  - paragraph: Người chơi trúng ô này sẽ được chuyển ngay sang màn hình tung xí ngầu.
  - text: "Số câu hỏi hiện có:"
  - strong: "10"
  - text: "Số ô may mắn lần sau:"
  - strong: "4"
  - text: "Số ô lắc xí ngầu:"
  - strong: "0"
  - text: "Tổng ô hiển thị cho player: 14 Lỗi cập nhật cấu hình ô"
  - button "LƯU & CẬP NHẬT BÀN CHƠI"
  - button "🔄 Xáo & Đặt lại tất cả các ô"
  - paragraph: Làm mới tất cả các ô ❌ trở về ô ❓ để bắt đầu ván mới
  - heading "🎁 Danh Sách Trạng Thái Các Ô (14)" [level=2]
  - button "Làm mới"
  - text: "#01 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#02 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#03 ❓ May mắn lần sau"
  - paragraph: Chưa mở
  - text: "#04 ❌ Câu hỏi thử thách"
  - paragraph: "Mở bởi: test"
  - text: "#05 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#06 ❓ May mắn lần sau"
  - paragraph: Chưa mở
  - text: "#07 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#08 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#09 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#10 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#11 ❓ May mắn lần sau"
  - paragraph: Chưa mở
  - text: "#12 ❓ Câu hỏi thử thách"
  - paragraph: Chưa mở
  - text: "#13 ❓ May mắn lần sau"
  - paragraph: Chưa mở
  - text: "#14 ❌ Câu hỏi thử thách"
  - paragraph: "Mở bởi: Senior QA Player"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE_URL = 'http://localhost:3000'
  4   | 
  5   | test.describe('Mystery Boxes Game E2E Flow', () => {
  6   |   test('1. Full Player Flow: Password -> Mystery Boxes Grid (❓) -> Red Running Highlight -> Pick Box -> Modal (Question or Lucky) -> Marked ❌ -> History', async ({ page }) => {
  7   |     // 1. Visit landing page
  8   |     await page.goto(BASE_URL)
  9   |     await expect(page.locator('h1')).toContainText('Ô VUÔNG BÍ MẬT')
  10  | 
  11  |     // 2. Test wrong password
  12  |     await page.fill('input[type="password"]', 'wrongpass')
  13  |     await page.fill('input[type="text"]', 'Tester 1')
  14  |     await page.click('button[type="submit"]')
  15  |     await expect(page.locator('text=Mật khẩu truy cập không đúng')).toBeVisible({ timeout: 5000 })
  16  | 
  17  |     // 3. Test correct password & player entry
  18  |     await page.fill('input[type="password"]', 'play2024')
  19  |     await page.fill('input[type="text"]', 'Senior QA Player')
  20  |     await page.click('button[type="submit"]')
  21  | 
  22  |     // 4. Verify redirected to /play
  23  |     await page.waitForURL('**/play**')
  24  |     await expect(page.locator('text=Senior QA Player')).toBeVisible()
  25  | 
  26  |     // 5. Test Mystery Box Grid
  27  |     // Verify question mark emojis ❓ are present on unopened boxes
  28  |     const unopenedEmoji = page.locator('span:has-text("❓")')
  29  |     await expect(unopenedEmoji.first()).toBeVisible()
  30  | 
  31  |     // Click "BẮT ĐẦU CHỌN Ô BÍ MẬT"
  32  |     const startBtn = page.locator('button:has-text("BẮT ĐẦU CHỌN Ô BÍ MẬT")')
  33  |     await expect(startBtn).toBeVisible()
  34  |     await startBtn.click()
  35  | 
  36  |     // Button updates state while runner is active
  37  |     await expect(page.locator('text=Đang tìm ô bí mật...')).toBeVisible()
  38  | 
  39  |     // Wait for the random selection and deceleration to finish (~3.5s)
  40  |     const continueBtn = page.locator('button:has-text("TIẾP TỤC CHƠI")')
  41  |     await expect(continueBtn).toBeVisible({ timeout: 15000 })
  42  | 
  43  |     // Click "TIẾP TỤC CHƠI" to close modal
  44  |     await continueBtn.click()
  45  |     await expect(continueBtn).not.toBeVisible()
  46  | 
  47  |     // Verify at least one box now has emoji ❌
  48  |     const openedEmoji = page.locator('span:has-text("❌")')
  49  |     await expect(openedEmoji.first()).toBeVisible()
  50  | 
  51  |     // Verify history recorded the pick
  52  |     await expect(page.locator('text=Lịch Sử Lượt Chơi')).toBeVisible()
  53  |     const historyEntries = page.locator('div:has-text("Đã lưu")')
  54  |     await expect(historyEntries.first()).toBeVisible()
  55  | 
  56  |     // 6. Test Switch to Dice Mode
  57  |     await page.click('button:has-text("LẮC XÍ NGẦU")')
  58  |     const rollBtn = page.locator('button:has-text("LẮC XÍ NGẦU NGAY")')
  59  |     await expect(rollBtn).toBeVisible()
  60  | 
  61  |     // Roll dice
  62  |     await rollBtn.click()
  63  |     await expect(page.locator('text=Đang lắc xí ngầu...')).toBeVisible()
  64  | 
  65  |     // Dice finishes (~1.5s)
  66  |     const diceModal = page.locator('text=Kết quả lắc xí ngầu')
  67  |     await expect(diceModal).toBeVisible({ timeout: 6000 })
  68  |     await page.click('button:has-text("TIẾP TỤC CHƠI")')
  69  |   })
  70  | 
  71  |   test('2. Full Admin Flow: Login -> Dashboard -> Manage Mystery Boxes -> Config Unlucky Count -> Questions -> Dice -> Settings', async ({ page }) => {
  72  |     const uniqueSuffix = Date.now().toString().slice(-4)
  73  | 
  74  |     // 1. Visit /admin
  75  |     await page.goto(`${BASE_URL}/admin`)
  76  |     await expect(page.locator('h1')).toContainText('ĐĂNG NHẬP QUẢN TRỊ')
  77  | 
  78  |     // 2. Login with admin credentials
  79  |     await page.fill('input[type="password"]', 'admin123')
  80  |     await page.click('button[type="submit"]')
  81  | 
  82  |     // 3. Verify on Dashboard
  83  |     await page.waitForURL('**/admin/dashboard')
  84  |     await expect(page.locator('text=TỔNG QUAN & LỊCH SỬ KẾT QUẢ')).toBeVisible()
  85  | 
  86  |     // 4. Manage Mystery Boxes
  87  |     await page.click('a:has-text("Ô Vuông Bí Mật")')
  88  |     await page.waitForURL('**/admin/boxes')
  89  |     await expect(page.locator('h1')).toContainText('QUẢN LÝ Ô VUÔNG BÍ MẬT')
  90  | 
  91  |     // Configure unlucky count to 4
  92  |     await page.fill('input[type="number"]', '4')
  93  |     await page.click('button:has-text("LƯU & CẬP NHẬT BÀN CHƠI")')
> 94  |     await expect(page.locator('text=Đã lưu cấu hình và khởi tạo lại các ô thành công!')).toBeVisible({ timeout: 5000 })
      |                                                                                          ^ Error: expect(locator).toBeVisible() failed
  95  | 
  96  |     // 5. Manage Questions
  97  |     await page.click('a:has-text("Bộ Câu Hỏi & Trả Lời")')
  98  |     await page.waitForURL('**/admin/questions')
  99  |     await expect(page.locator('h1')).toContainText('KHAI BÁO BỘ CÂU HỎI & TRẢ LỜI')
  100 | 
  101 |     // Add new question
  102 |     const qText = `Thử thách đặc biệt ${uniqueSuffix}?`
  103 |     await page.fill('textarea[placeholder*="Điều điên rồ nhất"]', qText)
  104 |     await page.fill('textarea[placeholder*="Tùy người chơi"]', 'Trả lời tự do')
  105 |     await page.click('button:has-text("Thêm Vào Bộ Câu Hỏi")')
  106 |     await expect(page.locator(`span:has-text("${qText}")`).first()).toBeVisible({ timeout: 5000 })
  107 | 
  108 |     // 6. Manage Dice Options
  109 |     await page.click('a:has-text("Cục Lắc Xí Ngầu")')
  110 |     await page.waitForURL('**/admin/dice')
  111 |     await expect(page.locator('h1')).toContainText('QUẢN LÝ CỤC LẮC XÍ NGẦU')
  112 | 
  113 |     // Add new dice option
  114 |     const diceLabel = `Uống cùng bạn ${uniqueSuffix}`
  115 |     await page.fill('input[placeholder*="Uống 1 ly"]', diceLabel)
  116 |     await page.fill('textarea[placeholder*="Người chơi phải thực hiện"]', 'Uống 1 ngụm cùng người bên cạnh')
  117 |     await page.click('button:has-text("Thêm Vào Xí Ngầu")')
  118 |     await expect(page.locator(`text=${diceLabel}`).first()).toBeVisible({ timeout: 5000 })
  119 | 
  120 |     // 7. Check Settings Page
  121 |     await page.click('a:has-text("Cài Đặt Mật Khẩu")')
  122 |     await page.waitForURL('**/admin/settings')
  123 |     await expect(page.locator('h3:has-text("Đổi Mật Khẩu Người Chơi")')).toBeVisible()
  124 |     await expect(page.locator('h3:has-text("Đổi Mật Khẩu Quản Trị")')).toBeVisible()
  125 | 
  126 |     // 8. Logout
  127 |     await page.click('button:has-text("Đăng xuất Quản trị")')
  128 |     await page.waitForURL('**/admin')
  129 |     await expect(page.locator('h1')).toContainText('ĐĂNG NHẬP QUẢN TRỊ')
  130 |   })
  131 | })
  132 | 
```