// npm run comprimi-pdf -- <entrata.pdf> <uscita.pdf> [lato lungo in px, 1600] [qualità jpeg 0–1, 0.7]
// alleggerisce un pdf troppo pesante per il sito: ogni pagina diventa un’immagine jpeg
// e si ricompone un pdf con le stesse misure di pagina. usa solo pdfkit di macos, niente da installare.
// il testo diventa immagine: per la massima nitidezza meglio riesportare da indesign (immagini 150 ppi).
import AppKit
import PDFKit

let argomenti = CommandLine.arguments
guard argomenti.count >= 3, let documento = PDFDocument(url: URL(fileURLWithPath: argomenti[1])) else {
  print("uso: npm run comprimi-pdf -- <entrata.pdf> <uscita.pdf> [lato lungo px] [qualità 0–1]")
  exit(1)
}
let lato = argomenti.count > 3 ? Double(argomenti[3]) ?? 1600 : 1600
let qualita = argomenti.count > 4 ? Double(argomenti[4]) ?? 0.7 : 0.7
let uscita = URL(fileURLWithPath: argomenti[2])

var primaPagina = CGRect(x: 0, y: 0, width: 842, height: 595)
guard let contesto = CGContext(uscita as CFURL, mediaBox: &primaPagina, nil) else {
  print("impossibile scrivere \(uscita.path)")
  exit(1)
}
for i in 0..<documento.pageCount {
  guard let pagina = documento.page(at: i) else { continue }
  var riquadro = pagina.bounds(for: .cropBox)
  let scala = lato / max(riquadro.width, riquadro.height)
  let w = Int((riquadro.width * scala).rounded()), h = Int((riquadro.height * scala).rounded())
  guard let bitmap = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                               space: CGColorSpace(name: CGColorSpace.sRGB)!,
                               bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { continue }
  bitmap.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
  bitmap.fill(CGRect(x: 0, y: 0, width: w, height: h))
  bitmap.interpolationQuality = .high
  bitmap.scaleBy(x: scala, y: scala)
  pagina.draw(with: .cropBox, to: bitmap)
  guard let immagine = bitmap.makeImage() else { continue }
  let rappresentazione = NSBitmapImageRep(cgImage: immagine)
  guard let jpeg = rappresentazione.representation(using: .jpeg, properties: [.compressionFactor: qualita]),
        let sorgente = CGDataProvider(data: jpeg as CFData),
        let compressa = CGImage(jpegDataProviderSource: sorgente, decode: nil, shouldInterpolate: true, intent: .defaultIntent)
  else { continue }
  riquadro.origin = .zero
  contesto.beginPage(mediaBox: &riquadro)
  contesto.draw(compressa, in: riquadro)
  contesto.endPage()
  print("  pagina \(i + 1)/\(documento.pageCount)")
}
contesto.closePDF()
let peso = (try? FileManager.default.attributesOfItem(atPath: uscita.path)[.size] as? Int) ?? 0
print("\(uscita.lastPathComponent): \(String(format: "%.1f", Double(peso) / 1_048_576)) mb")
