// Membangun lapisan Hero dari foto Sampul. Jalankan dari root repo:
//   node scrollcraft/builds/undangan/alat/buat-lapisan-hero.mjs
// Prasyarat: masker dari masker-vision.swift (lihat RENCANA.md, "Membangun ulang aset Hero").
// Keluaran ke public/placeholder/hero/: latar, subjek, depan, dan poster (masing-masing terang dan gelap) + hero.json.
// Semua lapisan dan poster berada di ruang bingkai foto, jadi halaman memosisikannya dengan rumus yang sama.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const BUILD = "scrollcraft/builds/undangan";
const KELUAR = "public/placeholder/hero";
const SUMBER = {
  foto: "public/placeholder/sampul.jpg",
  masker: `${BUILD}/masker/sampul.png`,
  bunga: `${BUILD}/aset-asli/sedap-malam-crop.jpg`,
  maskerBunga: `${BUILD}/masker/sedap-malam.png`,
};
/** Baris (dalam potongan bunga) tempat bibir vas mulai; lapisan depan hanya memakai bunganya. */
const BIBIR_VAS = 470;

fs.mkdirSync(KELUAR, { recursive: true });

async function muatRGB(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

async function muatMasker(file, w, h) {
  return sharp(file).resize(w, h).toColourspace("b-w").raw().toBuffer();
}

const luminans = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Dilasi biner (ambang 64) dengan kernel persegi, dipisah per sumbu. */
function dilasi(masker, w, h, r) {
  const sementara = new Uint8Array(w * h);
  const hasil = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let isi = 0;
      for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r) && !isi; k++) isi = masker[y * w + k] > 64 ? 255 : 0;
      sementara[y * w + x] = isi;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let isi = 0;
      for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r) && !isi; k++) isi = sementara[k * w + x];
      hasil[y * w + x] = isi;
    }
  }
  return hasil;
}

/**
 * Mengisi lubang dengan push-pull piramida: warna di sekitar lubang dirata-rata ke level kasar,
 * lalu ditarik kembali ke level halus. Hasilnya isian halus tanpa pola berulang.
 */
function isiPushPull(rgb, w, h, lubang) {
  const level = [];
  let kini = { w, h, c: new Float32Array(w * h * 3), a: new Float32Array(w * h) };
  for (let i = 0; i < w * h; i++) {
    const a = lubang[i] ? 0 : 1;
    kini.a[i] = a;
    for (let k = 0; k < 3; k++) kini.c[i * 3 + k] = rgb[i * 3 + k] * a;
  }
  level.push(kini);
  while (kini.w > 1 || kini.h > 1) {
    const nw = Math.max(1, Math.ceil(kini.w / 2));
    const nh = Math.max(1, Math.ceil(kini.h / 2));
    const baru = { w: nw, h: nh, c: new Float32Array(nw * nh * 3), a: new Float32Array(nw * nh) };
    for (let y = 0; y < nh; y++) {
      for (let x = 0; x < nw; x++) {
        let jumlah = 0;
        const j = y * nw + x;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const sx = Math.min(kini.w - 1, x * 2 + dx);
            const sy = Math.min(kini.h - 1, y * 2 + dy);
            const s = sy * kini.w + sx;
            baru.a[j] += kini.a[s];
            for (let k = 0; k < 3; k++) baru.c[j * 3 + k] += kini.c[s * 3 + k];
            jumlah++;
          }
        }
        baru.a[j] /= jumlah;
        for (let k = 0; k < 3; k++) baru.c[j * 3 + k] /= jumlah;
      }
    }
    level.push(baru);
    kini = baru;
  }
  // Level teratas: normalkan supaya tidak ada piksel tanpa warna.
  const puncak = level[level.length - 1];
  for (let i = 0; i < puncak.w * puncak.h; i++) {
    const a = puncak.a[i] || 1;
    for (let k = 0; k < 3; k++) puncak.c[i * 3 + k] /= a;
    puncak.a[i] = 1;
  }
  for (let l = level.length - 2; l >= 0; l--) {
    const L = level[l];
    const U = level[l + 1];
    for (let y = 0; y < L.h; y++) {
      for (let x = 0; x < L.w; x++) {
        const i = y * L.w + x;
        if (L.a[i] >= 0.999) continue;
        // Sampel bilinear dari level kasar yang sudah penuh.
        const ux = Math.min(U.w - 1, Math.max(0, (x + 0.5) / 2 - 0.5));
        const uy = Math.min(U.h - 1, Math.max(0, (y + 0.5) / 2 - 0.5));
        const x0 = Math.floor(ux), y0 = Math.floor(uy);
        const x1 = Math.min(U.w - 1, x0 + 1), y1 = Math.min(U.h - 1, y0 + 1);
        const fx = ux - x0, fy = uy - y0;
        const sisa = 1 - L.a[i];
        for (let k = 0; k < 3; k++) {
          const atas = U.c[(y0 * U.w + x0) * 3 + k] * (1 - fx) + U.c[(y0 * U.w + x1) * 3 + k] * fx;
          const bawah = U.c[(y1 * U.w + x0) * 3 + k] * (1 - fx) + U.c[(y1 * U.w + x1) * 3 + k] * fx;
          L.c[i * 3 + k] += sisa * (atas * (1 - fy) + bawah * fy);
        }
        L.a[i] = 1;
      }
    }
  }
  return level[0].c;
}

