// Lembar inspeksi alpha: potongan di atas latar gelap, terang, dan magenta, plus zoom tepi.
// Pemakaian (dari root repo): node <alat>/periksa-alpha.mjs <foto> <masker.png|potongan.png> <keluaran.jpg> [zoomX,zoomY,zoomW,zoomH]
import sharp from "sharp";

const [foto, masker, keluaran, zoomArg] = process.argv.slice(2);
const meta = await sharp(foto).metadata();
const { width: W, height: H } = meta;

async function potongan() {
  const m = await sharp(masker).metadata();
  if (m.channels === 4) return sharp(masker).resize(W, H).png().toBuffer();
  const alpha = await sharp(masker).resize(W, H).toColourspace("b-w").raw().toBuffer();
  return sharp(foto).joinChannel(alpha, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
}

const isi = await potongan();
const latar = [
  { r: 20, g: 16, b: 14 },
  { r: 236, g: 232, b: 224 },
  { r: 255, g: 0, b: 255 },
];
const lebarPanel = 520;
const tinggiPanel = Math.round((H / W) * lebarPanel);
// sharp menjalankan resize/extract sebelum composite, jadi composite dibuat di pipeline sendiri dulu.
const diAtas = (warna) =>
  sharp({ create: { width: W, height: H, channels: 3, background: warna } }).composite([{ input: isi }]).png().toBuffer();
const komposit = await Promise.all(latar.map(diAtas));
const panel = await Promise.all(komposit.map((buf) => sharp(buf).resize(lebarPanel, tinggiPanel).png().toBuffer()));

const daftar = panel.map((input, i) => ({ input, left: i * (lebarPanel + 8), top: 0 }));
let tinggi = tinggiPanel;
if (zoomArg) {
  const [x, y, w, h] = zoomArg.split(",").map(Number);
  const zoom = await Promise.all(
    komposit.slice(0, 2).map(async (buf) =>
      sharp(buf)
        .extract({ left: x, top: y, width: w, height: h })
        .resize({ width: Math.round((lebarPanel * 3) / 2) - 8 })
        .png()
        .toBuffer({ resolveWithObject: true }),
    ),
  );
  zoom.forEach((z, i) => daftar.push({ input: z.data, left: i * (z.info.width + 8), top: tinggiPanel + 8 }));
  tinggi += 8 + zoom[0].info.height;
}

await sharp({ create: { width: lebarPanel * 3 + 16, height: tinggi, channels: 3, background: "#333" } })
  .composite(daftar)
  .jpeg({ quality: 85 })
  .toFile(keluaran);
console.log("ditulis", keluaran);
