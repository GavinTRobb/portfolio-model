// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GrowthByYearPanel from './GrowthByYearPanel';

describe('GrowthByYearPanel buttons', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('commits edited rows when Apply Growth Adjustments is clicked', () => {
    const onApplyGrowthAdjustments = vi.fn();
    const onApplyGrowthRates = vi.fn();

    render(
      <GrowthByYearPanel
        period={2}
        equityRate={8}
        bondRate={3.5}
        mmfRate={1.5}
        resetTrigger={0}
        onApplyGrowthRates={onApplyGrowthRates}
        onApplyGrowthAdjustments={onApplyGrowthAdjustments}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '9' } });
    fireEvent.change(inputs[1], { target: { value: '4' } });
    fireEvent.change(inputs[2], { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /apply growth adjustments/i }));

    expect(onApplyGrowthAdjustments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ equity: 9, bonds: 4, mmf: 2 })
      ])
    );
  });
});
