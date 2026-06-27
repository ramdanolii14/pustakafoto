import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";
const LAST_UPDATED = "27 Juni 2026";
const CONTACT_EMAIL = "developer@nyanpixel.my.id";

export const metadata: Metadata = {
  title: "Terms of Service — PustakaFoto",
  description: "Syarat dan Ketentuan Penggunaan PustakaFoto — aturan lengkap yang mengatur penggunaan platform galeri foto cosplay komunitas.",
  alternates: { canonical: `${BASE}/terms-of-service` },
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
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontWeight: "bold", color: "var(--text)", marginBottom: 6, fontSize: 14 }}>{title}</div>
    <div>{children}</div>
  </div>
);

const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <p style={{ marginBottom: 10, ...style }}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: 7, paddingLeft: 4 }}>{children}</li>
);

const Warn = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: "rgba(204,68,68,0.07)",
    border: "1px solid var(--red)",
    borderRadius: 3, padding: "10px 14px",
    marginTop: 10, marginBottom: 10,
    fontSize: 13, color: "var(--text-2)", lineHeight: 1.7,
  }}>
    {children}
  </div>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: "rgba(192,160,96,0.07)",
    border: "1px solid var(--accent-dim)",
    borderRadius: 3, padding: "10px 14px",
    marginTop: 10, marginBottom: 10,
    fontSize: 13, color: "var(--text-2)", lineHeight: 1.7,
  }}>
    {children}
  </div>
);

