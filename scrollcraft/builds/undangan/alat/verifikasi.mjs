// Verifikasi Step 5 scroll-craft untuk halaman Undangan.
// shoot.mjs bawaan skill tidak bisa melewati Sampul (scroll terkunci sampai "Buka Undangan" ditekan),
// jadi alat ini menekan tombolnya dulu, lalu memakai cara yang sama:
//   - sampel di dalam tiap act (bukan merata sepanjang dokumen), termasuk geser masuk dan keluar act ber-pin,
//   - DEAD SCROLL: dua sampel berurutan yang piksel layarnya hampir tidak berubah,
//   - KONTRAS: teks disembunyikan (warna transparan, tata letak tetap), frame difoto ulang, lalu tinta teks
//     dibandingkan dengan latar paling terang di bawahnya (persentil 98, supaya butiran film tidak dihitung),
//   - contact sheet untuk dibaca langsung.
//
// Pemakaian (dari root repo, server sudah berjalan):
//   node scrollcraft/builds/undangan/alat/verifikasi.mjs --url http://localhost:3000 --nama desktop
//   node scrollcraft/builds/undangan/alat/verifikasi.mjs --url ... --nama ponsel --width 390 --height 844 --mobile
//   node scrollcraft/builds/undangan/alat/verifikasi.mjs --url ... --nama reduced --reduced-motion
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf(n);
  return i > -1 && argv[i + 1] ? argv[i + 1] : d;
};
const ada = (n) => argv.includes(n);

const URL = arg("--url", "http://localhost:3000");
const NAMA = arg("--nama", "desktop");
const W = parseInt(arg("--width", "1440"), 10);
const H = parseInt(arg("--height", "900"), 10);
const PER_ACT = parseInt(arg("--per-act", "6"), 10);
const REDUCED = ada("--reduced-motion");
const MOBILE = ada("--mobile");
const KELUAR = path.resolve(arg("--out", `scrollcraft/builds/undangan/lab/verifikasi/${NAMA}`));
const SHEET = path.resolve(arg("--sheet", `scrollcraft/builds/undangan/lab/verifikasi-${NAMA}.jpg`));

/** Rata-rata selisih piksel (0..255) di bawah ini dianggap layar tidak berubah. */
const AMBANG_MATI = 0.6;
// Angka hitung mundur berupa span di dalam role="timer"; label form, angka ringkasan (dt/dd), dan isi Ucapan
// (blockquote) juga teks. Blok terdalam saja yang diukur.
const BLOK_TEKS = "h1, h2, h3, p, li, a, button, label, legend, dt, dd, blockquote, [role='timer'] span";

fs.rmSync(KELUAR, { recursive: true, force: true });
fs.mkdirSync(KELUAR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  isMobile: MOBILE,
  hasTouch: MOBILE,
  reducedMotion: REDUCED ? "reduce" : "no-preference",
});
const galat = [];
page.on("pageerror", (e) => galat.push(String(e)));
page.on("console", (m) => m.type() === "error" && galat.push(m.text()));

await page.goto(URL, { waitUntil: "domcontentloaded" });
const tombol = page.getByRole("button", { name: "Buka Undangan" });
await tombol.waitFor({ timeout: 60_000 });
await page.waitForTimeout(1200);

const frame = [];
async function foto(label) {
  const berkas = path.join(KELUAR, `${String(frame.length).padStart(2, "0")}-${label}.png`);
  await page.screenshot({ path: berkas });
  frame.push({ label, berkas, y: await page.evaluate(() => scrollY) });
  return berkas;
}

await foto("sampul");
await tombol.click();
await page.waitForTimeout(REDUCED ? 700 : 3800);
await foto("terbuka");

