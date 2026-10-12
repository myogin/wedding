// Masker subjek lokal dengan Apple Vision (macOS 14+). Tidak ada foto yang diunggah ke mana pun.
// Pemakaian: swift masker-vision.swift <foto> <folder-keluaran>
// Menulis: instance-N.png (per objek latar depan), latar-depan-semua.png, orang.png (segmentasi orang).
import AppKit
import CoreImage
import Foundation
import Vision

let argumen = CommandLine.arguments
guard argumen.count == 3 else { print("pakai: swift masker-vision.swift <foto> <folder>"); exit(2) }
let urlFoto = URL(fileURLWithPath: argumen[1])
let folder = URL(fileURLWithPath: argumen[2])
let handler = VNImageRequestHandler(url: urlFoto)
let konteks = CIContext()
let abu = CGColorSpaceCreateDeviceGray()

func simpan(_ gambar: CIImage, _ nama: String) throws {
  try konteks.writePNGRepresentation(of: gambar, to: folder.appendingPathComponent(nama), format: .L8, colorSpace: abu)
}

let latarDepan = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([latarDepan])
if let hasil = latarDepan.results?.first {
  print("instance:", Array(hasil.allInstances))
  for i in hasil.allInstances {
    let pb = try hasil.generateScaledMaskForImage(forInstances: IndexSet(integer: i), from: handler)
    try simpan(CIImage(cvPixelBuffer: pb), "instance-\(i).png")
  }
  let semua = try hasil.generateScaledMaskForImage(forInstances: hasil.allInstances, from: handler)
  try simpan(CIImage(cvPixelBuffer: semua), "latar-depan-semua.png")
}

let orang = VNGeneratePersonSegmentationRequest()
orang.qualityLevel = .accurate
orang.outputPixelFormat = kCVPixelFormatType_OneComponent8
try handler.perform([orang])
if let pb = orang.results?.first?.pixelBuffer, let foto = NSImage(contentsOf: urlFoto),
   let cg = foto.cgImage(forProposedRect: nil, context: nil, hints: nil) {
  let masker = CIImage(cvPixelBuffer: pb)
  let skala = CGAffineTransform(scaleX: CGFloat(cg.width) / masker.extent.width, y: CGFloat(cg.height) / masker.extent.height)
  try simpan(masker.transformed(by: skala), "orang.png")
}
print("selesai")
