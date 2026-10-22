import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Mystery Boxes Game E2E Flow', () => {
  test('1. Full Player Flow: Password -> Mystery Boxes Grid (❓) -> Red Running Highlight -> Pick Box -> Modal (Question or Lucky) -> Marked ❌ -> History', async ({ page }) => {
    // 1. Visit landing page
    await page.goto(BASE_URL)
    await expect(page.locator('h1')).toContainText('Ô VUÔNG BÍ MẬT')

    // 2. Test wrong password
    await page.fill('input[type="password"]', 'wrongpass')
    await page.fill('input[type="text"]', 'Tester 1')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Mật khẩu truy cập không đúng')).toBeVisible({ timeout: 5000 })

    // 3. Test correct password & player entry
    await page.fill('input[type="password"]', 'play2024')
    await page.fill('input[type="text"]', 'Senior QA Player')
    await page.click('button[type="submit"]')

    // 4. Verify redirected to /play
    await page.waitForURL('**/play**')
    await expect(page.locator('text=Senior QA Player')).toBeVisible()

    // 5. Test Mystery Box Grid
    // Verify question mark emojis ❓ are present on unopened boxes
    const unopenedEmoji = page.locator('span:has-text("❓")')
    await expect(unopenedEmoji.first()).toBeVisible()

    // Click "BẮT ĐẦU CHỌN Ô BÍ MẬT"
    const startBtn = page.locator('button:has-text("BẮT ĐẦU CHỌN Ô BÍ MẬT")')
    await expect(startBtn).toBeVisible()
    await startBtn.click()

    // Button updates state while runner is active
    await expect(page.locator('text=Đang tìm ô bí mật...')).toBeVisible()

    // Wait for the random selection and deceleration to finish (~3.5s)
    const continueBtn = page.locator('button:has-text("TIẾP TỤC CHƠI")')
    await expect(continueBtn).toBeVisible({ timeout: 15000 })

    // Click "TIẾP TỤC CHƠI" to close modal
    await continueBtn.click()
    await expect(continueBtn).not.toBeVisible()

    // Verify at least one box now has emoji ❌
    const openedEmoji = page.locator('span:has-text("❌")')
    await expect(openedEmoji.first()).toBeVisible()

    // Verify history recorded the pick
    await expect(page.locator('text=Lịch Sử Lượt Chơi')).toBeVisible()
    const historyEntries = page.locator('div:has-text("Đã lưu")')
    await expect(historyEntries.first()).toBeVisible()

    // 6. Test Switch to Dice Mode
    await page.click('button:has-text("LẮC XÍ NGẦU")')
    const rollBtn = page.locator('button:has-text("LẮC XÍ NGẦU NGAY")')
    await expect(rollBtn).toBeVisible()

    // Roll dice
    await rollBtn.click()
    await expect(page.locator('text=Đang lắc xí ngầu...')).toBeVisible()

    // Dice finishes (~1.5s)
    const diceModal = page.locator('text=Kết quả lắc xí ngầu')
    await expect(diceModal).toBeVisible({ timeout: 6000 })
    await page.click('button:has-text("TIẾP TỤC CHƠI")')
  })

  test('2. Full Admin Flow: Login -> Dashboard -> Manage Mystery Boxes -> Config Unlucky Count -> Questions -> Dice -> Settings', async ({ page }) => {
    const uniqueSuffix = Date.now().toString().slice(-4)

    // 1. Visit /admin
    await page.goto(`${BASE_URL}/admin`)
    await expect(page.locator('h1')).toContainText('ĐĂNG NHẬP QUẢN TRỊ')

    // 2. Login with admin credentials
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // 3. Verify on Dashboard
    await page.waitForURL('**/admin/dashboard')
    await expect(page.locator('text=TỔNG QUAN & LỊCH SỬ KẾT QUẢ')).toBeVisible()

    // 4. Manage Mystery Boxes
    await page.click('a:has-text("Ô Vuông Bí Mật")')
    await page.waitForURL('**/admin/boxes')
    await expect(page.locator('h1')).toContainText('QUẢN LÝ Ô VUÔNG BÍ MẬT')

    // Configure unlucky count to 4
    await page.fill('input[type="number"]', '4')
    await page.click('button:has-text("LƯU & CẬP NHẬT BÀN CHƠI")')
    await expect(page.locator('text=Đã lưu cấu hình và khởi tạo lại các ô thành công!')).toBeVisible({ timeout: 5000 })

    // 5. Manage Questions
    await page.click('a:has-text("Bộ Câu Hỏi & Trả Lời")')
    await page.waitForURL('**/admin/questions')
    await expect(page.locator('h1')).toContainText('KHAI BÁO BỘ CÂU HỎI & TRẢ LỜI')

    // Add new question
    const qText = `Thử thách đặc biệt ${uniqueSuffix}?`
    await page.fill('textarea[placeholder*="Điều điên rồ nhất"]', qText)
    await page.fill('textarea[placeholder*="Tùy người chơi"]', 'Trả lời tự do')
    await page.click('button:has-text("Thêm Vào Bộ Câu Hỏi")')
    await expect(page.locator(`span:has-text("${qText}")`).first()).toBeVisible({ timeout: 5000 })

    // 6. Manage Dice Options
    await page.click('a:has-text("Cục Lắc Xí Ngầu")')
    await page.waitForURL('**/admin/dice')
    await expect(page.locator('h1')).toContainText('QUẢN LÝ CỤC LẮC XÍ NGẦU')

    // Add new dice option
    const diceLabel = `Uống cùng bạn ${uniqueSuffix}`
    await page.fill('input[placeholder*="Uống 1 ly"]', diceLabel)
    await page.fill('textarea[placeholder*="Người chơi phải thực hiện"]', 'Uống 1 ngụm cùng người bên cạnh')
    await page.click('button:has-text("Thêm Vào Xí Ngầu")')
    await expect(page.locator(`text=${diceLabel}`).first()).toBeVisible({ timeout: 5000 })

    // 7. Check Settings Page
    await page.click('a:has-text("Cài Đặt Mật Khẩu")')
    await page.waitForURL('**/admin/settings')
    await expect(page.locator('h3:has-text("Đổi Mật Khẩu Người Chơi")')).toBeVisible()
    await expect(page.locator('h3:has-text("Đổi Mật Khẩu Quản Trị")')).toBeVisible()

    // 8. Logout
    await page.click('button:has-text("Đăng xuất Quản trị")')
    await page.waitForURL('**/admin')
    await expect(page.locator('h1')).toContainText('ĐĂNG NHẬP QUẢN TRỊ')
  })
})