// Posisi sampel per act. Act ber-pin juga diambil saat geser masuk dan geser keluar.
const posisi = await page.evaluate((perAct) => {
  const vh = innerHeight;
  const maks = document.documentElement.scrollHeight - vh;
  const hasil = [];
  const pecahan = Array.from({ length: perAct }, (_, i) => i / (perAct - 1));
  for (const el of document.querySelectorAll("[data-sc-act]")) {
    const r = el.getBoundingClientRect();
    const atas = r.top + scrollY;
    const nama = el.id || el.dataset.scAct;
    const pin = ["pin", "pan", "scrub"].includes(el.dataset.scAct);
    if (pin) {
      const jalan = Math.max(r.height - vh, 0);
      if (atas > 0) hasil.push({ act: nama, label: "masuk", y: atas - vh * 0.5 });
      if (jalan > 1) pecahan.forEach((f) => hasil.push({ act: nama, label: `p${f.toFixed(2)}`, y: atas + jalan * f }));
      hasil.push({ act: nama, label: "keluar", y: atas + r.height - vh * 0.5 });
    } else {
      pecahan.forEach((f) => hasil.push({ act: nama, label: `f${f.toFixed(2)}`, y: atas - vh + (r.height + vh) * f }));
    }
  }
  hasil.push({ act: "akhir", label: "dasar", y: maks });
  const unik = new Map();
  for (const h of hasil) {
    const y = Math.round(Math.min(maks, Math.max(0, h.y)));
    if (!unik.has(y)) unik.set(y, { ...h, y });
  }
  return [...unik.values()].sort((a, b) => a.y - b.y);
}, PER_ACT);

async function tenang() {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(250);
}

async function ukurKontras() {
  const teks = await page.evaluate((blok) => {
    const vh = innerHeight, vw = innerWidth;
    const hasil = [];
    for (const el of document.querySelectorAll(`main :is(${blok})`)) {
      if (el.closest(".gerbang, [aria-hidden='true']") || !el.textContent.trim()) continue;
      // Hanya blok teks terdalam: lewati blok yang teksnya ada di blok lain di dalamnya.
      if ([...el.querySelectorAll(blok)].some((anak) => anak.textContent.trim())) continue;
      // Kotak baris teks yang sebenarnya, bukan kotak elemen: blok selebar layar dengan teks pendek
      // tidak boleh dinilai dari latar di bawah ruang kosongnya.
      const rentang = document.createRange();
      rentang.selectNodeContents(el);
      const kotak = [...rentang.getClientRects()]
        .map((r) => ({ left: Math.max(0, r.left), top: Math.max(0, r.top), right: Math.min(vw, r.right), bottom: Math.min(vh, r.bottom) }))
        .filter((r) => r.right - r.left >= 4 && r.bottom - r.top >= 4)
        .map((r) => ({ left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.right - r.left), height: Math.round(r.bottom - r.top) }));
      if (!kotak.length) continue;
      let opasitas = 1;
      for (let n = el; n; n = n.parentElement) opasitas *= parseFloat(getComputedStyle(n).opacity);
      if (opasitas < 0.95) continue;
      const gaya = getComputedStyle(el);
      const latarSendiri = gaya.backgroundColor !== "rgba(0, 0, 0, 0)" ? gaya.backgroundColor : null;
      hasil.push({
        teks: `${el.className || el.tagName.toLowerCase()}: ${el.textContent.trim().slice(0, 36)}`,
        warna: gaya.color,
        latarSendiri,
        besar: parseFloat(gaya.fontSize) >= 24 || (parseFloat(gaya.fontSize) >= 18.66 && parseInt(gaya.fontWeight, 10) >= 700),
        kotak,
      });
    }
    return hasil;
  }, BLOK_TEKS);
  if (!teks.length) return [];

  const sembunyi = `main :is(${BLOK_TEKS}), main :is(${BLOK_TEKS}) *`;
  const tag = await page.addStyleTag({ content: `${sembunyi} { color: transparent !important; text-shadow: none !important; }` });
  await tag.evaluate((el) => el.setAttribute("data-verifikasi", ""));
  await tenang();
  const latar = await page.screenshot();
  await page.evaluate(() => document.querySelector("style[data-verifikasi]")?.remove());
  await tenang();

  const { data, info } = await sharp(latar).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const lum = (r, g, b) => {
    const k = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
  };
  const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
  return teks.map((t) => {
    const tinta = lum(...rgb(t.warna));
    let nilaiLatar;
    if (t.latarSendiri) {
      nilaiLatar = lum(...rgb(t.latarSendiri));
    } else {
      const sampel = [];
      for (const { left, top, width, height } of t.kotak)
        for (let y = top; y < Math.min(info.height, top + height); y += 2)
          for (let x = left; x < Math.min(info.width, left + width); x += 2) {
            const i = (y * info.width + x) * info.channels;
            sampel.push(lum(data[i], data[i + 1], data[i + 2]));
          }
      sampel.sort((a, b) => a - b);
      const rata = sampel.reduce((s, v) => s + v, 0) / sampel.length;
      // Tinta terang: yang menentukan adalah latar paling terang; tinta gelap: latar paling gelap.
      nilaiLatar = tinta >= rata ? sampel[Math.floor(sampel.length * 0.98)] : sampel[Math.floor(sampel.length * 0.02)];
    }
    const rasio = (Math.max(tinta, nilaiLatar) + 0.05) / (Math.min(tinta, nilaiLatar) + 0.05);
    return { teks: t.teks, rasio: Math.round(rasio * 100) / 100, minimal: t.besar ? 3 : 4.5 };
  });
}

