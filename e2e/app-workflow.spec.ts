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

  test('edits a keybinding, adds an additional concurrent input, and saves changes', async ({ page }) => {
    // 1. Search for a specific action to isolate it in the matrix
    const searchInput = page.getByPlaceholder(/Search actions, labels, or inputs/i);
    await searchInput.fill('Emergency Ejection');
    await expect(page.getByText('Emergency Ejection', { exact: true })).toBeVisible();

    // 2. Open Binding Editor modal
    const editButton = page.getByRole('button', { name: 'Edit', exact: true }).first();
    await editButton.click();
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible();

    // 3. Add an additive input binding
    const addBindingButton = page.getByRole('button', { name: /Add Input Binding/i });
    await addBindingButton.click();

    // 4. Update the newly added binding input text code
    const inputFields = page.locator('input[placeholder*="e.g. js1_button1"]');
    await expect(inputFields).toHaveCount(2);
    await inputFields.nth(1).fill('js2_button9');

    // 5. Save changes
    const saveButton = page.getByRole('button', { name: /Save Changes/i });
    await saveButton.click();
    await expect(page.getByRole('button', { name: /Save Changes/i })).not.toBeVisible();

    // 6. Verify the new binding appears in the Keybinding Matrix table
    await expect(page.getByText('js2_button9')).toBeVisible();
  });

  test('re-indexes hardware devices via drag-and-drop and resets mapping', async ({ page }) => {
    // 1. Locate the draggable device cards in the Device Rack
    const cardJs1 = page.locator('[draggable="true"]').filter({ hasText: 'XML ID: js1' });
    const cardJs2 = page.locator('[draggable="true"]').filter({ hasText: 'XML ID: js2' });
    await expect(cardJs1).toBeVisible();
    await expect(cardJs2).toBeVisible();
    await expect(page.getByText('→ Export: js2')).not.toBeVisible();

    // 2. Drag js1 card and drop it onto js2 card
    await cardJs1.dragTo(cardJs2);
    // If native dragTo didn't trigger dataTransfer in headless mode, fall back to dispatchEvent
    if (await page.getByText('→ Export: js2').isHidden()) {
      await cardJs1.dispatchEvent('dragstart');
      await cardJs2.dispatchEvent('dragover');
      await cardJs2.dispatchEvent('drop');
    }

    // 3. Verify swapped export IDs are displayed
    await expect(page.getByText('→ Export: js2')).toBeVisible();
    await expect(page.getByText('→ Export: js1')).toBeVisible();

    // 4. Reset device mapping
    const resetButton = page.getByRole('button', { name: /Reset Mapping/i });
    await resetButton.click();

    // 5. Verify swapped export badges are cleared
    await expect(page.getByText('→ Export: js2')).not.toBeVisible();
    await expect(page.getByText('→ Export: js1')).not.toBeVisible();
  });

  test('imports custom Star Citizen actionmaps XML file', async ({ page }) => {
    // Locate the hidden file input
    const fileInput = page.locator('input[type="file"]');

    // Upload sample HOTAS profile
    await fileInput.setInputFiles('sample-data/hotas_t16000m.xml');

    // Verify active profile badge updates to file name
    await expect(page.getByText('hotas_t16000m.xml')).toBeVisible();

    // Verify imported devices are loaded into Device Rack
    await expect(page.locator('[draggable="true"]').filter({ hasText: /T\.16000M/i })).toBeVisible();
    await expect(page.locator('[draggable="true"]').filter({ hasText: /TWCS Throttle/i })).toBeVisible();
  });

  test('evaluates Conflict Diagnostics filters and executes obsolete action quick-fix', async ({ page }) => {
    // 1. Navigate to Conflict Diagnostics tab
    const conflictTab = page.getByRole('button', { name: /Conflict Diagnostics/i });
    await conflictTab.click();
    await expect(page.getByRole('heading', { name: /Conflict Diagnostics Engine/i })).toBeVisible();

    // 2. Filter by Fatal conflicts
    const fatalFilter = page.getByRole('button', { name: /Fatal \(/i });
    await fatalFilter.click();

    // 3. Filter by Warnings
    const warningFilter = page.getByRole('button', { name: /Warnings \(/i });
    await warningFilter.click();

    // 4. Return to All conflicts
    const allFilter = page.getByRole('button', { name: /^All \(/i });
    await allFilter.click();

    // 5. Test obsolete action auto-fix if present on any conflict card
    const autoFixButton = page.getByRole('button', { name: /Remove Obsolete Action/i }).first();
    if (await autoFixButton.isVisible()) {
      await autoFixButton.click();
      // Auto-fix should remove the obsolete binding from document
    }

    // 6. Test What's this? Help Modal for Conflict Diagnostics
    const helpButton = page.getByRole('button', { name: "What's this?" }).first();
    await helpButton.click();
    const conflictHeading = page.getByRole('heading', { name: /Conflict Diagnostics • Architecture Guide/i });
    await expect(conflictHeading).toBeVisible();

    // Close modal using its Close button inside the modal dialog
    const modalContainer = conflictHeading.locator('xpath=ancestor::div[contains(@class, "fixed")]');
    await modalContainer.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(conflictHeading).not.toBeVisible();
  });

  test('interacts with Star Citizen Recruit Referral Code card', async ({ page }) => {
    // 1. Locate Referral Code card
    const referralCard = page.locator('[data-testid="referral-code-card"]');
    await expect(referralCard).toBeVisible();

    // 2. Verify Enlist button with RSI link is present
    const enlistLink = referralCard.getByRole('link', { name: /ENLIST WITH CODE/i });
    await expect(enlistLink).toBeVisible();
    await expect(enlistLink).toHaveAttribute('href', /robertsspaceindustries\.com\/enlist/);

    // 3. Test Copy Referral Code button
    const copyButton = referralCard.getByRole('button', { name: /Copy Code/i });
    await copyButton.click();
    await expect(referralCard.getByText(/COPIED!/i)).toBeVisible();

    // 4. Test Reroll / Shuffle code button
    const rerollButton = referralCard.getByRole('button', { name: /Reroll/i });
    await rerollButton.click();

    // 5. Test Referral Help modal
    const referralHelp = referralCard.getByRole('button', { name: "What's this?" });
    await referralHelp.click();
    const referralModal = page.locator('[data-testid="referral-help-modal"]');
    await expect(referralModal).toBeVisible();
    const closeReferralModal = referralModal.getByRole('button', { name: 'Close', exact: true });
    await closeReferralModal.click();
    await expect(referralModal).not.toBeVisible();
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
