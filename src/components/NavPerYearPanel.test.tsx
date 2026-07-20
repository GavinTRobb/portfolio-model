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
        drawdownInflationRate={0}
        onApplyDrawdownChanges={onApplyDrawdownChanges}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '-250000' } });

    const applyButton = screen.getByRole('button', { name: /apply drawdown changes/i });
    fireEvent.click(applyButton);

    expect(onApplyDrawdownChanges).toHaveBeenCalledWith([-250000]);
  });

  it('computes asset end values from allocation-based growth and drawdown', () => {
    const { container } = render(
      <NavPerYearPanel
        navRows={[{ year: 2026, endValue: 1000000 }]}
        growthTable={[
          {
            year: 2026,
            equityRate: 10,
            bondRate: 5,
            mmfRate: 2,
            equityAlloc: 50,
            bondAlloc: 30,
            mmfAlloc: 20
          }
        ]}
        initialPortfolioValue={1000000}
        drawdownStartYear={2026}
        drawdownYear={2026}
        drawdownAmount={100000}
        drawdownInflationRate={0}
      />
    );

    const rowCells = container.querySelector('tbody tr')?.querySelectorAll('td');
    expect(rowCells?.[8]?.textContent).toBe('500,000');
    expect(rowCells?.[9]?.textContent).toBe('285,000');
    expect(rowCells?.[10]?.textContent).toBe('184,000');
  });

  it('treats positive manual drawdown values as inflows that increase asset and end values', () => {
    const { container } = render(
      <NavPerYearPanel
        navRows={[{ year: 2026, endValue: 1000000 }]}
        growthTable={[
          {
            year: 2026,
            equityRate: 10,
            bondRate: 5,
            mmfRate: 2,
            equityAlloc: 50,
            bondAlloc: 30,
            mmfAlloc: 20
          }
        ]}
        initialPortfolioValue={1000000}
        drawdownStartYear={2026}
        drawdownYear={2026}
        drawdownAmount={100000}
        drawdownInflationRate={0}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '100000' } });

    const rowCells = container.querySelector('tbody tr')?.querySelectorAll('td');
    expect(rowCells?.[8]?.textContent).toBe('650,000');
    expect(rowCells?.[9]?.textContent).toBe('345,000');
    expect(rowCells?.[10]?.textContent).toBe('224,000');
    expect(rowCells?.[11]?.textContent).toBe('1,219,000');
  });
});
