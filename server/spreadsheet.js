import { readSheet } from 'read-excel-file/node'

function cellText(value) {
  if (value instanceof Date) return value.toISOString().slice(11, 16)
  return String(value ?? '').trim()
}

export async function readSheetRows(filePath, sheetName) {
  const [headersRow, ...dataRows] = await readSheet(filePath, sheetName)
  if (!headersRow) throw new Error(`Worksheet is empty: ${sheetName}`)

  const headers = headersRow.map(cellText)
  return dataRows.flatMap(row => {
    const record = {}
    let hasValue = false

    headers.forEach((header, index) => {
      if (!header) return
      const value = cellText(row[index])
      record[header] = value
      if (value) hasValue = true
    })

    return hasValue ? [record] : []
  })
}
