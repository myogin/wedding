// Lembar kontak berlabel di atas latar papan catur (agar alpha terlihat).
// Pemakaian: node lembar.mjs <keluaran.jpg> <tinggiPanel> <gambar...>
import path from "node:path";
import sharp from "sharp";
const [keluaran, tinggiArg, ...berkas] = process.argv.slice(2);
const T = Number(tinggiArg), jeda = 10, label = 26;
const panel = await Promise.all(berkas.map(async (f) => {
  const { data, info } = await sharp(f).resize({ height: T }).png().toBuffer({ resolveWithObject: true });
  const kotak = 16;
  let svg = `<svg width="${info.width}" height="${T}" xmlns="http://www.w3.org/2000/svg">`;
  for (let y = 0; y < T; y += kotak) for (let x = 0; x < info.width; x += kotak)
    svg += `<rect x="${x}" y="${y}" width="${kotak}" height="${kotak}" fill="${(x / kotak + y / kotak) % 2 ? "#5a5a5a" : "#3a3a3a"}"/>`;
  svg += "</svg>";
  const catur = await sharp(Buffer.from(svg)).png().toBuffer();
  const isi = await sharp(catur).composite([{ input: data }]).png().toBuffer();
  const teks = Buffer.from(`<svg width="${info.width}" height="${label}"><rect width="100%" height="100%" fill="#000"/><text x="6" y="18" font-size="15" fill="#fff" font-family="Arial">${path.basename(f)}</text></svg>`);
  return { isi, teks, w: info.width };
}));
const lebar = panel.reduce((s, p) => s + p.w + jeda, jeda);
let x = jeda;
const daftar = [];
for (const p of panel) {
  daftar.push({ input: p.teks, left: x, top: jeda }, { input: p.isi, left: x, top: jeda + label });
  x += p.w + jeda;
}
await sharp({ create: { width: lebar, height: T + label + 2 * jeda, channels: 3, background: "#111" } })
  .composite(daftar).jpeg({ quality: 82 }).toFile(keluaran);
