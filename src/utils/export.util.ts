import type { TMonthlyTemperature } from "@/types";
import html2canvas from "html2canvas";
import type { RefObject } from "react";

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: TMonthlyTemperature[], cityName: string): void {
  const date = new Date().toISOString().slice(0, 10);
  const rows = [
    ["Month", "Tmax (°C)", "Tmin (°C)", "Prec (mm)"],
    ...data.map((d) => [d.monthName, String(d.tmax), String(d.tmin), String(d.prec)]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `climatica-${cityName}-${date}.csv`);
}

export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.png`);
  });
}

export function exportToSVG(chartRef: RefObject<HTMLElement | null>, filename: string): void {
  const svg = chartRef.current?.querySelector("svg");
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${filename}.svg`);
}
