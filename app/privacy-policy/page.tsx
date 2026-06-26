import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";
const LAST_UPDATED = "27 Juni 2026";
const CONTACT_EMAIL = "developer@nyanpixel.my.id";

export const metadata: Metadata = {
  title: "Privacy Policy — PustakaFoto",
  description: "Kebijakan Privasi PustakaFoto — penjelasan lengkap tentang bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi kamu.",
  alternates: { canonical: `${BASE}/privacy-policy` },
  robots: { index: true, follow: true },
};

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} style={{ marginBottom: 36 }}>
    <h2 style={{
      fontSize: 17, fontWeight: "bold", color: "var(--text)",
      marginBottom: 14, paddingBottom: 8,
      borderBottom: "1px solid var(--border)",
    }}>
      {title}
    </h2>
    <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.9 }}>
      {children}
    </div>
  </section>
);

const Sub = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontWeight: "bold", color: "var(--text)", marginBottom: 5, fontSize: 14 }}>{title}</div>
    <div>{children}</div>
  </div>
);

const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <p style={{ marginBottom: 10, ...style }}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: 7, paddingLeft: 4 }}>{children}</li>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: "rgba(192,160,96,0.07)", border: "1px solid var(--accent-dim)",
    borderRadius: 3, padding: "10px 14px", marginTop: 10, marginBottom: 10,
    fontSize: 13, color: "var(--text-2)", lineHeight: 1.7,
  }}>
    {children}
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "20px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "var(--text)", marginBottom: 6 }}>
            Kebijakan Privasi
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Berlaku sejak & terakhir diperbarui: {LAST_UPDATED}
          </p>
        </div>

        {/* Intro */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px", marginBottom: 32, fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
          <p style={{ marginBottom: 8 }}>
            Kebijakan Privasi ini menjelaskan secara rinci bagaimana <strong style={{ color: "var(--text)" }}>PustakaFoto</strong> ("kami", "platform", "situs") yang dapat diakses di <strong style={{ color: "var(--accent)" }}>pustakafoto.nyanpixel.my.id</strong> mengumpulkan, menggunakan, menyimpan, membagikan, dan melindungi informasi pribadi Anda.
          </p>
          <p style={{ marginBottom: 8 }}>
            Dokumen ini berlaku untuk semua pengguna platform, baik yang terdaftar (memiliki akun) maupun pengunjung tanpa akun. Dengan mengakses atau menggunakan PustakaFoto, Anda menyatakan telah membaca, memahami, dan menyetujui kebijakan ini.
          </p>
          <p style={{ marginBottom: 0 }}>
            Jika Anda tidak menyetujui kebijakan ini, harap hentikan penggunaan platform dan hubungi kami di <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> untuk permintaan penghapusan data.
          </p>
        </div>

        {/* TOC */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 18px", marginBottom: 32, fontSize: 13 }}>
          <div style={{ fontWeight: "bold", color: "var(--text)", marginBottom: 10 }}>Daftar Isi</div>
          <ol style={{ paddingLeft: 18, color: "var(--text-3)", lineHeight: 2 }}>
            {[
              "Siapa Kami",
              "Informasi yang Kami Kumpulkan",
              "Bagaimana Kami Mengumpulkan Informasi",
              "Mengapa Kami Memproses Data Anda (Dasar Hukum)",
              "Cara Kami Menggunakan Informasi",
              "Penyimpanan dan Keamanan Data",
              "Berbagi Data dengan Pihak Ketiga",
              "Konten Dewasa (18+) dan Perlindungannya",
              "Keanggotaan Berbayar dan Data Transaksi",
              "Cookie dan Teknologi Sesi",
              "Hak-Hak Anda atas Data Pribadi",
              "Retensi dan Penghapusan Data",
              "Transfer Data Internasional",
              "Anak di Bawah Umur",
              "Perubahan Kebijakan Privasi",
              "Cara Menghubungi Kami",
            ].map((item, i) => (
              <li key={i}><a href={`#section-${i + 1}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{item}</a></li>
            ))}
          </ol>
        </div>

        <Section id="section-1" title="1. Siapa Kami">
          <P>PustakaFoto adalah platform galeri foto cosplay komunitas yang dioperasikan secara independen dan dapat diakses di <a href={BASE} style={{ color: "var(--accent)" }}>{BASE}</a>.</P>
          <P>Platform ini bukan merupakan perusahaan yang terdaftar secara resmi sebagai badan hukum, melainkan dioperasikan sebagai proyek digital independen. Meskipun demikian, kami berkomitmen penuh untuk mematuhi peraturan perundang-undangan yang berlaku di Republik Indonesia terkait perlindungan data pribadi dan transaksi elektronik.</P>
          <Sub title="Tanggung jawab data:">
            <P>Sebagai pengelola platform, kami bertindak sebagai <strong>Pengendali Data Pribadi</strong> (<em>Data Controller</em>) dalam arti bahwa kami menentukan tujuan dan cara pemrosesan data pribadi Anda. Penyedia layanan infrastruktur (Supabase, Cloudflare, Vercel, Google) bertindak sebagai <strong>Prosesor Data</strong> (<em>Data Processor</em>) yang memproses data sesuai instruksi kami.</P>
          </Sub>
        </Section>

        <Section id="section-2" title="2. Informasi yang Kami Kumpulkan">
          <P>Kami mengumpulkan dua kategori informasi: yang Anda berikan secara langsung, dan yang dikumpulkan secara otomatis.</P>

          <Sub title="A. Informasi yang Anda Berikan Secara Langsung">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Data akun Google:</strong> Saat login via Google OAuth, kami menerima nama lengkap, alamat email, dan URL foto profil dari akun Google Anda. Kami tidak menerima kata sandi Google Anda — autentikasi dilakukan sepenuhnya oleh Google.</Li>
              <Li><strong>Konten yang diunggah:</strong> Foto cosplay, judul post, nama karakter, deskripsi, dan tag yang Anda tambahkan saat mengunggah konten.</Li>
              <Li><strong>Interaksi sosial:</strong> Komentar yang Anda tulis, vote (upvote/downvote) yang Anda berikan pada post.</Li>
              <Li><strong>Komunikasi dengan admin:</strong> Pesan yang Anda kirim melalui WhatsApp atau email untuk keperluan konfirmasi keanggotaan atau pelaporan masalah.</Li>
            </ul>
          </Sub>

          <Sub title="B. Informasi yang Dikumpulkan Secara Otomatis">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Data sesi:</strong> Token sesi terenkripsi yang disimpan di cookie browser Anda untuk mempertahankan status login.</Li>
              <Li><strong>Data teknis terbatas:</strong> Vercel (penyedia hosting kami) secara otomatis mencatat alamat IP, jenis browser, sistem operasi, dan halaman yang dikunjungi dalam log server standar untuk keperluan keamanan dan pemecahan masalah teknis.</Li>
              <Li><strong>Metadata file:</strong> Saat Anda mengunggah foto, sistem kami mencatat ukuran file, tipe file (JPEG, PNG, dll.), dan waktu unggah.</Li>
            </ul>
          </Sub>

          <Sub title="C. Informasi yang TIDAK Kami Kumpulkan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Kata sandi akun Google atau platform lain</Li>
              <Li>Nomor kartu kredit atau data rekening bank (pembayaran membership dilakukan manual via transfer dan dikonfirmasi via WhatsApp)</Li>
              <Li>Nomor KTP, paspor, atau dokumen identitas</Li>
              <Li>Lokasi GPS real-time</Li>
              <Li>Data kontak (nomor telepon) kecuali Anda memberikannya secara sukarela untuk konfirmasi membership</Li>
              <Li>Data biometrik</Li>
            </ul>
          </Sub>

          <Note>
            <strong>Catatan penting:</strong> Kami tidak menggunakan piksel pelacak, skrip analitik pihak ketiga (seperti Google Analytics), atau alat pemasaran berbasis perilaku. Platform ini bebas dari pelacakan iklan.
          </Note>
        </Section>

        <Section id="section-3" title="3. Bagaimana Kami Mengumpulkan Informasi">
          <Sub title="Login via Google OAuth 2.0">
            <P>Saat Anda menekan tombol "Continue with Google", Anda diarahkan ke halaman login Google. Setelah Anda memberikan izin, Google mengirimkan informasi dasar profil Anda (nama, email, foto) kepada kami melalui protokol OAuth 2.0 yang terenkripsi. Kami tidak pernah melihat atau menyimpan kata sandi Google Anda.</P>
          </Sub>

          <Sub title="Unggahan Konten">
            <P>File foto yang Anda unggah dikirim langsung dari browser Anda ke Cloudflare R2 (penyimpanan cloud kami) melalui URL bertanda tangan (<em>presigned URL</em>) yang terenkripsi dengan SSL/TLS. File tidak melewati server utama kami — ini berarti server kami tidak pernah menyimpan sementara file foto Anda, mengurangi risiko kebocoran data.</P>
          </Sub>

          <Sub title="Interaksi di Platform">
            <P>Setiap komentar, vote, atau tindakan lain yang Anda lakukan dicatat dalam database kami (Supabase) beserta ID akun Anda dan waktu kejadian, untuk keperluan moderasi dan fungsionalitas platform.</P>
          </Sub>

          <Sub title="Log Server Otomatis">
            <P>Vercel, sebagai penyedia hosting, secara otomatis mencatat log akses standar termasuk alamat IP dan informasi browser. Log ini tidak kami akses secara aktif kecuali untuk pemecahan masalah teknis atau investigasi insiden keamanan, dan disimpan oleh Vercel sesuai kebijakan retensi mereka.</P>
          </Sub>
        </Section>

        <Section id="section-4" title="4. Mengapa Kami Memproses Data Anda (Dasar Hukum)">
          <P>Sesuai UU PDP No. 27 Tahun 2022, setiap pemrosesan data pribadi harus memiliki dasar hukum yang sah. Berikut dasar hukum yang kami gunakan:</P>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Tujuan Pemrosesan", "Dasar Hukum", "Data yang Diproses"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", border: "1px solid var(--border)", color: "var(--text)", fontWeight: "bold" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Autentikasi login", "Pelaksanaan kontrak / persetujuan", "Email, nama, foto profil Google"],
                  ["Menampilkan konten & profil", "Pelaksanaan kontrak", "Nama, foto profil, konten unggahan"],
                  ["Moderasi & keamanan", "Kepentingan sah kami", "Semua data akun & konten"],
                  ["Keanggotaan berbayar", "Pelaksanaan kontrak", "Email, nama, riwayat konfirmasi"],
                  ["Kepatuhan hukum", "Kewajiban hukum", "Data yang diminta otoritas berwenang"],
                  ["Pemberitahuan perubahan layanan", "Kepentingan sah kami", "Email"],
                ].map(([purpose, basis, data], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-3)" }}>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{purpose}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{basis}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="section-5" title="5. Cara Kami Menggunakan Informasi">
          <Sub title="Untuk Menjalankan Platform">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Memverifikasi identitas Anda saat login dan mempertahankan sesi</Li>
              <Li>Menampilkan konten yang Anda unggah beserta nama profil dan foto Anda</Li>
              <Li>Memproses vote dan komentar yang Anda berikan</Li>
              <Li>Memberikan akses ke konten members-only bagi pengguna berlangganan</Li>
            </ul>
          </Sub>

          <Sub title="Untuk Keamanan dan Moderasi">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Mendeteksi dan mencegah penyalahgunaan, spam, atau pelanggaran ketentuan layanan</Li>
              <Li>Menyelidiki laporan konten yang tidak pantas</Li>
              <Li>Menangguhkan atau menghapus akun yang melanggar aturan</Li>
              <Li>Memblokir pengguna yang sudah di-ban dari mengakses platform</Li>
            </ul>
          </Sub>

          <Sub title="Untuk Komunikasi">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Merespons pertanyaan atau laporan yang Anda kirimkan melalui email</Li>
              <Li>Mengkonfirmasi status keanggotaan berbayar</Li>
              <Li>Memberitahukan perubahan material pada kebijakan atau layanan (jika diperlukan)</Li>
            </ul>
          </Sub>

          <Sub title="Yang TIDAK Kami Lakukan dengan Data Anda">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Menjual data Anda kepada siapapun</Li>
              <Li>Menggunakan data Anda untuk iklan bertarget</Li>
              <Li>Membagikan data Anda kepada pihak ketiga untuk tujuan pemasaran</Li>
              <Li>Membuat profil perilaku untuk tujuan komersial</Li>
              <Li>Menggunakan data Anda untuk pelatihan model AI</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="section-6" title="6. Penyimpanan dan Keamanan Data">
          <Sub title="Di Mana Data Disimpan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Database (akun, post, komentar, vote, membership):</strong> Supabase — PostgreSQL terenkripsi, berlokasi di infrastruktur AWS ap-southeast-1 (Singapura). Data dienkripsi saat istirahat (<em>at-rest</em>) dan saat transit (<em>in-transit</em>) menggunakan AES-256 dan TLS 1.3.</Li>
              <Li><strong>File foto:</strong> Cloudflare R2 — penyimpanan objek terdistribusi dengan enkripsi AES-256 at-rest. File foto diakses melalui CDN Cloudflare dengan koneksi HTTPS.</Li>
              <Li><strong>Sesi login:</strong> Token sesi disimpan dalam cookie browser Anda yang di-set sebagai HttpOnly (tidak dapat diakses JavaScript) dan Secure (hanya dikirim melalui HTTPS).</Li>
              <Li><strong>Server aplikasi:</strong> Vercel — infrastruktur serverless di berbagai region global dengan enkripsi TLS.</Li>
            </ul>
          </Sub>

          <Sub title="Langkah-Langkah Keamanan yang Kami Terapkan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Seluruh komunikasi menggunakan HTTPS/TLS — tidak ada data yang dikirim dalam teks biasa</Li>
              <Li>Token autentikasi dirotasi secara berkala</Li>
              <Li>Akses database dibatasi hanya untuk komponen yang memerlukannya (prinsip <em>least privilege</em>)</Li>
              <Li>Kunci API dan kredensial disimpan sebagai variabel lingkungan terenkripsi, tidak pernah di-hardcode dalam kode sumber</Li>
              <Li>File foto diunggah langsung ke R2 menggunakan presigned URL — server utama tidak menyimpan file sementara</Li>
              <Li>Admin panel dilindungi dengan verifikasi peran (role-based access control)</Li>
            </ul>
          </Sub>

          <Sub title="Keterbatasan Keamanan">
            <P>Meskipun kami menerapkan langkah-langkah keamanan yang wajar dan mengikuti praktik terbaik industri, tidak ada sistem yang 100% aman dari serangan siber. Jika terjadi pelanggaran data yang berdampak pada data pribadi Anda, kami akan memberitahu Anda melalui email sesegera mungkin sesuai ketentuan UU PDP.</P>
          </Sub>

          <Note>
            <strong>Apa yang harus Anda lakukan untuk melindungi akun:</strong> Pastikan akun Google yang Anda gunakan untuk login ke PustakaFoto memiliki verifikasi dua langkah (2FA) yang aktif. Jika akun Google Anda diretas, akun PustakaFoto Anda juga berisiko.
          </Note>
        </Section>

        <Section id="section-7" title="7. Berbagi Data dengan Pihak Ketiga">
          <P>Kami tidak menjual atau menyewakan data Anda. Data hanya dibagikan dalam situasi berikut:</P>

          <Sub title="A. Penyedia Layanan Infrastruktur (Prosesor Data)">
            <P>Layanan-layanan berikut memproses data Anda atas nama kami untuk menjalankan platform:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Supabase</strong> (database) — <a href="https://supabase.com/privacy" style={{ color: "var(--accent)" }} target="_blank">kebijakan privasi</a></Li>
              <Li><strong>Cloudflare</strong> (CDN, R2 storage, image resizing) — <a href="https://www.cloudflare.com/privacypolicy/" style={{ color: "var(--accent)" }} target="_blank">kebijakan privasi</a></Li>
              <Li><strong>Vercel</strong> (hosting & serverless) — <a href="https://vercel.com/legal/privacy-policy" style={{ color: "var(--accent)" }} target="_blank">kebijakan privasi</a></Li>
              <Li><strong>Google</strong> (OAuth login) — <a href="https://policies.google.com/privacy" style={{ color: "var(--accent)" }} target="_blank">kebijakan privasi</a></Li>
            </ul>
            <P>Semua penyedia ini terikat kontrak untuk hanya memproses data Anda sesuai instruksi kami dan memiliki standar keamanan yang tinggi.</P>
          </Sub>

          <Sub title="B. Kewajiban Hukum">
            <P>Kami dapat mengungkapkan data Anda kepada otoritas pemerintah Indonesia yang berwenang (seperti Kominfo, Polri, atau pengadilan) jika:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Diperintahkan oleh pengadilan melalui surat perintah yang sah</Li>
              <Li>Diperlukan untuk mematuhi UU ITE atau peraturan perundangan lainnya</Li>
              <Li>Diperlukan untuk penyelidikan tindak pidana yang melibatkan platform kami</Li>
            </ul>
            <P>Dalam kasus seperti ini, kami akan berusaha memberitahu Anda terlebih dahulu kecuali dilarang oleh hukum.</P>
          </Sub>

          <Sub title="C. Perlindungan Hak dan Keselamatan">
            <P>Kami dapat membagikan data yang diperlukan untuk melindungi hak, properti, atau keselamatan PustakaFoto, pengguna lain, atau publik dari ancaman nyata dan serius.</P>
          </Sub>

          <Sub title="D. Konten Ilegal — Kewajiban Pelaporan Wajib">
            <P>Jika kami menemukan atau menerima laporan konten yang melibatkan eksploitasi seksual anak (<em>CSAM</em>), kami memiliki <strong>kewajiban hukum dan moral</strong> untuk segera:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Menghapus konten tersebut dari platform</Li>
              <Li>Menangguhkan akun yang bersangkutan</Li>
              <Li>Melaporkan kepada Komisi Perlindungan Anak Indonesia (KPAI) dan/atau Polri</Li>
              <Li>Menyimpan bukti digital untuk keperluan penyelidikan</Li>
            </ul>
            <P>Ini bukan pilihan — ini adalah kewajiban hukum berdasarkan UU No. 17 Tahun 2016 tentang Perlindungan Anak.</P>
          </Sub>
        </Section>

        <Section id="section-8" title="8. Konten Dewasa (18+) dan Perlindungannya">
          <Sub title="Apa itu Konten 18+ di PustakaFoto">
            <P>Platform ini mengizinkan pengguna untuk menandai konten mereka sebagai "Konten Dewasa (18+)". Konten ini dapat mencakup foto cosplay dengan tema atau visual yang tidak sesuai untuk pengguna di bawah 18 tahun.</P>
          </Sub>

          <Sub title="Mekanisme Perlindungan yang Kami Terapkan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Gating berbasis akun:</strong> Konten 18+ hanya dapat dilihat oleh pengguna yang telah login dengan akun Google yang terverifikasi</Li>
              <Li><strong>Konfirmasi usia:</strong> Saat pertama kali mengakses konten 18+, pengguna harus mengkonfirmasi bahwa mereka berusia 18 tahun atau lebih melalui modal peringatan</Li>
              <Li><strong>Blur otomatis di galeri:</strong> Thumbnail konten 18+ diburamkan di halaman galeri publik dengan overlay peringatan "18+"</Li>
              <Li><strong>Badge identifikasi:</strong> Setiap konten 18+ ditandai dengan badge merah "18+" yang jelas terlihat</Li>
              <Li><strong>Akses membership:</strong> Beberapa konten 18+ mungkin dibatasi hanya untuk pengguna berlangganan</Li>
            </ul>
          </Sub>

          <Sub title="Tanggung Jawab Pengguna">
            <P>Dengan mengkonfirmasi usia 18+ dan mengakses konten dewasa, Anda menyatakan bahwa:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Anda benar-benar berusia 18 tahun atau lebih</Li>
              <Li>Anda memahami dan menerima bahwa konten tersebut bersifat dewasa</Li>
              <Li>Anda tidak akan berbagi akses atau konten tersebut kepada pihak di bawah 18 tahun</Li>
            </ul>
            <P>Memberikan pernyataan usia yang tidak benar merupakan pelanggaran ketentuan layanan dan dapat melanggar hukum yang berlaku.</P>
          </Sub>

          <Sub title="Kepatuhan terhadap UU ITE">
            <P>Kami mematuhi Pasal 27 ayat (1) UU ITE yang melarang distribusi konten asusila kepada publik tanpa batasan usia. Mekanisme login wajib dan konfirmasi usia adalah upaya kami untuk memenuhi kewajiban ini.</P>
          </Sub>

          <Note>
            <strong>Penting:</strong> Jika Anda mengetahui konten 18+ diakses oleh anak di bawah umur melalui platform kami, harap segera laporkan ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a>.
          </Note>
        </Section>

        <Section id="section-9" title="9. Keanggotaan Berbayar dan Data Transaksi">
          <Sub title="Data yang Dikumpulkan untuk Membership">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Nama dan email akun Google (sudah ada di sistem)</Li>
              <Li>Tanggal konfirmasi pembayaran</Li>
              <Li>Durasi keanggotaan yang diaktifkan (30, 60, atau 90 hari)</Li>
              <Li>Status keanggotaan (aktif, kedaluwarsa, dibatalkan)</Li>
            </ul>
          </Sub>

          <Sub title="Data yang TIDAK Kami Simpan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Nomor rekening bank Anda</Li>
              <Li>Screenshot bukti transfer</Li>
              <Li>Riwayat chat WhatsApp (disimpan di perangkat Anda dan WhatsApp, bukan di sistem kami)</Li>
              <Li>Jumlah transfer (hanya status: lunas/belum)</Li>
            </ul>
          </Sub>

          <Sub title="Proses Konfirmasi Manual">
            <P>Pembayaran membership dikonfirmasi secara manual oleh admin melalui WhatsApp. Proses ini berarti:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Nomor WhatsApp Anda akan diketahui oleh admin platform (bukan disimpan di database)</Li>
              <Li>Admin akan mengaktifkan akses Anda secara manual setelah konfirmasi pembayaran</Li>
              <Li>Tidak ada sistem pembayaran otomatis yang menyimpan data keuangan Anda</Li>
            </ul>
          </Sub>

          <Sub title="Penggunaan Data Transaksi">
            <P>Data keanggotaan digunakan semata-mata untuk:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Menentukan apakah Anda berhak mengakses konten eksklusif</Li>
              <Li>Melacak tanggal kedaluwarsa keanggotaan</Li>
              <Li>Memberikan akses yang sesuai dengan status keanggotaan Anda</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="section-10" title="10. Cookie dan Teknologi Sesi">
          <Sub title="Cookie yang Kami Gunakan">
            <P>PustakaFoto menggunakan satu jenis cookie: <strong>cookie sesi autentikasi</strong>.</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Nama cookie:</strong> <code style={{ background: "var(--bg-3)", padding: "1px 5px", borderRadius: 2, fontSize: 12 }}>better-auth.session_token</code> atau <code style={{ background: "var(--bg-3)", padding: "1px 5px", borderRadius: 2, fontSize: 12 }}>__Secure-better-auth.session_token</code></Li>
              <Li><strong>Tujuan:</strong> Mempertahankan status login Anda antar halaman</Li>
              <Li><strong>Durasi:</strong> 30 hari, atau hingga Anda logout</Li>
              <Li><strong>Sifat:</strong> HttpOnly (tidak dapat diakses oleh JavaScript), Secure (hanya dikirim via HTTPS), SameSite</Li>
            </ul>
          </Sub>

          <Sub title="Yang TIDAK Kami Gunakan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Cookie iklan atau pelacakan</Li>
              <Li>Cookie analitik pihak ketiga (Google Analytics, Mixpanel, dll.)</Li>
              <Li>Cookie lintas situs (<em>third-party tracking cookies</em>)</Li>
              <Li>Piksel pelacak Facebook, Twitter, atau platform media sosial lainnya</Li>
            </ul>
          </Sub>

          <Sub title="Cara Mengelola Cookie">
            <P>Anda dapat menghapus cookie PustakaFoto melalui pengaturan browser Anda. Menghapus cookie sesi akan mengakhiri sesi login Anda dan Anda perlu login kembali. Cookie sesi kami diperlukan untuk fungsi dasar platform — tanpanya, Anda tidak dapat menggunakan fitur yang memerlukan autentikasi.</P>
          </Sub>
        </Section>

        <Section id="section-11" title="11. Hak-Hak Anda atas Data Pribadi">
          <P>Sesuai UU PDP No. 27 Tahun 2022 Pasal 5-16, Anda memiliki hak-hak berikut:</P>

          <Sub title="1. Hak untuk Mengetahui (Right to Know)">
            <P>Anda berhak mengetahui data pribadi apa yang kami miliki tentang Anda, untuk tujuan apa data tersebut diproses, dan kepada siapa data tersebut dibagikan. Untuk menggunakan hak ini, kirim permintaan ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> dengan subjek "Permintaan Akses Data".</P>
          </Sub>

          <Sub title="2. Hak Koreksi (Right to Rectification)">
            <P>Jika data Anda tidak akurat (misalnya nama yang salah), Anda berhak meminta koreksi. Untuk nama dan foto profil, perubahan harus dilakukan di akun Google Anda terlebih dahulu dan akan otomatis diperbarui saat login berikutnya.</P>
          </Sub>

          <Sub title="3. Hak Penghapusan (Right to Erasure / Right to be Forgotten)">
            <P>Anda berhak meminta penghapusan akun dan semua data pribadi Anda dari sistem kami. Ini mencakup:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Penghapusan akun dan data profil</Li>
              <Li>Penghapusan semua post, foto, komentar, dan vote yang Anda buat</Li>
              <Li>Penghapusan data keanggotaan</Li>
              <Li>Penghapusan file foto dari penyimpanan cloud</Li>
            </ul>
            <P>Penghapusan akan dilakukan dalam <strong>30 hari</strong> sejak permintaan diterima. Beberapa data mungkin dipertahankan lebih lama jika diperlukan untuk kepatuhan hukum (misalnya, jika akun sedang dalam penyelidikan pelanggaran).</P>
          </Sub>

          <Sub title="4. Hak Portabilitas Data (Right to Data Portability)">
            <P>Anda berhak mendapatkan salinan data Anda dalam format yang dapat dibaca mesin (JSON atau CSV) yang mencakup informasi profil Anda dan metadata post yang Anda unggah. Kirim permintaan ke email kami.</P>
          </Sub>

          <Sub title="5. Hak Keberatan (Right to Object)">
            <P>Anda dapat mengajukan keberatan terhadap pemrosesan data Anda untuk tujuan tertentu. Misalnya, jika Anda keberatan dengan tampilan nama Anda di konten publik, Anda dapat meminta perubahan tersebut.</P>
          </Sub>

          <Sub title="6. Hak Penarikan Persetujuan (Right to Withdraw Consent)">
            <P>Jika pemrosesan data didasarkan pada persetujuan Anda, Anda dapat menarik persetujuan tersebut kapan saja dengan menghubungi kami. Penarikan persetujuan tidak mempengaruhi pemrosesan yang telah dilakukan sebelumnya.</P>
          </Sub>

          <Sub title="Cara Mengajukan Permintaan Hak">
            <P>Kirim email ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> dengan:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Subjek yang jelas (contoh: "Permintaan Penghapusan Data")</Li>
              <Li>Alamat email yang terdaftar di akun PustakaFoto Anda</Li>
              <Li>Deskripsi singkat permintaan Anda</Li>
            </ul>
            <P>Kami akan merespons dalam <strong>14 hari kerja</strong> dan menyelesaikan permintaan dalam <strong>30 hari kalender</strong>. Jika diperlukan waktu lebih lama, kami akan memberitahu Anda.</P>
          </Sub>

          <Note>
            <strong>Catatan:</strong> Kami mungkin meminta verifikasi identitas sebelum memproses permintaan sensitif seperti penghapusan data, untuk mencegah permintaan yang tidak sah.
          </Note>
        </Section>

        <Section id="section-12" title="12. Retensi dan Penghapusan Data">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Jenis Data", "Durasi Penyimpanan", "Alasan"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", border: "1px solid var(--border)", color: "var(--text)", fontWeight: "bold" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Data akun & profil", "Selama akun aktif + 30 hari setelah penghapusan", "Fungsionalitas platform"],
                  ["Konten unggahan (foto, post)", "Selama akun aktif + 30 hari setelah penghapusan", "Fungsionalitas platform"],
                  ["Komentar & vote", "Selama akun aktif + 30 hari setelah penghapusan", "Integritas konten"],
                  ["Data keanggotaan", "2 tahun setelah keanggotaan berakhir", "Kepatuhan hukum & sengketa"],
                  ["Log sesi", "30 hari", "Keamanan"],
                  ["Log server (Vercel)", "Sesuai kebijakan Vercel (maks. 90 hari)", "Pemecahan masalah teknis"],
                  ["Data akun yang di-ban", "Hingga 5 tahun", "Pencegahan pembuatan akun baru"],
                ].map(([type, duration, reason], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-3)" }}>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{type}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{duration}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>Setelah periode retensi berakhir, data dihapus secara permanen dari sistem kami dan dari penyimpanan cloud.</P>
        </Section>

        <Section id="section-13" title="13. Transfer Data Internasional">
          <P>Karena kami menggunakan penyedia layanan cloud internasional, data Anda mungkin diproses di luar Indonesia:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
            <Li><strong>Supabase:</strong> Data disimpan di AWS ap-southeast-1 (Singapura) dan/atau region lain sesuai konfigurasi</Li>
            <Li><strong>Cloudflare:</strong> Data didistribusikan melalui CDN global Cloudflare yang mencakup data center di seluruh dunia, termasuk Asia Tenggara</Li>
            <Li><strong>Vercel:</strong> Fungsi serverless dapat berjalan di berbagai region global</Li>
            <Li><strong>Google:</strong> Data OAuth diproses oleh Google sesuai kebijakan privasi mereka</Li>
          </ul>
          <P>Semua penyedia ini memiliki standar keamanan data internasional (SOC 2, ISO 27001) dan tunduk pada ketentuan perlindungan data yang ketat. Kami telah memastikan bahwa transfer data internasional ini dilakukan dengan perlindungan yang memadai sesuai standar internasional.</P>
        </Section>

        <Section id="section-14" title="14. Anak di Bawah Umur">
          <P>PustakaFoto <strong>tidak ditujukan untuk pengguna di bawah 13 tahun</strong> dan konten 18+ <strong>tidak ditujukan untuk pengguna di bawah 18 tahun</strong>.</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Kami tidak secara sengaja mengumpulkan data dari anak di bawah 13 tahun</Li>
            <Li>Jika kami mengetahui bahwa anak di bawah 13 tahun telah membuat akun, kami akan segera menghapus akun dan semua data terkait</Li>
            <Li>Jika Anda orang tua atau wali yang mengetahui anak Anda menggunakan platform ini, harap hubungi kami segera di <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a></Li>
            <Li>Kami mengandalkan sistem autentikasi Google (yang memiliki kebijakan usia minimum sendiri) sebagai lapisan verifikasi pertama</Li>
          </ul>
        </Section>

        <Section id="section-15" title="15. Perubahan Kebijakan Privasi">
          <P>Kami dapat memperbarui kebijakan ini sewaktu-waktu karena berbagai alasan, termasuk:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Perubahan fitur atau layanan platform</Li>
            <Li>Perubahan peraturan perundang-undangan yang berlaku</Li>
            <Li>Pembaruan praktik keamanan atau privasi</Li>
            <Li>Penambahan atau perubahan penyedia layanan pihak ketiga</Li>
          </ul>
          <P>Untuk perubahan yang bersifat material (signifikan), kami akan:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Memperbarui tanggal "Terakhir diperbarui" di bagian atas halaman ini</Li>
            <Li>Menampilkan pemberitahuan di platform selama minimal 7 hari sebelum perubahan berlaku</Li>
          </ul>
          <P>Penggunaan platform setelah perubahan berlaku dianggap sebagai persetujuan Anda terhadap kebijakan yang diperbarui. Jika Anda tidak menyetujui perubahan, Anda dapat menghapus akun Anda sebelum perubahan berlaku.</P>
        </Section>

        <Section id="section-16" title="16. Cara Menghubungi Kami">
          <P>Untuk pertanyaan, kekhawatiran, permintaan hak data, atau pelaporan pelanggaran privasi:</P>
          <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 16px", fontSize: 13, lineHeight: 2 }}>
            <div><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a></div>
            <div><strong>Website:</strong> <a href={BASE} style={{ color: "var(--accent)" }}>{BASE}</a></div>
            <div><strong>Waktu Respons:</strong> Maksimal 14 hari kerja untuk pertanyaan umum, 1×24 jam untuk laporan darurat (CSAM, pelanggaran keamanan)</div>
          </div>
          <P style={{ marginTop: 14 }}>Jika Anda merasa kami tidak menangani kekhawatiran privasi Anda dengan memadai, Anda berhak mengajukan pengaduan kepada <strong>Komisi Informasi</strong> atau otoritas perlindungan data yang berwenang di Indonesia.</P>
        </Section>

        {/* Footer note */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, fontSize: 12, color: "var(--text-3)", lineHeight: 1.7 }}>
          Dokumen ini dibuat dengan itikad baik untuk memenuhi kewajiban transparansi berdasarkan UU PDP No. 27 Tahun 2022 dan UU ITE No. 11 Tahun 2008. Dokumen ini bukan merupakan nasihat hukum profesional.
        </div>

      </div>
    </AppShell>
  );
}