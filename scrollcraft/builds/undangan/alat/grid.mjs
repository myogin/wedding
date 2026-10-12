// Menumpuk grid berlabel (dalam piksel asli) di atas foto, untuk memilih area potongan.
// Pemakaian: node grid.mjs <foto> <keluaran.jpg> [jarak=100]
import sharp from "sharp";
const [foto, keluaran, jarakArg] = process.argv.slice(2);
const jarak = Number(jarakArg ?? 100);
const { width: W, height: H } = await sharp(foto).metadata();
let garis = "";
for (let x = 0; x <= W; x += jarak) garis += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#0ff" stroke-width="2" opacity=".6"/><text x="${x + 4}" y="28" fill="#0ff" font-size="24" font-family="Arial">${x}</text>`;
for (let y = 0; y <= H; y += jarak) garis += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#0ff" stroke-width="2" opacity=".6"/><text x="4" y="${y - 4}" fill="#0ff" font-size="24" font-family="Arial">${y}</text>`;
const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${garis}</svg>`);
const komposit = await sharp(foto).composite([{ input: svg }]).png().toBuffer();
await sharp(komposit).resize({ height: 1100 }).jpeg({ quality: 80 }).toFile(keluaran);
