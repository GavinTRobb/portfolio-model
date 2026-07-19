// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NavChartPanel from './NavChartPanel';

vi.mock('recharts', async () => {
  const React = await import('react');
  return {
    BarChart: ({ data }: { data: Array<Record<string, unknown>> }) => <div data-testid="chart">{JSON.stringify(data)}</div>,
    Bar: () => null,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    Legend: () => null
  };
});

describe('NavChartPanel', () => {
  it('uses EQ, BD and MMF end values for chart points', () => {
    const { getByTestId } = render(
      <NavChartPanel
        navRows={[
          {
            year: 2026,
            endValue: 1000000,
            eqEndValue: 500000,
            bdEndValue: 300000,
            mmfEndValue: 200000
          }
        ]}
        age={55}
      />
    );

    const chart = getByTestId('chart');
    expect(chart.textContent).toContain('"eq":0.5');
    expect(chart.textContent).toContain('"bd":0.3');
    expect(chart.textContent).toContain('"mmf":0.2');
  });
});
