// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NavPerYearPanel from './NavPerYearPanel';

describe('NavPerYearPanel drawdown editing', () => {
  it('applies edited drawdown values after clicking the apply button', () => {
    const onApplyDrawdownChanges = vi.fn();

    render(
      <NavPerYearPanel
        navRows={[{ year: 2026, endValue: 1000000 }]}
        growthTable={[
          {
            year: 2026,
            equityRate: 8,
            bondRate: 3.5,
            mmfRate: 1.5,
            equityAlloc: 20,
            bondAlloc: 40,
            mmfAlloc: 20
          }
        ]}
        initialPortfolioValue={1000000}
        drawdownStartYear={2026}
        drawdownYear={2026}
        drawdownAmount={100000}
        onApplyDrawdownChanges={onApplyDrawdownChanges}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '-250000' } });

    const applyButton = screen.getByRole('button', { name: /apply drawdown changes/i });
    fireEvent.click(applyButton);

    expect(onApplyDrawdownChanges).toHaveBeenCalledWith([-250000]);
  });
});
