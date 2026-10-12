import { test, expect } from '@playwright/test';

test.describe('Star Citizen Keybinding Architect E2E UX Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure Cockpit HUD header is loaded
    await expect(page.getByRole('heading', { name: /STAR CITIZEN KEYBINDING ARCHITECT/i })).toBeVisible();
  });

  test('loads Cockpit HUD header and default telemetry correctly', async ({ page }) => {
    // Check Suite version badge in header banner
    await expect(page.getByRole('banner').getByText(/Suite v1\.0\.0/i)).toBeVisible();

    // Check default active profile badge
    await expect(page.getByText('Dual VKB EVO Sample')).toBeVisible();

    // Check action maps count telemetry
    await expect(page.getByText(/Action Maps:/i)).toBeVisible();

    // Check Device Rack renders default VKB joysticks
    await expect(page.getByText(/VKBsim Gladiator EVO R/i)).toBeVisible();
    await expect(page.getByText(/VKBsim Gladiator EVO L/i)).toBeVisible();
  });

  test('switches starter templates / presets seamlessly', async ({ page }) => {
    // Click Thrustmaster T.16000M HOTAS preset
    const hotasButton = page.getByRole('button', { name: /Thrustmaster T\.16000M \(HOTAS\)/i });
    await expect(hotasButton).toBeVisible();
    await hotasButton.click();

    // Verify active profile badge updates
    await expect(page.getByText('T.16000M HOTAS')).toBeVisible();

    // Click Dual VKB (Right + Omni Left OTA) preset
    const omniButton = page.getByRole('button', { name: /Dual VKB \(Right \+ Omni Left OTA\)/i });
    await omniButton.click();
    await expect(page.getByText('Dual VKB (Right + Omni Left)')).toBeVisible();
  });

  test('navigates between Keybinding Matrix, Device Inspector, and Conflict Diagnostics tabs', async ({ page }) => {
    // 1. Initially on Keybinding Matrix tab with search input visible
    await expect(page.getByPlaceholder(/Search actions, labels, or inputs/i)).toBeVisible();

    // 2. Switch to Device Inspector & Live HUD tab
    const inspectorTab = page.getByRole('button', { name: /Device Inspector & Live HUD/i });
    await inspectorTab.click();
    await expect(page.getByRole('heading', { name: /Hardware Device Inspector & Live Controller HUD/i })).toBeVisible();

    // 3. Switch to Conflict Diagnostics tab
    const conflictTab = page.getByRole('button', { name: /Conflict Diagnostics/i });
    await conflictTab.click();
    await expect(page.getByRole('heading', { name: /Conflict Diagnostics Engine/i })).toBeVisible();

    // 4. Return to Keybinding Matrix tab
    const matrixTab = page.getByRole('button', { name: /Keybinding Matrix/i });
    await matrixTab.click();
    await expect(page.getByPlaceholder(/Search actions, labels, or inputs/i)).toBeVisible();
  });

  test('filters bindings via search input in Keybinding Matrix', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search actions, labels, or inputs/i);
    await searchInput.fill('eject');

    // Only matching actions should be visible in the table
    await expect(page.getByText('Emergency Ejection', { exact: true })).toBeVisible();
  });

  test('opens Binding Editor modal and can close it', async ({ page }) => {
    // Click the Edit button on the first bound action
    const editButton = page.getByRole('button', { name: 'Edit', exact: true }).first();
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Verify modal elements are visible
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Input Binding/i })).toBeVisible();

    // Close modal via Cancel button
    const cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    await cancelButton.click();
    await expect(page.getByRole('button', { name: /Save Changes/i })).not.toBeVisible();
  });

  test('opens and dismisses Hardware Studio modal', async ({ page }) => {
    const studioButton = page.getByRole('button', { name: 'Hardware Studio', exact: true });
    await studioButton.click();

    // Check that Hardware Definition Studio modal is visible
    await expect(page.getByText(/HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR/i)).toBeVisible();

    // Dismiss using Close button in the modal footer
    const closeButton = page.getByRole('button', { name: 'Close', exact: true });
    await closeButton.click();
    await expect(page.getByText(/HARDWARE STUDIO • DEVICE CONFIGURATION GENERATOR/i)).not.toBeVisible();
  });

  test('triggers lossless XML export download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    const exportButton = page.getByRole('button', { name: /Export XML/i });
    await exportButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/layout_.*exported\.xml/);
  });
});