/**
 * Lentera padam: seluruh ruangan meredup dengan kurva yang tetap monoton, dan sorotan ditekan paling kuat
 * sehingga inti lentera hanya sedikit lebih terang dari dinding di sekitarnya.
 * Kurva yang tidak monoton membuat inti lentera lebih gelap dari dinding (noda gelap), dan sorotan yang
 * dibiarkan putih berubah kebiruan di ruangan yang jingga. Karena itu sorotan diberi rona jingga ruangan.
 */
const RONA_RUANGAN = [1, 0.67, 0.35]; // jingga dinding berlentera; luminansnya ±0.717
function gelapkan(rgb, kanal) {
  const hasil = Buffer.from(rgb);
  const lumRona = luminans(RONA_RUANGAN[0] * 255, RONA_RUANGAN[1] * 255, RONA_RUANGAN[2] * 255);
  for (let i = 0; i < rgb.length; i += kanal) {
    const L = luminans(rgb[i], rgb[i + 1], rgb[i + 2]);
    const f = 0.2 * (1 - 0.4 * smoothstep(0.5, 1, L));
    const sorot = smoothstep(0.45, 0.85, L);
    const hangat = RONA_RUANGAN.map((c) => ((c * L * f) / lumRona) * 255);
    for (let k = 0; k < 3; k++) hasil[i + k] = Math.round(rgb[i + k] * f * (1 - sorot) + hangat[k] * sorot);
  }
  return hasil;
}

function kotakAlpha(rgba, w, h, ambang = 8) {
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > ambang) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x: x0, y: y0, lebar: x1 - x0 + 1, tinggi: y1 - y0 + 1 };
}

/** Titik bersentuhan subjek dengan lantai: pusat massa baris-baris terbawah. */
function titikKontak(rgba, w, kotak) {
  const bawah = kotak.y + kotak.tinggi - 1;
  let jumlahX = 0, n = 0;
  for (let y = bawah - 40; y <= bawah; y++) {
    for (let x = kotak.x; x < kotak.x + kotak.lebar; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 128) {
        jumlahX += x;
        n++;
      }
    }
  }
  return { x: Math.round(jumlahX / Math.max(1, n)), y: bawah };
}

/** Titik-titik paling terang (inti lentera dan lilin) pada versi diperkecil 1/4. */
function deteksiLentera(rgb, w, h) {
  const s = 4, sw = Math.floor(w / s), sh = Math.floor(h / s);
  const terang = new Uint8Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      let jumlah = 0;
      for (let dy = 0; dy < s; dy++) {
        for (let dx = 0; dx < s; dx++) {
          const i = ((y * s + dy) * w + (x * s + dx)) * 3;
          jumlah += luminans(rgb[i], rgb[i + 1], rgb[i + 2]);
        }
      }
      terang[y * sw + x] = jumlah / (s * s) > 0.9 ? 1 : 0;
    }
  }
  const dikunjungi = new Uint8Array(sw * sh);
  const titik = [];
  for (let i = 0; i < sw * sh; i++) {
    if (!terang[i] || dikunjungi[i]) continue;
    const antrean = [i];
    dikunjungi[i] = 1;
    let jx = 0, jy = 0, n = 0;
    while (antrean.length) {
      const j = antrean.pop();
      const x = j % sw, y = Math.floor(j / sw);
      jx += x;
      jy += y;
      n++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        const k = ny * sw + nx;
        if (nx >= 0 && ny >= 0 && nx < sw && ny < sh && terang[k] && !dikunjungi[k]) {
          dikunjungi[k] = 1;
          antrean.push(k);
        }
      }
    }
    if (n >= 3) titik.push({ x: (jx / n + 0.5) / sw, y: (jy / n + 0.5) / sh, luas: n });
  }
  // Bola lampu yang berdekatan (satu lentera besar berisi beberapa bola) digabung menjadi satu pendar.
  const gugus = [];
  for (const t of titik.sort((a, b) => b.luas - a.luas)) {
    const dekat = gugus.find((g) => Math.hypot(g.x - t.x, (g.y - t.y) * (h / w)) < 0.09);
    if (dekat) {
      const luas = dekat.luas + t.luas;
      dekat.x = (dekat.x * dekat.luas + t.x * t.luas) / luas;
      dekat.y = (dekat.y * dekat.luas + t.y * t.luas) / luas;
      dekat.luas = luas;
    } else gugus.push({ ...t });
  }
  return gugus
    .sort((a, b) => b.luas - a.luas)
    .slice(0, 6)
    .map(({ x, y, luas }) => ({
      x: +x.toFixed(4),
      y: +y.toFixed(4),
      // Jari-jari pendar: jauh lebih besar dari inti terangnya.
      r: +Math.min(0.22, Math.max(0.05, (Math.sqrt(luas / Math.PI) * s * 5) / w)).toFixed(4),
    }));
}

