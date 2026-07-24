/**
 * Chart helper utilities for SVG path generation.
 * Provides functions for smooth curves, area fills, sparklines, donuts, etc.
 */

/**
 * Generate smooth Catmull-Rom to cubic bezier path.
 */
export function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

/**
 * Generate area fill path from a line path and baseline.
 */
export function areaPath(linePath, lastX, lastY, firstX, baselineY) {
  if (!linePath) return ''
  return `${linePath} L ${lastX.toFixed(2)} ${baselineY} L ${firstX.toFixed(2)} ${baselineY} Z`
}

/**
 * Map an array of data values to SVG points within a given viewport.
 */
export function dataToPoints(data, left, top, width, height, minVal, maxVal) {
  const min = minVal ?? Math.min(...data)
  const max = maxVal ?? Math.max(...data)
  const range = max - min || 1
  const step = data.length > 1 ? width / (data.length - 1) : 0
  return data.map((val, i) => ({
    x: left + i * step,
    y: top + (1 - (val - min) / range) * height,
  }))
}

/**
 * Generate a small sparkline path (compact).
 */
export function sparklinePath(data, width, height) {
  if (!data || data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const points = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * height,
  }))
  return smoothPath(points)
}

/**
 * Compute donut chart stroke-dasharray values.
 */
export function donutSegments(values, total, circumference) {
  let offset = 0
  return values.map((val) => {
    const length = (val / total) * circumference
    const seg = {
      dashArray: `${Math.max(length, 0)} ${Math.max(circumference - length, 0)}`,
      dashOffset: -offset,
    }
    offset += length
    return seg
  })
}

/**
 * Format a number for display.
 */
export function formatNumber(val) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (val >= 1_000) return (val / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return val.toLocaleString()
}

/**
 * Generate grid lines for charts.
 */
export function gridLines(count, left, right, top, height) {
  const lines = []
  for (let i = 0; i <= count; i++) {
    const y = top + (i * height) / count
    lines.push({ x1: left, y1: y, x2: right, y2: y })
  }
  return lines
}
