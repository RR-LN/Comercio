import { test, expect } from '@playwright/test'

const devices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
]

test.describe('Mobile responsiveness', () => {
  for (const device of devices) {
    test(`layout on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: device.width,
        height: device.height,
      })

      await page.goto('/')

      // Testar menu
      const menu = page.locator('nav')
      await expect(menu).toBeVisible()
      
      if (device.width < 768) {
        await expect(menu).toHaveClass(/mobile/)
        await expect(page.locator('.hamburger')).toBeVisible()
      } else {
        await expect(menu).toHaveClass(/desktop/)
        await expect(page.locator('.hamburger')).not.toBeVisible()
      }

      // Testar grid de produtos
      const grid = page.locator('.product-grid')
      const columns = await grid.evaluate((el) => 
        window.getComputedStyle(el).gridTemplateColumns.split(' ').length
      )

      if (device.width < 768) {
        expect(columns).toBe(1)
      } else if (device.width < 1024) {
        expect(columns).toBe(2)
      } else {
        expect(columns).toBe(4)
      }

      // Testar imagens responsivas
      const images = page.locator('img')
      for (const image of await images.all()) {
        const srcset = await image.getAttribute('srcset')
        expect(srcset).toBeTruthy()
        
        const sizes = await image.getAttribute('sizes')
        expect(sizes).toBeTruthy()
      }

      // Testar formulários
      await page.goto('/checkout')
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      const inputs = form.locator('input')
      for (const input of await inputs.all()) {
        await expect(input).toHaveCSS('width', '100%')
      }
    })
  }
}) 