export default function TermsOfServicePage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "20px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "var(--text)", marginBottom: 6 }}>
            Syarat dan Ketentuan Layanan
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Berlaku sejak & terakhir diperbarui: {LAST_UPDATED}
          </p>
        </div>

        {/* Intro */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px", marginBottom: 32, fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
          <p style={{ marginBottom: 8 }}>
            Selamat datang di <strong style={{ color: "var(--text)" }}>PustakaFoto</strong> — platform galeri foto cosplay komunitas yang dapat diakses di <strong style={{ color: "var(--accent)" }}>pustakafoto.nyanpixel.my.id</strong>.
          </p>
          <p style={{ marginBottom: 8 }}>
            Dokumen Syarat dan Ketentuan ini (<strong style={{ color: "var(--text)" }}>"ToS"</strong> atau <strong style={{ color: "var(--text)" }}>"Ketentuan"</strong>) adalah perjanjian yang mengikat secara hukum antara Anda sebagai pengguna dan kami sebagai pengelola platform. Dengan mengakses, mendaftar, atau menggunakan PustakaFoto dalam bentuk apapun, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum di sini.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong style={{ color: "var(--red)" }}>Jika Anda tidak menyetujui ketentuan ini, Anda tidak diizinkan menggunakan platform ini.</strong> Harap segera tinggalkan situs dan hubungi kami di <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> untuk penghapusan data jika Anda sebelumnya telah mendaftar.
          </p>
        </div>

        {/* TOC */}
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 18px", marginBottom: 32, fontSize: 13 }}>
          <div style={{ fontWeight: "bold", color: "var(--text)", marginBottom: 10 }}>Daftar Isi</div>
          <ol style={{ paddingLeft: 18, color: "var(--text-3)", lineHeight: 2.1 }}>
            {[
              "Definisi Istilah",
              "Tentang Platform PustakaFoto",
              "Kelayakan dan Persyaratan Pengguna",
              "Pendaftaran Akun dan Keamanan",
              "Konten yang Diizinkan",
              "Konten yang Dilarang Keras",
              "Konten Dewasa (18+) — Aturan Khusus",
              "Hak Kekayaan Intelektual",
              "Keanggotaan Berbayar (Membership)",
              "Perilaku Pengguna dan Etika Komunitas",
              "Moderasi, Penangguhan, dan Penghapusan Akun",
              "Tanggung Jawab dan Batasan Kewajiban",
              "Ganti Rugi (Indemnification)",
              "Hukum yang Berlaku dan Penyelesaian Sengketa",
              "Ketersediaan Layanan dan Perubahan Platform",
              "Perubahan Syarat dan Ketentuan",
              "Ketentuan Lain-lain",
              "Cara Menghubungi Kami",
            ].map((item, i) => (
              <li key={i}><a href={`#tos-${i + 1}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{item}</a></li>
            ))}
          </ol>
        </div>

        <Section id="tos-1" title="1. Definisi Istilah">
          <P>Untuk memastikan kejelasan, berikut definisi istilah-istilah yang digunakan dalam dokumen ini:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>"Platform" / "Situs"</strong> — PustakaFoto dan semua layanan yang tersedia di pustakafoto.nyanpixel.my.id beserta subdomain dan API-nya.</Li>
            <Li><strong>"Kami" / "Pengelola"</strong> — Pihak yang mengoperasikan PustakaFoto secara independen.</Li>
            <Li><strong>"Anda" / "Pengguna"</strong> — Setiap individu yang mengakses, mendaftar, atau menggunakan Platform, baik dengan atau tanpa akun.</Li>
            <Li><strong>"Akun"</strong> — Identitas digital yang dibuat saat Anda mendaftar di Platform menggunakan akun Google.</Li>
            <Li><strong>"Konten"</strong> — Semua materi yang diunggah, dibagikan, atau dibuat di Platform, termasuk foto, teks, komentar, dan metadata.</Li>
            <Li><strong>"Konten 18+"</strong> — Konten yang ditandai sebagai konten dewasa yang tidak sesuai untuk pengguna di bawah 18 tahun.</Li>
            <Li><strong>"Member" / "Anggota"</strong> — Pengguna yang memiliki langganan keanggotaan berbayar yang aktif.</Li>
            <Li><strong>"Post"</strong> — Unggahan yang terdiri dari satu atau lebih foto cosplay beserta informasi terkait (judul, karakter, deskripsi, tag).</Li>
            <Li><strong>"Admin"</strong> — Pengelola platform yang memiliki akses ke panel administrasi dan berwenang memoderasi konten dan pengguna.</Li>
            <Li><strong>"CSAM"</strong> — <em>Child Sexual Abuse Material</em> — konten seksual yang melibatkan individu di bawah 18 tahun, yang merupakan materi ilegal di Indonesia dan di seluruh dunia.</Li>
            <Li><strong>"ToS"</strong> — Dokumen Syarat dan Ketentuan ini.</Li>
            <Li><strong>"UU ITE"</strong> — Undang-Undang No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik sebagaimana telah diubah dengan UU No. 19 Tahun 2016.</Li>
            <Li><strong>"UU PDP"</strong> — Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.</Li>
          </ul>
        </Section>

        <Section id="tos-2" title="2. Tentang Platform PustakaFoto">
          <Sub title="Deskripsi Layanan">
            <P>PustakaFoto adalah platform galeri foto cosplay komunitas berbasis web. Platform ini memungkinkan pengguna untuk:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Mengunggah dan berbagi foto cosplay karakter anime, game, film, atau karakter orisinal</Li>
              <Li>Menelusuri dan menemukan foto cosplay dari komunitas</Li>
              <Li>Memberikan vote (upvote/downvote) dan komentar pada post</Li>
              <Li>Berlangganan keanggotaan berbayar untuk mengakses konten eksklusif</Li>
              <Li>Menjelajahi konten berdasarkan karakter, tag, dan kategori</Li>
            </ul>
          </Sub>

          <Sub title="Status Hukum Platform">
            <P>PustakaFoto dioperasikan sebagai proyek digital independen dan bukan merupakan badan hukum yang terdaftar secara resmi (seperti PT atau CV). Meskipun demikian, kami beroperasi dalam kerangka hukum Republik Indonesia dan mematuhi peraturan perundang-undangan yang berlaku, termasuk UU ITE, UU PDP, dan UU Hak Cipta.</P>
          </Sub>

          <Sub title="Sifat Platform">
            <P>PustakaFoto adalah platform <em>user-generated content</em> (UGC) — artinya konten yang ada di platform ini diunggah oleh pengguna, bukan oleh kami. Kami bertindak sebagai perantara (<em>intermediary</em>) yang menyediakan infrastruktur teknis. Meskipun kami melakukan moderasi, kami tidak dapat menjamin bahwa semua konten telah diperiksa sebelum dipublikasikan.</P>
          </Sub>

          <Note>
            <strong>Transparansi:</strong> Platform ini tidak berafiliasi dengan studio anime, perusahaan game, atau pemegang hak cipta karakter apapun. Cosplay sebagai kegiatan budaya penggemar umumnya diterima secara luas, namun tanggung jawab atas penggunaan karakter berlisensi tetap berada pada pengguna yang mengunggah.
          </Note>
        </Section>

        <Section id="tos-3" title="3. Kelayakan dan Persyaratan Pengguna">
          <Sub title="Persyaratan Usia Minimum">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Usia minimum mendaftar akun: 13 tahun.</strong> Dengan mendaftar, Anda menyatakan bahwa Anda berusia setidaknya 13 tahun.</Li>
              <Li><strong>Usia minimum mengakses konten 18+: 18 tahun.</strong> Dengan mengkonfirmasi akses ke konten dewasa, Anda menyatakan bahwa Anda berusia setidaknya 18 tahun.</Li>
              <Li><strong>Usia minimum berlangganan membership: 18 tahun</strong>, karena membership memberikan akses ke konten 18+.</Li>
            </ul>
          </Sub>

          <Sub title="Persyaratan Teknis">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Memiliki akun Google yang valid dan aktif untuk keperluan autentikasi</Li>
              <Li>Perangkat dengan koneksi internet yang aktif</Li>
              <Li>Browser web modern yang mendukung JavaScript</Li>
            </ul>
          </Sub>

          <Sub title="Persyaratan Hukum">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Anda harus memiliki kapasitas hukum untuk membuat perjanjian yang mengikat sesuai hukum yang berlaku di negara Anda</Li>
              <Li>Jika Anda berusia di bawah 18 tahun, Anda harus mendapatkan persetujuan dari orang tua atau wali sebelum mendaftar</Li>
              <Li>Anda tidak boleh menggunakan Platform jika sebelumnya akun Anda pernah dinonaktifkan atau di-ban oleh kami</Li>
              <Li>Anda tidak boleh menggunakan Platform untuk tujuan yang melanggar hukum yang berlaku di Indonesia atau negara Anda</Li>
            </ul>
          </Sub>

          <Warn>
            <strong>Larangan mendaftar ulang setelah di-ban:</strong> Jika akun Anda telah dinonaktifkan karena pelanggaran ToS, Anda dilarang mendaftar akun baru dengan identitas berbeda. Pelanggaran ketentuan ini dapat mengakibatkan pelaporan kepada pihak berwajib jika terkait dengan pelanggaran hukum.
          </Warn>
        </Section>

        <Section id="tos-4" title="4. Pendaftaran Akun dan Keamanan">
          <Sub title="Proses Pendaftaran">
            <P>Pendaftaran di PustakaFoto dilakukan melalui Google OAuth. Tidak ada formulir pendaftaran manual — Anda cukup mengklik "Continue with Google" dan mengizinkan PustakaFoto mengakses informasi dasar profil Google Anda (nama, email, foto profil).</P>
          </Sub>

          <Sub title="Keakuratan Informasi">
            <P>Meskipun kami tidak memverifikasi identitas Anda secara aktif, dengan mendaftar Anda menyatakan bahwa:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Informasi yang diberikan adalah benar dan akurat</Li>
              <Li>Anda adalah pemilik sah akun Google yang digunakan</Li>
              <Li>Anda tidak menggunakan identitas orang lain tanpa izin</Li>
            </ul>
          </Sub>

          <Sub title="Keamanan Akun">
            <P>Keamanan akun Anda adalah tanggung jawab Anda. Ini berarti:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Anda bertanggung jawab atas semua aktivitas yang dilakukan melalui akun Anda, baik yang Anda lakukan sendiri maupun oleh pihak lain yang menggunakan akun Anda</Li>
              <Li>Anda harus segera memberitahu kami di <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> jika mengetahui atau mencurigai akses tidak sah ke akun Anda</Li>
              <Li>Kami tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan akun Anda oleh pihak lain tanpa izin Anda</Li>
            </ul>
          </Sub>

          <Sub title="Satu Akun per Pengguna">
            <P>Setiap pengguna hanya diizinkan memiliki satu akun aktif. Pembuatan beberapa akun oleh satu orang dapat mengakibatkan penghapusan semua akun tersebut, terutama jika dilakukan untuk menghindari sanksi atau batasan yang telah diberlakukan.</P>
          </Sub>
        </Section>

        <Section id="tos-5" title="5. Konten yang Diizinkan">
          <P>PustakaFoto adalah platform galeri foto cosplay. Konten yang diizinkan diunggah adalah:</P>

          <Sub title="Foto Cosplay">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Foto diri Anda atau orang lain (dengan izin) yang mengenakan kostum karakter anime, manga, game, film, serial TV, tokoh sejarah, atau karakter orisinal</Li>
              <Li>Foto dari sesi pemotretan cosplay (<em>photoshoot</em>) profesional maupun amatir</Li>
              <Li>Foto dari acara cosplay, festival, atau konvensi</Li>
              <Li>Foto <em>cosplay group</em> yang menampilkan beberapa cosplayer</Li>
            </ul>
          </Sub>

          <Sub title="Format File yang Diterima">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>JPEG / JPG</Li>
              <Li>PNG</Li>
              <Li>WebP</Li>
              <Li>GIF (termasuk animasi)</Li>
              <Li>HEIC / HEIF (format kamera iPhone)</Li>
            </ul>
          </Sub>

          <Sub title="Konten 18+ yang Diizinkan (dengan syarat)">
            <P>Konten dewasa yang menampilkan cosplay dengan tema atau visual dewasa diizinkan, <strong>dengan syarat</strong>:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Semua individu yang ditampilkan dalam foto berusia 18 tahun atau lebih</Li>
              <Li>Post ditandai dengan toggle "Konten Dewasa (18+)" saat mengunggah atau mengedit</Li>
              <Li>Tidak melanggar batasan konten yang dilarang (lihat Pasal 6 dan 7)</Li>
            </ul>
          </Sub>

          <Sub title="Metadata yang Baik">
            <P>Untuk kualitas platform yang baik, kami mendorong pengguna untuk mengisi:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Judul yang deskriptif dan informatif</Li>
              <Li>Nama karakter yang akurat beserta seri asalnya</Li>
              <Li>Tag yang relevan untuk memudahkan pencarian</Li>
              <Li>Deskripsi yang mencakup kredit fotografer atau event jika ada</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="tos-6" title="6. Konten yang Dilarang Keras">
          <P>Konten berikut <strong>dilarang keras</strong> di PustakaFoto tanpa pengecualian. Pelanggaran terhadap larangan ini dapat mengakibatkan penghapusan konten, penangguhan akun permanen, dan/atau pelaporan kepada pihak berwajib.</P>

          <Warn>
            <strong>LARANGAN MUTLAK — Tidak Ada Toleransi:</strong>
          </Warn>

          <Sub title="1. Konten Seksual yang Melibatkan Anak (CSAM)">
            <P>Setiap konten seksual — baik foto nyata, ilustrasi, AI-generated, atau bentuk lainnya — yang menampilkan atau menyiratkan individu di bawah usia 18 tahun adalah <strong>dilarang secara mutlak dan merupakan tindak pidana</strong> berdasarkan:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>UU No. 17 Tahun 2016 tentang Perlindungan Anak (pidana penjara hingga 12 tahun)</Li>
              <Li>UU ITE Pasal 27 ayat (1)</Li>
              <Li>Hukum internasional yang berlaku</Li>
            </ul>
            <P>Kami <strong>wajib</strong> dan <strong>akan selalu</strong> melaporkan konten ini beserta data akun terkait kepada Polri dan KPAI tanpa pemberitahuan sebelumnya kepada pengguna.</P>
          </Sub>

          <Sub title="2. Konten Tanpa Izin (Non-Consensual)">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Foto orang lain yang diunggah tanpa izin eksplisit dari orang yang bersangkutan, terutama untuk konten 18+</Li>
              <Li>Konten intim yang disebarkan tanpa persetujuan (<em>revenge porn</em> / <em>non-consensual intimate imagery</em>) — dilarang berdasarkan UU ITE Pasal 27 ayat (1)</Li>
              <Li>Foto yang diambil secara diam-diam tanpa sepengetahuan subjek</Li>
            </ul>
          </Sub>

          <Sub title="3. Kekerasan dan Konten Berbahaya">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Foto yang menampilkan kekerasan nyata, luka serius, atau kematian</Li>
              <Li>Konten yang memuliakan, mempromosikan, atau menganjurkan kekerasan terhadap individu atau kelompok tertentu</Li>
              <Li>Konten terorisme atau yang terkait dengan organisasi teroris</Li>
            </ul>
          </Sub>

          <Sub title="4. Konten Kebencian (Hate Content)">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Konten yang mempromosikan diskriminasi, kebencian, atau kekerasan berdasarkan ras, etnis, agama, jenis kelamin, orientasi seksual, disabilitas, atau karakteristik lainnya</Li>
              <Li>Simbol, lambang, atau propaganda kelompok supremasi atau organisasi terlarang</Li>
              <Li>Konten yang menghasut perpecahan antar kelompok (SARA) yang dapat melanggar UU ITE Pasal 28 ayat (2)</Li>
            </ul>
          </Sub>

          <Sub title="5. Pelanggaran Privasi (Doxxing)">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Mengungkapkan informasi pribadi orang lain tanpa izin (nama asli, alamat, nomor telepon, dll.)</Li>
              <Li>Mengunggah dokumen identitas orang lain</Li>
              <Li>Konten yang bertujuan untuk melecehkan atau mengancam individu tertentu</Li>
            </ul>
          </Sub>

          <Sub title="6. Spam dan Konten Menyesatkan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Unggahan massal konten yang tidak relevan untuk tujuan spam</Li>
              <Li>Konten yang mengandung informasi palsu atau menyesatkan yang berpotensi merugikan pengguna lain</Li>
              <Li>Tautan phishing atau konten yang bertujuan untuk menipu pengguna lain</Li>
            </ul>
          </Sub>

          <Sub title="7. Malware dan Konten Berbahaya Teknis">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>File yang mengandung virus, malware, spyware, atau kode berbahaya</Li>
              <Li>Upaya untuk mengeksploitasi kerentanan keamanan platform</Li>
              <Li>Scraping otomatis atau penggunaan bot tanpa izin tertulis dari kami</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="tos-7" title="7. Konten Dewasa (18+) — Aturan Khusus">
          <Sub title="Definisi Konten 18+ di Platform Ini">
            <P>Yang dimaksud konten 18+ dalam konteks PustakaFoto adalah foto cosplay yang menampilkan:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Pakaian atau pose yang bersifat sensual atau erotis</Li>
              <Li>Konten semi-nudity atau nudity artistik dalam konteks cosplay</Li>
              <Li>Tema atau karakter dewasa dari seri yang memang ditujukan untuk audiens dewasa</Li>
            </ul>
          </Sub>

          <Sub title="Kewajiban Pengunggah Konten 18+">
            <P>Jika Anda mengunggah konten 18+, Anda secara eksplisit menyatakan dan menjamin bahwa:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Semua individu yang muncul dalam foto berusia 18 tahun atau lebih</strong> pada saat foto diambil</Li>
              <Li>Anda memiliki bukti usia (misalnya KTP, paspor) dari semua individu dalam foto jika diminta oleh admin</Li>
              <Li>Semua individu yang muncul dalam foto telah memberikan izin eksplisit untuk mengunggah foto tersebut ke platform publik</Li>
              <Li>Konten tidak melanggar satupun larangan yang tercantum dalam Pasal 6</Li>
            </ul>
          </Sub>

          <Sub title="Konsekuensi Pelanggaran Usia">
            <P>Jika ditemukan bahwa konten 18+ yang Anda unggah menampilkan individu di bawah 18 tahun:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Konten akan segera dihapus</Li>
              <Li>Akun Anda akan dinonaktifkan secara permanen</Li>
              <Li>Data Anda akan dilaporkan kepada Polri dan KPAI sesuai kewajiban hukum kami</Li>
              <Li>Kami akan menyimpan bukti digital untuk keperluan penyelidikan</Li>
            </ul>
          </Sub>

          <Sub title="Hak Pengguna Biasa terhadap Konten 18+">
            <P>Pengguna yang tidak berlangganan membership dapat mengakses sebagian konten 18+ sesuai dengan pengaturan yang dipilih oleh pengunggah. Namun, semua konten 18+ memerlukan login — pengguna tanpa akun tidak dapat mengakses konten ini dalam bentuk apapun.</P>
          </Sub>

          <Warn>
            <strong>Peringatan Hukum:</strong> Mengunggah konten seksual yang melibatkan individu di bawah 18 tahun — bahkan jika diklaim sebagai "cosplay" atau "fiksi" — tetap merupakan tindak pidana berdasarkan UU No. 17 Tahun 2016 tentang Perlindungan Anak dan dapat dipidana penjara hingga 12 tahun dan/atau denda hingga Rp 5 miliar.
          </Warn>
        </Section>

        <Section id="tos-8" title="8. Hak Kekayaan Intelektual">
          <Sub title="Hak Anda atas Konten yang Anda Unggah">
            <P>Anda tetap memiliki hak cipta atas foto-foto yang Anda unggah ke PustakaFoto. Kami tidak mengklaim kepemilikan konten Anda.</P>
            <P>Namun, dengan mengunggah konten ke Platform, Anda memberikan kepada kami lisensi yang bersifat:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Non-eksklusif</strong> — Anda tetap bebas menggunakan foto Anda di platform lain</Li>
              <Li><strong>Bebas royalti</strong> — kami tidak membayar Anda untuk menampilkan konten Anda</Li>
              <Li><strong>Berlaku selama konten aktif di platform</strong> — lisensi berakhir saat konten dihapus</Li>
              <Li><strong>Untuk tujuan operasional platform</strong> — menampilkan foto, membuat thumbnail, optimasi gambar melalui CDN</Li>
            </ul>
          </Sub>

          <Sub title="Karakter dan Waralaba Pihak Ketiga">
            <P>Karakter cosplay yang difoto (seperti karakter dari anime, game, atau film) mungkin merupakan kekayaan intelektual dari pihak ketiga (misalnya Toei Animation, Bandai Namco, Disney, dll.).</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>PustakaFoto adalah platform komunitas non-komersial yang tidak mendapatkan keuntungan dari representasi karakter berlisensi secara langsung</Li>
              <Li>Cosplay sebagai kegiatan penggemar (<em>fan activity</em>) umumnya diterima secara luas oleh industri hiburan Jepang dan global</Li>
              <Li>Tanggung jawab atas penggunaan karakter berlisensi sepenuhnya berada pada pengguna yang mengunggah</Li>
              <Li>Jika pemegang hak cipta mengajukan permintaan penghapusan yang sah (<em>takedown notice</em>), kami akan mematuhinya sesuai prosedur yang berlaku</Li>
            </ul>
          </Sub>

          <Sub title="Hak Cipta Platform">
            <P>Seluruh elemen PustakaFoto yang bukan merupakan konten pengguna — termasuk desain antarmuka, kode aplikasi, logo, nama brand, dan dokumentasi — adalah milik kami dan dilindungi oleh UU Hak Cipta No. 28 Tahun 2014. Anda tidak diizinkan untuk:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Menyalin, memodifikasi, atau mendistribusikan kode atau desain platform</Li>
              <Li>Membuat karya turunan dari platform tanpa izin tertulis</Li>
              <Li>Menggunakan nama "PustakaFoto" atau logo kami untuk keperluan komersial</Li>
            </ul>
          </Sub>

          <Sub title="Pelaporan Pelanggaran Hak Cipta">
            <P>Jika Anda adalah pemegang hak cipta dan menemukan konten yang melanggar hak Anda di platform ini, kirimkan permintaan penghapusan (<em>DMCA takedown notice</em> atau permintaan serupa) ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> dengan menyertakan:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Identifikasi karya yang dilanggar hak ciptanya</Li>
              <Li>URL konten yang melanggar di platform kami</Li>
              <Li>Pernyataan bahwa Anda adalah pemegang hak cipta atau agen yang berwenang</Li>
              <Li>Informasi kontak Anda</Li>
            </ul>
            <P>Kami akan menindaklanjuti permintaan yang sah dalam waktu 7 hari kerja.</P>
          </Sub>
        </Section>

        <Section id="tos-9" title="9. Keanggotaan Berbayar (Membership)">
          <Sub title="Deskripsi Layanan Membership">
            <P>PustakaFoto menawarkan keanggotaan berbayar opsional yang memberikan akses ke konten eksklusif yang tidak tersedia untuk pengguna biasa, termasuk konten yang ditandai sebagai "Members Only" oleh pengunggah.</P>
          </Sub>

          <Sub title="Harga dan Durasi">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Harga:</strong> Rp 14.999 per periode keanggotaan</Li>
              <Li><strong>Durasi standar:</strong> 30 hari sejak tanggal aktivasi</Li>
              <Li><strong>Durasi lainnya:</strong> Admin dapat mengaktifkan keanggotaan 60 atau 90 hari sesuai kesepakatan</Li>
            </ul>
          </Sub>

          <Sub title="Proses Pembayaran dan Aktivasi">
            <P>Pembayaran dilakukan secara manual melalui proses berikut:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Pengguna menghubungi admin via WhatsApp melalui tombol di halaman <a href={`${BASE}/membership`} style={{ color: "var(--accent)" }}>/membership</a></Li>
              <Li>Admin menyampaikan informasi rekening bank untuk transfer</Li>
              <Li>Pengguna melakukan transfer senilai Rp 14.999 dan mengirimkan bukti transfer</Li>
              <Li>Admin memverifikasi pembayaran dan mengaktifkan keanggotaan secara manual</Li>
              <Li>Aktivasi biasanya dilakukan dalam 1×24 jam pada hari kerja</Li>
            </ul>
          </Sub>

          <Sub title="Kebijakan Pengembalian Dana (Refund)">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Umumnya tidak ada refund</strong> — pembayaran yang telah dikonfirmasi bersifat final dan tidak dapat dikembalikan</Li>
              <Li><strong>Pengecualian:</strong> Refund hanya dapat dipertimbangkan jika terjadi kesalahan teknis dari pihak kami yang terbukti secara objektif, misalnya keanggotaan tidak pernah diaktifkan meskipun pembayaran telah dikonfirmasi</Li>
              <Li><strong>Pembatalan oleh admin:</strong> Jika keanggotaan Anda dibatalkan karena pelanggaran ToS, tidak ada refund untuk sisa periode keanggotaan</Li>
              <Li>Permintaan refund harus diajukan ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> dalam waktu 7 hari setelah kejadian yang menjadi dasar permintaan</Li>
            </ul>
          </Sub>

          <Sub title="Perpanjangan Keanggotaan">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Keanggotaan <strong>tidak diperpanjang secara otomatis</strong></Li>
              <Li>Anda perlu melakukan proses pembayaran baru untuk setiap periode keanggotaan</Li>
              <Li>Jika keanggotaan kedaluwarsa, akses ke konten eksklusif akan dicabut secara otomatis</Li>
              <Li>Admin dapat memperpanjang keanggotaan yang masih aktif — hari tambahan dihitung dari tanggal kedaluwarsa saat ini, bukan dari hari ini</Li>
            </ul>
          </Sub>

          <Sub title="Perubahan Harga dan Manfaat">
            <P>Kami berhak mengubah harga atau manfaat keanggotaan sewaktu-waktu. Perubahan harga akan berlaku untuk perpanjangan berikutnya, bukan untuk periode keanggotaan yang sedang berjalan.</P>
          </Sub>

          <Note>
            <strong>Catatan:</strong> Membership memberikan akses ke konten eksklusif yang ada saat ini. Kami tidak menjamin ketersediaan konten tertentu selama periode keanggotaan Anda, karena konten dapat dihapus oleh pengunggah atau admin.
          </Note>
        </Section>

        <Section id="tos-10" title="10. Perilaku Pengguna dan Etika Komunitas">
          <P>Selain larangan konten yang sudah disebutkan, kami mengharapkan semua pengguna menjaga perilaku yang baik di komunitas:</P>

          <Sub title="Yang Kami Harapkan dari Pengguna">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Berinteraksi dengan sesama pengguna dengan sopan dan saling menghormati</Li>
              <Li>Memberikan komentar yang konstruktif dan relevan</Li>
              <Li>Melaporkan konten yang melanggar aturan melalui email admin</Li>
              <Li>Memberikan kredit yang sesuai kepada fotografer atau cosplayer lain dalam deskripsi post jika memungkinkan</Li>
            </ul>
          </Sub>

          <Sub title="Perilaku yang Tidak Dapat Diterima">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Melecehkan, mengancam, atau mengintimidasi pengguna lain melalui komentar atau pesan</Li>
              <Li>Membuat komentar yang bersifat SARA, diskriminatif, atau merendahkan</Li>
              <Li>Melakukan <em>brigading</em> atau kampanye vote yang terkoordinasi untuk memanipulasi sistem</Li>
              <Li>Menggunakan platform untuk promosi diri yang berlebihan (<em>spam</em>) tanpa berkontribusi pada komunitas</Li>
              <Li>Mencoba mengakses atau memanipulasi akun pengguna lain</Li>
              <Li>Menggunakan otomatisasi (bot, skrip) untuk interaksi di platform tanpa izin tertulis dari kami</Li>
            </ul>
          </Sub>

          <Sub title="Kebijakan Komentar">
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Komentar adalah fitur publik yang dapat dilihat oleh semua pengguna yang memiliki akses ke post tersebut</Li>
              <Li>Anda bertanggung jawab penuh atas konten komentar yang Anda tulis</Li>
              <Li>Admin berhak menghapus komentar yang melanggar ketentuan ini tanpa pemberitahuan</Li>
              <Li>Penyalahgunaan fitur komentar berulang kali dapat mengakibatkan penangguhan akun</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="tos-11" title="11. Moderasi, Penangguhan, dan Penghapusan Akun">
          <Sub title="Hak Moderasi Kami">
            <P>Kami berhak, namun tidak berkewajiban, untuk memantau konten dan aktivitas di platform. Kami dapat mengambil tindakan berikut tanpa pemberitahuan sebelumnya jika terjadi pelanggaran ToS:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Menghapus atau menyembunyikan konten yang melanggar</Li>
              <Li>Mengedit metadata post (judul, tag) untuk kepatuhan</Li>
              <Li>Menetapkan konten sebagai "Members Only" secara paksa</Li>
              <Li>Menangguhkan akun sementara sambil menyelidiki dugaan pelanggaran</Li>
              <Li>Menonaktifkan akun secara permanen</Li>
              <Li>Melaporkan pengguna kepada pihak berwajib untuk pelanggaran hukum</Li>
            </ul>
          </Sub>

          <Sub title="Tingkatan Sanksi">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 10 }}>
                <thead>
                  <tr style={{ background: "var(--bg-3)" }}>
                    {["Tingkat Pelanggaran", "Contoh", "Sanksi Umum"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", border: "1px solid var(--border)", color: "var(--text)", fontWeight: "bold" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Ringan", "Tag yang tidak relevan, komentar tidak sopan pertama kali", "Peringatan, penghapusan konten/komentar"],
                    ["Sedang", "Spam, konten tanpa izin pengunggah lain, komentar melecehkan berulang", "Penangguhan akun sementara (1-30 hari)"],
                    ["Berat", "Konten kebencian, doxxing, konten tanpa izin subjek foto", "Penonaktifan akun permanen"],
                    ["Sangat Berat / Pidana", "CSAM, kekerasan nyata, pelanggaran hukum lainnya", "Penonaktifan permanen + pelaporan ke Polri"],
                  ].map(([level, example, sanction], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-3)" }}>
                      <td style={{ padding: "8px 10px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{level}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{example}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid var(--border)", color: "var(--text-2)" }}>{sanction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>Penentuan tingkat pelanggaran dan sanksi sepenuhnya merupakan kebijaksanaan admin. Tabel di atas adalah panduan umum, bukan jaminan prosedur tertentu.</P>
          </Sub>

          <Sub title="Proses Banding">
            <P>Jika Anda merasa akun atau konten Anda dihapus/ditangguhkan secara tidak adil, Anda dapat mengajukan banding melalui email ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> dengan subjek "Banding Moderasi" dalam waktu 14 hari sejak sanksi diberlakukan. Kami akan meninjau banding dalam 7 hari kerja. Keputusan banding bersifat final.</P>
          </Sub>

          <Sub title="Penghapusan Akun oleh Pengguna">
            <P>Anda dapat meminta penghapusan akun kapan saja dengan menghubungi <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a>. Penghapusan akun akan:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Menghapus semua data akun Anda dalam 30 hari</Li>
              <Li>Menghapus semua post, foto, komentar, dan vote yang Anda buat</Li>
              <Li>Membatalkan keanggotaan aktif tanpa refund untuk sisa periode</Li>
              <Li>Tidak dapat dibatalkan setelah diproses</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="tos-12" title="12. Tanggung Jawab dan Batasan Kewajiban">
          <Sub title="Platform Disediakan 'Sebagaimana Adanya'">
            <P>PustakaFoto disediakan dalam kondisi "<em>as is</em>" dan "<em>as available</em>" tanpa jaminan apapun, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Jaminan ketersediaan layanan 24/7 tanpa gangguan</Li>
              <Li>Jaminan bebas dari bug, error, atau kerentanan keamanan</Li>
              <Li>Jaminan bahwa semua konten di platform telah diverifikasi akurasinya</Li>
            </ul>
          </Sub>

          <Sub title="Batasan Tanggung Jawab Kami">
            <P>Sejauh diizinkan oleh hukum yang berlaku di Indonesia, kami tidak bertanggung jawab atas:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Konten yang diunggah oleh pengguna — tanggung jawab sepenuhnya berada pada pengunggah</Li>
              <Li>Kerugian langsung atau tidak langsung akibat penggunaan atau ketidakmampuan menggunakan platform</Li>
              <Li>Kehilangan data akibat kegagalan teknis, serangan siber, atau keadaan di luar kendali kami</Li>
              <Li>Tindakan atau konten pengguna lain yang mungkin merugikan Anda</Li>
              <Li>Gangguan layanan akibat pemeliharaan, peningkatan sistem, atau keadaan kahar (<em>force majeure</em>)</Li>
              <Li>Kerugian akibat penangguhan atau penghapusan akun yang dilakukan sesuai ToS ini</Li>
            </ul>
          </Sub>

          <Sub title="Tanggung Jawab Pengguna">
            <P>Anda sepenuhnya bertanggung jawab atas:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Semua konten yang Anda unggah dan konsekuensi hukumnya</Li>
              <Li>Semua komentar dan interaksi yang Anda lakukan di platform</Li>
              <Li>Memastikan bahwa konten yang Anda unggah tidak melanggar hak pihak ketiga</Li>
              <Li>Keamanan akun Google yang Anda gunakan untuk login</Li>
            </ul>
          </Sub>

          <Sub title="Keadaan Kahar (Force Majeure)">
            <P>Kami tidak bertanggung jawab atas keterlambatan atau kegagalan dalam menjalankan kewajiban kami akibat keadaan di luar kendali yang wajar, termasuk namun tidak terbatas pada bencana alam, pemadaman listrik massal, serangan siber berskala besar, gangguan infrastruktur internet, atau tindakan pemerintah.</P>
          </Sub>
        </Section>

        <Section id="tos-13" title="13. Ganti Rugi (Indemnification)">
          <P>Anda setuju untuk membebaskan, membela, dan mengganti rugi PustakaFoto, pengelola, dan afiliasinya dari segala klaim, kerugian, kerusakan, kewajiban, biaya (termasuk biaya hukum yang wajar) yang timbul dari atau berkaitan dengan:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Penggunaan platform oleh Anda yang melanggar ToS ini</Li>
            <Li>Konten yang Anda unggah atau bagikan di platform</Li>
            <Li>Pelanggaran hak pihak ketiga (termasuk hak cipta, privasi, atau hak kepribadian) yang dilakukan oleh Anda</Li>
            <Li>Pelanggaran hukum yang berlaku yang dilakukan oleh Anda melalui platform ini</Li>
          </ul>
        </Section>

        <Section id="tos-14" title="14. Hukum yang Berlaku dan Penyelesaian Sengketa">
          <Sub title="Hukum yang Berlaku">
            <P>ToS ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Peraturan perundang-undangan utama yang relevan meliputi:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>UU No. 11 Tahun 2008 jo. UU No. 19 Tahun 2016 tentang ITE</Li>
              <Li>UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi</Li>
              <Li>UU No. 28 Tahun 2014 tentang Hak Cipta</Li>
              <Li>UU No. 17 Tahun 2016 tentang Perlindungan Anak</Li>
              <Li>PP No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik</Li>
              <Li>KUH Perdata Indonesia untuk ketentuan perjanjian</Li>
            </ul>
          </Sub>

          <Sub title="Penyelesaian Sengketa">
            <P>Jika terjadi sengketa antara Anda dan kami terkait platform ini, prosedur berikut akan ditempuh secara berurutan:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li><strong>Negosiasi langsung:</strong> Kirim email ke <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a> — kami berkomitmen untuk merespons dalam 14 hari kerja dan berusaha menyelesaikan sengketa secara kekeluargaan</Li>
              <Li><strong>Mediasi:</strong> Jika negosiasi tidak berhasil, para pihak dapat menyepakati mediasi melalui lembaga mediasi yang diakui</Li>
              <Li><strong>Pengadilan:</strong> Jika mediasi tidak menghasilkan penyelesaian, sengketa akan diselesaikan melalui Pengadilan Negeri yang berwenang di Indonesia</Li>
            </ul>
          </Sub>
        </Section>

        <Section id="tos-15" title="15. Ketersediaan Layanan dan Perubahan Platform">
          <Sub title="Ketersediaan Layanan">
            <P>Kami berupaya menjaga platform tetap tersedia, namun tidak dapat menjamin ketersediaan 100%. Gangguan layanan dapat terjadi karena:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Pemeliharaan rutin atau darurat</Li>
              <Li>Peningkatan sistem</Li>
              <Li>Gangguan dari penyedia layanan infrastruktur (Vercel, Supabase, Cloudflare)</Li>
              <Li>Keadaan kahar</Li>
            </ul>
            <P>Kami akan berusaha memberikan pemberitahuan sebelumnya untuk pemeliharaan yang direncanakan, namun tidak selalu memungkinkan untuk pemeliharaan darurat.</P>
          </Sub>

          <Sub title="Perubahan atau Penghentian Platform">
            <P>Kami berhak untuk:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <Li>Mengubah, menambah, atau menghapus fitur platform kapan saja</Li>
              <Li>Mengubah harga atau model bisnis dengan pemberitahuan yang wajar</Li>
              <Li>Menghentikan layanan platform secara permanen dengan pemberitahuan minimal 30 hari kepada pengguna aktif</Li>
            </ul>
            <P>Jika platform dihentikan secara permanen, kami akan memberikan kesempatan kepada pengguna untuk mengunduh konten mereka sebelum penghentian layanan, sejauh memungkinkan secara teknis.</P>
          </Sub>
        </Section>

        <Section id="tos-16" title="16. Perubahan Syarat dan Ketentuan">
          <P>Kami dapat memperbarui ToS ini kapan saja. Pemberitahuan perubahan:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Perubahan minor</strong> (klarifikasi, perbaikan redaksi): Berlaku efektif segera setelah diterbitkan dengan pembaruan tanggal di bagian atas dokumen</Li>
            <Li><strong>Perubahan material</strong> (perubahan hak/kewajiban signifikan): Pemberitahuan di platform minimal 7 hari sebelum berlaku efektif</Li>
            <Li><strong>Perubahan harga membership</strong>: Pemberitahuan minimal 14 hari sebelum berlaku</Li>
          </ul>
          <P>Penggunaan platform setelah perubahan berlaku merupakan penerimaan Anda terhadap ToS yang diperbarui. Jika Anda tidak menyetujui perubahan, Anda dapat menghapus akun sebelum perubahan berlaku efektif.</P>
          <P>Kami menyarankan Anda untuk memeriksa halaman ini secara berkala untuk memastikan Anda selalu mengetahui ketentuan terbaru.</P>
        </Section>

        <Section id="tos-17" title="17. Ketentuan Lain-lain">
          <Sub title="Keterpisahan (Severability)">
            <P>Jika salah satu ketentuan dalam ToS ini dinyatakan tidak sah atau tidak dapat dilaksanakan oleh pengadilan yang berwenang, ketentuan tersebut akan dimodifikasi seminimal mungkin untuk membuatnya sah, atau dihapus jika tidak dapat dimodifikasi. Ketentuan lainnya tetap berlaku sepenuhnya.</P>
          </Sub>

          <Sub title="Tidak Ada Pengabaian (No Waiver)">
            <P>Kegagalan atau keterlambatan kami dalam menegakkan ketentuan ToS ini tidak berarti kami melepaskan hak untuk menegakkan ketentuan tersebut di kemudian hari.</P>
          </Sub>

          <Sub title="Seluruh Perjanjian (Entire Agreement)">
            <P>ToS ini, bersama dengan Kebijakan Privasi kami, merupakan seluruh perjanjian antara Anda dan kami terkait penggunaan platform, dan menggantikan semua perjanjian sebelumnya terkait hal yang sama.</P>
          </Sub>

          <Sub title="Bahasa">
            <P>ToS ini ditulis dalam Bahasa Indonesia. Jika ada terjemahan dalam bahasa lain, versi Bahasa Indonesia yang akan berlaku dalam hal terjadi perbedaan interpretasi.</P>
          </Sub>

          <Sub title="Tautan ke Situs Lain">
            <P>Platform mungkin mengandung tautan ke situs web pihak ketiga. Kami tidak bertanggung jawab atas konten, kebijakan privasi, atau praktik situs pihak ketiga tersebut. Penggunaan situs pihak ketiga sepenuhnya atas risiko Anda sendiri.</P>
          </Sub>
        </Section>

        <Section id="tos-18" title="18. Cara Menghubungi Kami">
          <P>Untuk pertanyaan, laporan pelanggaran, permintaan penghapusan konten, atau hal lain terkait ToS ini:</P>
          <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3, padding: "14px 16px", fontSize: 13, lineHeight: 2.1, marginBottom: 14 }}>
            <div><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a></div>
            <div><strong>Website:</strong> <a href={BASE} style={{ color: "var(--accent)" }}>{BASE}</a></div>
            <div><strong>Waktu Respons:</strong> Maksimal 14 hari kerja (umum) · 1×24 jam (darurat: CSAM, keamanan)</div>
          </div>
          <P>Untuk pelaporan konten ilegal yang darurat (terutama CSAM), jangan hanya mengandalkan email kami — Anda juga dapat melaporkan langsung kepada:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Polri:</strong> <a href="https://patrolisiber.id" style={{ color: "var(--accent)" }} target="_blank">patrolisiber.id</a> atau 110</Li>
            <Li><strong>Kominfo:</strong> <a href="https://aduankonten.id" style={{ color: "var(--accent)" }} target="_blank">aduankonten.id</a></Li>
            <Li><strong>KPAI (Anak):</strong> <a href="https://www.kpai.go.id" style={{ color: "var(--accent)" }} target="_blank">kpai.go.id</a></Li>
          </ul>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, fontSize: 12, color: "var(--text-3)", lineHeight: 1.7 }}>
          <p style={{ marginBottom: 6 }}>Dokumen ini merupakan perjanjian yang mengikat secara hukum antara pengguna dan pengelola PustakaFoto, diatur berdasarkan hukum Republik Indonesia.</p>
          <p style={{ marginBottom: 0 }}>Dengan terus menggunakan PustakaFoto setelah tanggal berlaku dokumen ini, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan di atas. Dokumen ini bukan merupakan nasihat hukum profesional.</p>
        </div>

      </div>
    </AppShell>
  );
}