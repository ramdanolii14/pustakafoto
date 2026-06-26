import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";
const LAST_UPDATED = "26 Juni 2026";
const CONTACT_EMAIL = "admin@nyanpixel.my.id"; // ganti dengan email kamu

export const metadata: Metadata = {
  title: "Terms of Service — PustakaFoto",
  description: "Syarat dan Ketentuan Penggunaan PustakaFoto — aturan yang mengatur penggunaan platform galeri foto cosplay kami.",
  alternates: { canonical: `${BASE}/terms-of-service` },
  robots: { index: true, follow: true },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{
      fontSize: 17, fontWeight: "bold", color: "var(--text)",
      marginBottom: 12, paddingBottom: 8,
      borderBottom: "1px solid var(--border)",
    }}>
      {title}
    </h2>
    <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
      {children}
    </div>
  </section>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ marginBottom: 10 }}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: 6, paddingLeft: 4 }}>{children}</li>
);

export default function TermsOfServicePage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "var(--text)", marginBottom: 8 }}>
            Syarat dan Ketentuan
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Terakhir diperbarui: {LAST_UPDATED}
          </p>
        </div>

        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px", marginBottom: 28, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
          Selamat datang di PustakaFoto. Dengan mengakses atau menggunakan platform ini, Anda menyetujui Syarat dan Ketentuan ini. Harap baca dengan seksama sebelum menggunakan layanan kami. Jika Anda tidak menyetujui ketentuan ini, harap tidak menggunakan platform ini.
        </div>

        <Section title="1. Tentang Platform">
          <P>PustakaFoto (<strong style={{ color: "var(--text)" }}>"Platform"</strong>) adalah galeri foto cosplay komunitas berbasis web yang tersedia di <a href={BASE} style={{ color: "var(--accent)" }}>{BASE}</a>. Platform ini memungkinkan pengguna untuk mengunggah, berbagi, dan menikmati foto-foto cosplay.</P>
          <P>Platform ini dioperasikan secara independen dan bukan merupakan entitas bisnis yang terdaftar secara resmi. Layanan ini disediakan "sebagaimana adanya" (<em>as is</em>).</P>
        </Section>

        <Section title="2. Kelayakan Pengguna">
          <P>Untuk menggunakan PustakaFoto, Anda harus:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Berusia minimal <strong>13 tahun</strong> untuk membuat akun</Li>
            <Li>Berusia minimal <strong>18 tahun</strong> untuk mengakses konten yang ditandai sebagai konten dewasa (18+)</Li>
            <Li>Memiliki akun Google yang valid untuk autentikasi</Li>
            <Li>Tidak pernah dilarang menggunakan Platform sebelumnya oleh kami</Li>
          </ul>
          <P>Dengan mendaftar, Anda menyatakan bahwa informasi yang Anda berikan adalah benar dan akurat.</P>
        </Section>

        <Section title="3. Akun Pengguna">
          <P>Akun Anda adalah tanggung jawab Anda. Anda wajib:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Menjaga keamanan akun Google yang digunakan untuk login</Li>
            <Li>Segera memberitahu kami jika terjadi akses tidak sah ke akun Anda</Li>
            <Li>Tidak berbagi akses akun dengan pihak lain</Li>
          </ul>
          <P>Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.</P>
        </Section>

        <Section title="4. Konten yang Diizinkan">
          <P>Platform ini adalah galeri foto cosplay. Konten yang diizinkan meliputi:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Foto cosplay karakter anime, game, film, atau karakter orisinal</Li>
            <Li>Foto yang Anda miliki hak untuk mengunggahnya</Li>
            <Li>Konten dewasa (18+) yang hanya dapat diunggah oleh pengguna terdaftar dan diakses oleh pengguna yang menyatakan berusia 18 tahun atau lebih</Li>
          </ul>
        </Section>

        <Section title="5. Konten yang Dilarang">
          <P>Pengguna <strong>dilarang keras</strong> mengunggah atau membagikan konten berikut:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Konten Anak Ilegal (CSAM):</strong> Setiap konten seksual yang melibatkan individu di bawah 18 tahun. Pelanggaran ini akan dilaporkan kepada pihak berwajib sesuai hukum yang berlaku.</Li>
            <Li><strong>Konten Tanpa Izin:</strong> Foto orang lain yang diunggah tanpa izin eksplisit dari orang yang bersangkutan</Li>
            <Li><strong>Konten Kekerasan:</strong> Foto yang menampilkan kekerasan nyata, penyiksaan, atau konten yang dapat membahayakan</Li>
            <Li><strong>Konten Kebencian:</strong> Materi yang mempromosikan diskriminasi berdasarkan ras, agama, jenis kelamin, orientasi seksual, atau karakteristik lainnya</Li>
            <Li><strong>Spam dan Penipuan:</strong> Konten yang menyesatkan, penipuan, atau tidak relevan dengan tema cosplay</Li>
            <Li><strong>Malware:</strong> File yang mengandung virus atau kode berbahaya</Li>
            <Li><strong>Pelanggaran Privasi:</strong> Konten yang mengekspos informasi pribadi orang lain tanpa izin (<em>doxxing</em>)</Li>
          </ul>
          <P>Pelanggaran terhadap ketentuan ini dapat mengakibatkan penghapusan konten, penangguhan akun, dan/atau pelaporan kepada pihak berwajib.</P>
        </Section>

        <Section title="6. Hak Kekayaan Intelektual">
          <P><strong>Konten Anda:</strong> Anda tetap memiliki hak atas foto yang Anda unggah. Dengan mengunggah konten ke Platform, Anda memberikan kami lisensi non-eksklusif, bebas royalti, dan dapat disublisensikan untuk menampilkan, mendistribusikan, dan mempromosikan konten Anda dalam konteks layanan Platform.</P>
          <P><strong>Konten Karakter:</strong> Karakter cosplay yang difoto mungkin merupakan kekayaan intelektual pihak ketiga (seperti perusahaan anime atau game). Tanggung jawab atas penggunaan karakter tersebut ada pada pengguna yang mengunggah. Platform berfungsi sebagai galeri komunitas non-komersial.</P>
          <P><strong>Platform:</strong> Semua elemen desain, kode, dan branding PustakaFoto adalah milik kami dan tidak boleh disalin atau digunakan tanpa izin.</P>
        </Section>

        <Section title="7. Keanggotaan Berbayar (Membership)">
          <P>PustakaFoto menawarkan keanggotaan berbayar dengan biaya <strong>Rp 14.999 per bulan</strong> yang memberikan akses ke konten eksklusif.</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Pembayaran:</strong> Dilakukan secara manual via transfer bank dan dikonfirmasi melalui WhatsApp</Li>
            <Li><strong>Durasi:</strong> Keanggotaan berlaku selama 30 hari sejak aktivasi</Li>
            <Li><strong>Perpanjangan:</strong> Keanggotaan tidak diperpanjang otomatis harus dikonfirmasi ulang setiap periode</Li>
            <Li><strong>Refund:</strong> Pembayaran yang telah dikonfirmasi bersifat <strong>tidak dapat dikembalikan</strong> (<em>non-refundable</em>), kecuali terjadi kesalahan teknis dari pihak kami yang terbukti</Li>
            <Li><strong>Pembatalan:</strong> Kami berhak membatalkan keanggotaan tanpa pengembalian dana jika pengguna melanggar ketentuan ini</Li>
          </ul>
        </Section>

        <Section title="8. Moderasi Konten">
          <P>Kami berhak, namun tidak berkewajiban, untuk memantau dan memoderasi konten di Platform. Kami dapat:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Menghapus konten yang melanggar ketentuan ini tanpa pemberitahuan</Li>
            <Li>Menangguhkan atau menghapus akun yang melanggar</Li>
            <Li>Membatasi fitur tertentu untuk pengguna tertentu</Li>
            <Li>Menetapkan konten sebagai "Members Only" jika dianggap perlu</Li>
          </ul>
          <P>Keputusan moderasi bersifat final dan tidak dapat digugat.</P>
        </Section>

        <Section title="9. Batasan Tanggung Jawab">
          <P>Sejauh diizinkan oleh hukum yang berlaku:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Platform disediakan <em>"sebagaimana adanya"</em> tanpa jaminan ketersediaan 24/7</Li>
            <Li>Kami tidak bertanggung jawab atas konten yang diunggah oleh pengguna</Li>
            <Li>Kami tidak bertanggung jawab atas kerugian langsung atau tidak langsung akibat penggunaan Platform</Li>
            <Li>Kami tidak bertanggung jawab atas kehilangan data akibat gangguan teknis di luar kendali kami</Li>
          </ul>
        </Section>

        <Section title="10. Pelanggaran dan Pelaporan">
          <P>Jika Anda menemukan konten yang melanggar ketentuan ini atau hukum yang berlaku, harap laporkan kepada kami melalui:</P>
          <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3, padding: "12px 14px", fontSize: 13, marginBottom: 10 }}>
            <div><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a></div>
          </div>
          <P>Kami berkomitmen untuk menangani laporan pelanggaran dalam waktu 1×24 jam untuk konten yang bersifat darurat (seperti CSAM) dan 7 hari kerja untuk pelanggaran umum.</P>
        </Section>

        <Section title="11. Hukum yang Berlaku">
          <P>Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia, termasuk namun tidak terbatas pada:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Undang-Undang No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) sebagaimana telah diubah</Li>
            <Li>Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)</Li>
            <Li>Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta</Li>
            <Li>Peraturan Pemerintah No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik</Li>
          </ul>
          <P>Setiap sengketa yang timbul akan diselesaikan melalui musyawarah mufakat. Jika tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Pengadilan Negeri yang berwenang di Indonesia.</P>
        </Section>

        <Section title="12. Perubahan Ketentuan">
          <P>Kami dapat mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku efektif setelah diterbitkan di Platform. Penggunaan Platform setelah perubahan diterbitkan merupakan persetujuan Anda terhadap ketentuan yang diperbarui.</P>
        </Section>

        <Section title="13. Kontak">
          <P>Untuk pertanyaan terkait Syarat dan Ketentuan ini:</P>
          <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3, padding: "12px 14px", fontSize: 13 }}>
            <div><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a></div>
            <div><strong>Website:</strong> <a href={BASE} style={{ color: "var(--accent)" }}>{BASE}</a></div>
          </div>
        </Section>

      </div>
    </AppShell>
  );
}