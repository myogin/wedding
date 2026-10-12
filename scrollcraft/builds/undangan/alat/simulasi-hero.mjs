// Simulasi koreografi Hero (RENCANA.md, "Kontrak lapisan Hero") dengan sharp, tanpa browser.
// Menyusun lapisan pada beberapa titik progres untuk ponsel dan desktop, lalu menulis satu lembar kontak.
// Pemakaian (dari root repo): node scrollcraft/builds/undangan/alat/simulasi-hero.mjs
import fs from "node:fs";
import sharp from "sharp";

const H_DIR = "public/placeholder/hero";
const KELUAR = "scrollcraft/builds/undangan/lab/simulasi-hero.jpg";
const hero = JSON.parse(fs.readFileSync(`${H_DIR}/hero.json`, "utf8"));
const KANVAS = { r: 14, g: 11, b: 9 };
const B = hero.bingkai;

/** Angka koreografi, sama dengan yang dicatat di RENCANA.md. */
export const KOREOGRAFI = {
  ponsel: { skalaLatar: [1, 1.1], skalaSubjek: [1.03, 1.16], lebarDepan: 0.78, turunDepan: 0.5 },
  desktop: { tinggiJendela: 1.12, pusatX: 0.62, skalaLatar: [1, 1.25], skalaSubjek: [1.03, 1.33], lebarDepan: 0.4, turunDepan: 0.55 },
};

const lerp = ([a, b], p) => a + (b - a) * p;

/** Mengubah ukuran lapisan lalu memotongnya ke bagian yang terlihat di kanvas. */
async function lapisan(berkas, x, y, w, h, W, H, olah) {
  const kiri = Math.max(0, Math.round(x));
  const atas = Math.max(0, Math.round(y));
  const kanan = Math.min(W, Math.round(x + w));
  const bawah = Math.min(H, Math.round(y + h));
  if (kanan <= kiri || bawah <= atas) return null;
  let gambar = sharp(berkas).resize(Math.round(w), Math.round(h)).ensureAlpha();
  if (olah) gambar = sharp(await olah(await gambar.png().toBuffer(), Math.round(w), Math.round(h)));
  const potong = await sharp(await gambar.png().toBuffer())
    .extract({ left: kiri - Math.round(x), top: atas - Math.round(y), width: kanan - kiri, height: bawah - atas })
    .png()
    .toBuffer();
  return { input: potong, left: kiri, top: atas };
}

