import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../App';

describe('Device Inspector Tab Switching', () => {
  it('preserves the selected device (js2) when switching away to Keybinding Matrix and back again', () => {
    render(<App />);

    // 1. Initial view: Keybinding Matrix tab is active
    const matrixTabButton = screen.getByRole('button', { name: /Keybinding Matrix/i });
    expect(matrixTabButton).toBeDefined();

    // 2. Navigate to Device Inspector tab
    const inspectorTabButton = screen.getByRole('button', { name: /Device Inspector/i });
    fireEvent.click(inspectorTabButton);

    // Verify Inspector is mounted and initially displays js1 (default)
    expect(screen.getByText(/DirectInput ID: js1/i)).toBeDefined();

    // 3. Switch device from js1 to js2 in the inspector dropdown
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    // Verify inspector now displays js2
    expect(screen.getByText(/DirectInput ID: js2/i)).toBeDefined();

    // 4. Switch to Keybinding Matrix tab
    fireEvent.click(matrixTabButton);

    // Verify inspector is unmounted
    expect(screen.queryByText(/DirectInput ID: js2/i)).toBeNull();

    // 5. Switch back to Device Inspector tab
    fireEvent.click(inspectorTabButton);

    // 6. Verify that the device selected is kept on js2 and has NOT reset to js1!
    expect(screen.getByText(/DirectInput ID: js2/i)).toBeDefined();
    expect(screen.queryByText(/DirectInput ID: js1/i)).toBeNull();

    // Verify the dropdown also still has value "1" (js2)
    const selectAfter = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectAfter.value).toBe('1');
  });
});
