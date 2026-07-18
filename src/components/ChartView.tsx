import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useSimStore } from "../state/store";

export default function ChartView() {
  const data = useSimStore((s) => s.result);
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const w = 500;
    const h = 250;

    svg.attr("width", w).attr("height", h);

    const x = d3.scaleLinear().domain([0, data.length]).range([0, w]);
    const y = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.value), d3.max(data, (d) => d.value)])
      .range([h, 0]);

    const line = d3
      .line()
      .x((d) => x(d.t))
      .y((d) => y(d.value));

    svg
      .append("path")
      .datum(data)
      .attr("d", line)
      .attr("stroke", "blue")
      .attr("fill", "none");
  }, [data]);

  return <svg ref={ref}></svg>;
}