const kontras = new Map();
for (const p of posisi) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), p.y);
  await tenang();
  await foto(`${p.act}-${p.label}`);
  for (const k of await ukurKontras()) {
    const lama = kontras.get(k.teks);
    if (!lama || k.rasio < lama.rasio) kontras.set(k.teks, { ...k, frame: `${p.act}-${p.label}` });
  }
}

// Dead scroll: bandingkan sampel berurutan (setelah "terbuka") dalam skala abu-abu kecil.
async function abu(berkas) {
  return sharp(berkas).resize(96, Math.round((96 * H) / W)).greyscale().raw().toBuffer();
}
const mati = [];
for (let i = 3; i < frame.length; i++) {
  const [a, b] = [await abu(frame[i - 1].berkas), await abu(frame[i].berkas)];
  let jumlah = 0;
  for (let j = 0; j < a.length; j++) jumlah += Math.abs(a[j] - b[j]);
  const selisih = jumlah / a.length;
  frame[i].selisih = selisih;
  if (selisih < AMBANG_MATI && frame[i].y !== frame[i - 1].y) mati.push(`${frame[i - 1].label} -> ${frame[i].label} (${selisih.toFixed(2)})`);
}

// Contact sheet.
const KOLOM = 6;
const lebarPanel = MOBILE || W < H ? 220 : 360;
const tinggiPanel = Math.round((lebarPanel * H) / W);
const panel = await Promise.all(
  frame.map(async (f) => {
    const isi = await sharp(f.berkas).resize(lebarPanel, tinggiPanel).toBuffer();
    const label = Buffer.from(
      `<svg width="${lebarPanel}" height="20"><rect width="100%" height="100%" fill="#000"/>` +
        `<text x="5" y="14" font-size="12" fill="#fff" font-family="Arial">${f.label}${f.selisih !== undefined ? ` Δ${f.selisih.toFixed(1)}` : ""}</text></svg>`,
    );
    return { isi, label };
  }),
);
const jeda = 6;
const baris = Math.ceil(panel.length / KOLOM);
const komposit = [];
panel.forEach((p, i) => {
  const x = jeda + (i % KOLOM) * (lebarPanel + jeda);
  const y = jeda + Math.floor(i / KOLOM) * (tinggiPanel + 20 + jeda);
  komposit.push({ input: p.label, left: x, top: y }, { input: p.isi, left: x, top: y + 20 });
});
await sharp({
  create: {
    width: jeda + KOLOM * (lebarPanel + jeda),
    height: jeda + baris * (tinggiPanel + 20 + jeda),
    channels: 3,
    background: "#2a2a2a",
  },
})
  .composite(komposit)
  .jpeg({ quality: 80 })
  .toFile(SHEET);

await browser.close();

const gagalKontras = [...kontras.values()].filter((k) => k.rasio < k.minimal);
console.log(`\n${NAMA} ${W}x${H}${REDUCED ? " reduced-motion" : ""}: ${frame.length} frame`);
console.log(`contact sheet: ${path.relative(process.cwd(), SHEET)}`);
console.log(`DEAD SCROLL: ${mati.length ? `\n  ${mati.join("\n  ")}` : "tidak ada"}`);
console.log("KONTRAS (terburuk per teks):");
for (const k of [...kontras.values()].sort((a, b) => a.rasio - b.rasio)) {
  console.log(`  ${k.rasio < k.minimal ? "GAGAL" : "ok   "} ${k.rasio.toFixed(2)}:1 (min ${k.minimal}) "${k.teks}" @ ${k.frame}`);
}
if (galat.length) console.log(`GALAT HALAMAN:\n  ${galat.join("\n  ")}`);
process.exitCode = gagalKontras.length || galat.length ? 1 : 0;
