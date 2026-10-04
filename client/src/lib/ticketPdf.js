// Render the existing print layout so the downloaded PDF keeps the ticket design.
export async function downloadTicketPdf(element, pnr) {
  if (!element) throw new Error('The ticket is not ready to download.')

  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ])
  const frame = document.createElement('iframe')
  frame.title = 'Ticket PDF export'
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  // A fixed A4 viewport gives mobile and desktop downloads the same print layout.
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;pointer-events:none;'
  document.body.appendChild(frame)

  try {
    const exportDocument = frame.contentDocument
    const base = exportDocument.createElement('base')
    base.href = document.baseURI
    exportDocument.head.appendChild(base)
    exportDocument.documentElement.lang = document.documentElement.lang
    exportDocument.documentElement.dataset.theme = 'light'

    const styles = exportDocument.createElement('style')
    // Activate the app's print rules in the isolated export, retaining screen styles
    // and responsive rules that also apply when the browser prints an A4 page.
    styles.textContent = Array.from(document.styleSheets, (sheet) => {
      return Array.from(sheet.cssRules, (rule) => rule.media?.mediaText === 'print'
        ? Array.from(rule.cssRules, (printRule) => printRule.cssText).join('\n')
        : rule.cssText).join('\n')
    }).join('\n') + `
      body { min-height: 0; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .confirm-check circle, .confirm-check path { stroke-dashoffset: 0; }
    `
    exportDocument.head.appendChild(styles)

    const content = element.cloneNode(true)
    content.querySelectorAll('.no-print').forEach((node) => node.remove())
    exportDocument.body.appendChild(content)
    // Resolve layout first so fonts used by the cloned ticket are requested.
    content.getBoundingClientRect()
    await exportDocument.fonts.ready

    // Preserve CSS-painted SVG shapes when they are serialized into the image.
    content.querySelectorAll('svg *').forEach((node) => {
      const computed = frame.contentWindow.getComputedStyle(node)
      for (const property of ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset']) {
        node.setAttribute(property, computed.getPropertyValue(property))
      }
    })

    const canvas = await toCanvas(content, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    const margin = 10
    const availableWidth = pdf.internal.pageSize.getWidth() - margin * 2
    const availableHeight = pdf.internal.pageSize.getHeight() - margin * 2
    const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height)
    const width = canvas.width * scale
    const height = canvas.height * scale
    pdf.addImage(canvas, 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, margin, width, height)
    pdf.setProperties({ title: `FERROVIA E-ticket ${pnr}`, subject: 'Railway e-ticket', creator: 'FERROVIA' })
    pdf.save(`ticket-${pnr}.pdf`)
  } finally {
    frame.remove()
  }
}