async function simpanWebp(buf, w, h, kanal, file, kualitas = 86) {
  await sharp(buf, { raw: { width: w, height: h, channels: kanal } })
    .webp({ quality: kualitas, alphaQuality: 90, effort: 6 })
    .toFile(path.join(KELUAR, file));
}

// 1. Foto dan masker subjek.
const foto = await muatRGB(SUMBER.foto);
const { w, h } = foto;
const masker = await muatMasker(SUMBER.masker, w, h);

// 2. Latar bersih: lubang = masker diperlebar 14px agar halo tepi ikut terhapus.
const lubang = dilasi(masker, w, h, 14);
const isian = isiPushPull(foto.data, w, h, lubang);
// sharp mengembalikan hasil blur satu kanal sebagai sRGB tiga kanal; ambil kanal pertamanya saja.
const transisi = await sharp(Buffer.from(lubang), { raw: { width: w, height: h, channels: 1 } })
  .blur(6)
  .extractChannel(0)
  .raw()
  .toBuffer();
if (transisi.length !== w * h) throw new Error(`masker transisi berukuran ${transisi.length}, seharusnya ${w * h}`);
const latar = Buffer.alloc(w * h * 3);
let benih = 7;
const acak = () => ((benih = (benih * 16807) % 2147483647) / 2147483647) * 2 - 1;
for (let i = 0; i < w * h; i++) {
  const m = transisi[i] / 255;
  const butir = acak() * 6 * m; // butiran film di area isian agar tidak licin
  for (let k = 0; k < 3; k++) {
    const v = foto.data[i * 3 + k] * (1 - m) + isian[i * 3 + k] * m + butir;
    latar[i * 3 + k] = Math.max(0, Math.min(255, Math.round(v)));
  }
}
await simpanWebp(latar, w, h, 3, "latar.webp");
await simpanWebp(gelapkan(latar, 3), w, h, 3, "latar-gelap.webp");

// 3. Subjek beralpha, dipangkas ke kotaknya.
const rgbaPenuh = Buffer.alloc(w * h * 4);
for (let i = 0; i < w * h; i++) {
  for (let k = 0; k < 3; k++) rgbaPenuh[i * 4 + k] = foto.data[i * 3 + k];
  rgbaPenuh[i * 4 + 3] = masker[i];
}
const kotak = kotakAlpha(rgbaPenuh, w, h);
const kontak = titikKontak(rgbaPenuh, w, kotak);
const subjek = await sharp(rgbaPenuh, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left: kotak.x, top: kotak.y, width: kotak.lebar, height: kotak.tinggi })
  .raw()
  .toBuffer();
await simpanWebp(subjek, kotak.lebar, kotak.tinggi, 4, "subjek.webp", 90);
await simpanWebp(gelapkan(subjek, 4), kotak.lebar, kotak.tinggi, 4, "subjek-gelap.webp", 90);

