function toCSV(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (val) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ]
  return lines.join('\n')
}

module.exports = { toCSV }
