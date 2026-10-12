type Props = { namaMempelai: string };

/** Menutupi Sampul sampai Konteks Tamu terbaca di browser, agar nama tamu tidak berkedip. */
export function LayarLoading({ namaMempelai }: Props) {
  return (
    <div className="layar-loading" role="status" aria-live="polite">
      <p className="layar-loading__mempelai">{namaMempelai}</p>
      <p className="layar-loading__teks">Memuat undangan</p>
      <noscript>
        <p className="layar-loading__teks">Aktifkan JavaScript untuk membuka undangan.</p>
      </noscript>
    </div>
  );
}