// 4. Lapisan depan: sedap malam, alpha diperhalus dengan jarak warna ke dinding, lalu diblur (dekat kamera).
const bunga = await muatRGB(SUMBER.bunga);
const maskerBunga = await muatMasker(SUMBER.maskerBunga, bunga.w, bunga.h);
const contohDinding = [];
for (let i = 0; i < bunga.w * bunga.h; i++) {
  if (maskerBunga[i] < 10) contohDinding.push([bunga.data[i * 3], bunga.data[i * 3 + 1], bunga.data[i * 3 + 2]]);
}
const median = (k) => contohDinding.map((c) => c[k]).sort((a, b) => a - b)[Math.floor(contohDinding.length / 2)];
const dinding = [median(0), median(1), median(2)];
const tinggiBunga = BIBIR_VAS;
const rgbaBunga = Buffer.alloc(bunga.w * tinggiBunga * 4);
let rataR = 0, rataG = 0, rataB = 0, nBunga = 0;
for (let y = 0; y < tinggiBunga; y++) {
  for (let x = 0; x < bunga.w; x++) {
    const i = y * bunga.w + x;
    const [r, g, b] = [bunga.data[i * 3], bunga.data[i * 3 + 1], bunga.data[i * 3 + 2]];
    const jarak = Math.hypot(r - dinding[0], g - dinding[1], b - dinding[2]);
    const a = (maskerBunga[i] / 255) * smoothstep(26, 70, jarak);
    rgbaBunga.set([r, g, b, Math.round(a * 255)], i * 4);
    if (a > 0.5) {
      rataR += r;
      rataG += g;
      rataB += b;
      nBunga++;
    }
  }
}
// Warna di bawah piksel transparan diisi rata-rata bunga supaya blur tidak menarik warna dinding atau hitam.
const rata = [rataR / nBunga, rataG / nBunga, rataB / nBunga].map(Math.round);
for (let i = 0; i < bunga.w * tinggiBunga; i++) {
  if (rgbaBunga[i * 4 + 3] < 40) rgbaBunga.set(rata, i * 4);
}
const bungaBesar = await sharp(rgbaBunga, { raw: { width: bunga.w, height: tinggiBunga, channels: 4 } })
  .resize(bunga.w * 2, tinggiBunga * 2, { kernel: "lanczos3" })
  .raw()
  .toBuffer({ resolveWithObject: true });
const bungaBlur = await sharp(bungaBesar.data, { raw: bungaBesar.info }).blur(9).raw().toBuffer();
/** Benda di depan kamera berada di luar cahaya lentera: jauh lebih gelap dari subjek, hampir siluet. */
function redupkan(buf, [fr, fg, fb]) {
  const hasil = Buffer.from(buf);
  for (let i = 0; i < hasil.length; i += 4) {
    hasil[i] = Math.round(hasil[i] * fr);
    hasil[i + 1] = Math.round(hasil[i + 1] * fg);
    hasil[i + 2] = Math.round(hasil[i + 2] * fb);
  }
  return hasil;
}
const { width: lebarDepan, height: tinggiDepan } = bungaBesar.info;
await simpanWebp(redupkan(bungaBlur, [0.4, 0.34, 0.28]), lebarDepan, tinggiDepan, 4, "depan-sedap-malam.webp", 84);
await simpanWebp(redupkan(bungaBlur, [0.1, 0.085, 0.07]), lebarDepan, tinggiDepan, 4, "depan-sedap-malam-gelap.webp", 84);

// 5. Lentera, fokus, dan poster.
const lentera = deteksiLentera(latar, w, h);
const fokus = {
  x: +((kotak.x + kotak.lebar / 2) / w).toFixed(4),
  y: +((kotak.y + kotak.tinggi * 0.4) / h).toFixed(4),
};
const komposit = Buffer.from(latar);
const kompositGelap = gelapkan(latar, 3);
const subjekGelap = gelapkan(subjek, 4);
for (let y = 0; y < kotak.tinggi; y++) {
  for (let x = 0; x < kotak.lebar; x++) {
    const s = (y * kotak.lebar + x) * 4;
    const d = ((kotak.y + y) * w + (kotak.x + x)) * 3;
    const a = subjek[s + 3] / 255;
    for (let k = 0; k < 3; k++) {
      komposit[d + k] = Math.round(komposit[d + k] * (1 - a) + subjek[s + k] * a);
      kompositGelap[d + k] = Math.round(kompositGelap[d + k] * (1 - a) + subjekGelap[s + k] * a);
    }
  }
}
// Poster = latar + subjek pada posisi asli (keadaan p=0), ditampilkan selama lapisan dimuat dan saat JS mati.
await simpanWebp(komposit, w, h, 3, "poster.webp", 82);
await simpanWebp(kompositGelap, w, h, 3, "poster-gelap.webp", 82);

const hero = {
  sumber: "/placeholder/sampul.jpg",
  bingkai: { lebar: w, tinggi: h },
  subjek: { ...kotak, kontak },
  depan: { lebar: bungaBesar.info.width, tinggi: bungaBesar.info.height },
  fokus,
  lentera,
};
fs.writeFileSync(path.join(KELUAR, "hero.json"), `${JSON.stringify(hero, null, 2)}\n`);
console.log(JSON.stringify(hero, null, 2));