/** Tepi jendela desktop memudar ke kanvas, bukan terpotong lurus. */
async function pudarkanTepi(buf, w, h) {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset=".2" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <mask id="m"><rect width="100%" height="100%" fill="url(#x)"/></mask></defs>
    <rect width="100%" height="100%" fill="url(#y)" mask="url(#m)"/></svg>`;
  // Pudar horizontal tersimpan di alpha SVG; ratakan ke hitam dulu supaya keduanya masuk ke satu kanal.
  const masker = await sharp(Buffer.from(svg)).flatten({ background: "#000" }).extractChannel(0).raw().toBuffer();
  // removeAlpha dijalankan sharp setelah joinChannel, jadi RGB dipisah dulu di pipeline sendiri.
  const rgb = await sharp(buf).removeAlpha().png().toBuffer();
  return sharp(rgb).joinChannel(masker, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
}

async function bingkai(varian, W, H, p, terang) {
  const k = KOREOGRAFI[varian];
  let s0, kiri, atas;
  if (varian === "ponsel") {
    s0 = Math.max(W / B.lebar, H / B.tinggi);
    kiri = Math.min(0, Math.max(W - B.lebar * s0, W / 2 - hero.fokus.x * B.lebar * s0));
    atas = (H - B.tinggi * s0) / 2;
  } else {
    s0 = (k.tinggiJendela * H) / B.tinggi;
    kiri = k.pusatX * W - (B.lebar * s0) / 2;
    atas = (H - B.tinggi * s0) / 2;
  }
  // Semua lapisan diskalakan dari titik kontak kaki, supaya Mempelai tetap berpijak di lantai yang sama.
  const K = { x: kiri + hero.subjek.kontak.x * s0, y: atas + hero.subjek.kontak.y * s0 };
  const sl = lerp(k.skalaLatar, p);
  const ss = lerp(k.skalaSubjek, p);
  const daftar = [];

  const latar = terang ? `${H_DIR}/latar.webp` : `${H_DIR}/latar-gelap.webp`;
  daftar.push(
    await lapisan(latar, K.x + (kiri - K.x) * sl, K.y + (atas - K.y) * sl, B.lebar * s0 * sl, B.tinggi * s0 * sl, W, H,
      varian === "desktop" ? pudarkanTepi : undefined),
  );

  if (terang) {
    const pendar = hero.lentera
      .map((l) => {
        const cx = K.x + (kiri + l.x * B.lebar * s0 - K.x) * sl;
        const cy = K.y + (atas + l.y * B.tinggi * s0 - K.y) * sl;
        const r = l.r * B.lebar * s0 * sl;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g)"/>`;
      })
      .join("");
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g">
      <stop offset="0" stop-color="#FFC27A" stop-opacity=".55"/><stop offset=".45" stop-color="#E3A857" stop-opacity=".18"/>
      <stop offset="1" stop-color="#E3A857" stop-opacity="0"/></radialGradient></defs>${pendar}</svg>`;
    daftar.push({ input: Buffer.from(svg), left: 0, top: 0, blend: "screen" });
  }

  const sub = hero.subjek;
  const subjek = terang ? `${H_DIR}/subjek.webp` : `${H_DIR}/subjek-gelap.webp`;
  daftar.push(
    await lapisan(subjek, K.x + (kiri + sub.x * s0 - K.x) * ss, K.y + (atas + sub.y * s0 - K.y) * ss, sub.lebar * s0 * ss, sub.tinggi * s0 * ss, W, H),
  );

  const lebarDepan = k.lebarDepan * W * (1 + 0.25 * p);
  const tinggiDepan = (lebarDepan * hero.depan.tinggi) / hero.depan.lebar;
  daftar.push(
    await lapisan(
      terang ? `${H_DIR}/depan-sedap-malam.webp` : `${H_DIR}/depan-sedap-malam-gelap.webp`,
      W - lebarDepan * 0.82, H - tinggiDepan * 0.34 + p * k.turunDepan * H, lebarDepan, tinggiDepan, W, H,
    ),
  );

  return sharp({ create: { width: W, height: H, channels: 3, background: KANVAS } })
    .composite(daftar.filter(Boolean))
    .jpeg({ quality: 84 })
    .toBuffer();
}

const keadaan = [
  ["gelap (Sampul)", 0, false],
  ["p=0 menyala", 0, true],
  ["p=0.5", 0.5, true],
  ["p=1", 1, true],
];
const baris = [];
for (const [varian, W, H, tinggiPanel] of [["ponsel", 780, 1688, 620], ["desktop", 1440, 900, 360]]) {
  const panel = [];
  for (const [nama, p, terang] of keadaan) {
    const buf = await sharp(await bingkai(varian, W, H, p, terang)).resize({ height: tinggiPanel }).toBuffer({ resolveWithObject: true });
    const label = Buffer.from(`<svg width="${buf.info.width}" height="24"><rect width="100%" height="100%" fill="#000"/><text x="6" y="17" font-size="15" fill="#fff" font-family="Arial">${varian} ${nama}</text></svg>`);
    panel.push({ ...buf, label });
  }
  baris.push(panel);
}
const jeda = 10;
const lebar = Math.max(...baris.map((b) => b.reduce((s, p) => s + p.info.width + jeda, jeda)));
const tinggi = baris.reduce((s, b) => s + b[0].info.height + 24 + jeda, jeda);
const daftar = [];
let y = jeda;
for (const b of baris) {
  let x = jeda;
  for (const p of b) {
    daftar.push({ input: p.label, left: x, top: y }, { input: p.data, left: x, top: y + 24 });
    x += p.info.width + jeda;
  }
  y += b[0].info.height + 24 + jeda;
}
await sharp({ create: { width: lebar, height: tinggi, channels: 3, background: "#222" } }).composite(daftar).jpeg({ quality: 84 }).toFile(KELUAR);
console.log("ditulis", KELUAR);
