import { test, expect } from '@playwright/test'

test.describe('Cross-browser compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('responsive layout', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('nav')).toHaveClass(/mobile-menu/)
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('nav')).toHaveClass(/tablet-menu/)
    
    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('nav')).toHaveClass(/desktop-menu/)
  })

  test('product images', async ({ page }) => {
    const image = page.locator('.product-image')
    await expect(image).toBeVisible()
    
    // Verificar carregamento de imagem WebP
    const srcset = await image.getAttribute('srcset')
    expect(srcset).toContain('.webp')
  })

  test('payment form', async ({ page }) => {
    await page.goto('/checkout')
    
    // Testar campos de formulário
    await page.fill('[name="cardNumber"]', '4242424242424242')
    await page.fill('[name="expiry"]', '1225')
    await page.fill('[name="cvc"]', '123')
    
    await expect(page.locator('form')).toBeValid()
  })

  test('animations', async ({ page }) => {
    const menu = page.locator('.mobile-menu')
    await menu.click()
    
    await expect(menu).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })
}) 