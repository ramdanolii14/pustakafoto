import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://pustakafoto.nyanpixel.my.id";
const LAST_UPDATED = "26 Juni 2026";
const CONTACT_EMAIL = "developer@nyanpixel.my.id"; // ganti dengan email kamu

export const metadata: Metadata = {
  title: "Privacy Policy — PustakaFoto",
  description: "Kebijakan Privasi PustakaFoto — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi kamu.",
  alternates: { canonical: `${BASE}/privacy-policy` },
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

export default function PrivacyPolicyPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "var(--text)", marginBottom: 8 }}>
            Kebijakan Privasi
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Terakhir diperbarui: {LAST_UPDATED}
          </p>
        </div>

        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 3, padding: "16px 18px", marginBottom: 28, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
          Kebijakan Privasi ini menjelaskan bagaimana PustakaFoto (<strong style={{ color: "var(--text)" }}>"kami"</strong>, <strong style={{ color: "var(--text)" }}>"situs"</strong>) mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami di <strong style={{ color: "var(--accent)" }}>pustakafoto.nyanpixel.my.id</strong>. Dengan menggunakan situs ini, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
        </div>

        <Section title="1. Informasi yang Kami Kumpulkan">
          <P>Kami mengumpulkan informasi berikut ketika Anda menggunakan PustakaFoto:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Informasi Akun Google:</strong> Saat login via Google OAuth, kami menerima nama, alamat email, dan foto profil dari akun Google Anda.</Li>
            <Li><strong>Konten yang Diunggah:</strong> Foto, judul, deskripsi, dan metadata lain yang Anda upload ke platform.</Li>
            <Li><strong>Interaksi:</strong> Vote, komentar, dan aktivitas lain yang Anda lakukan di platform.</Li>
            <Li><strong>Data Membership:</strong> Informasi terkait langganan keanggotaan berbayar seperti batas waktu.</Li>
            <Li><strong>Data Teknis:</strong> Alamat IP, jenis browser, dan data log server untuk keperluan keamanan dan pemecahan masalah.</Li>
          </ul>
          <P>Kami <strong>tidak</strong> mengumpulkan nomor kartu kredit, kata sandi, atau informasi keuangan sensitif secara langsung.</P>
        </Section>

        <Section title="2. Cara Kami Menggunakan Informasi">
          <P>Informasi yang dikumpulkan digunakan untuk:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Menyediakan dan mengelola layanan PustakaFoto</Li>
            <Li>Mengautentikasi identitas pengguna</Li>
            <Li>Mengelola keanggotaan dan akses konten</Li>
            <Li>Menanggapi pertanyaan dan permintaan dukungan</Li>
            <Li>Mencegah penyalahgunaan, penipuan, dan pelanggaran ketentuan layanan</Li>
            <Li>Mematuhi kewajiban hukum yang berlaku di Indonesia</Li>
          </ul>
          <P>Kami <strong>tidak</strong> menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.</P>
        </Section>

        <Section title="3. Penyimpanan dan Keamanan Data">
          <P>Data Anda disimpan menggunakan layanan infrastruktur terpercaya:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Database:</strong> Supabase (PostgreSQL) dengan enkripsi data at-rest dan in-transit</Li>
            <Li><strong>Penyimpanan File:</strong> Cloudflare R2 dengan enkripsi SSL/TLS</Li>
            <Li><strong>Autentikasi:</strong> Better Auth dengan session token terenkripsi</Li>
          </ul>
          <P>Kami menerapkan langkah-langkah keamanan teknis yang wajar untuk melindungi data Anda. Namun, tidak ada sistem yang 100% aman — harap gunakan platform ini dengan bijak.</P>
        </Section>

        <Section title="4. Berbagi Data dengan Pihak Ketiga">
          <P>Kami hanya berbagi data dengan pihak ketiga dalam kondisi berikut:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Penyedia Layanan:</strong> Supabase, Cloudflare, Vercel, dan Google sebagai penyedia infrastruktur teknis. Mereka tunduk pada kebijakan privasi masing-masing.</Li>
            <Li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum, perintah pengadilan, atau otoritas pemerintah Indonesia yang berwenang.</Li>
            <Li><strong>Perlindungan Hak:</strong> Untuk melindungi hak, properti, atau keselamatan PustakaFoto, pengguna, atau publik.</Li>
          </ul>
        </Section>

        <Section title="5. Konten Dewasa (18+)">
          <P>PustakaFoto menyediakan konten yang ditandai sebagai konten dewasa (18+). Dengan mengakses konten tersebut:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Anda menyatakan bahwa Anda berusia 18 tahun atau lebih</Li>
            <Li>Anda memahami bahwa konten tersebut bersifat dewasa dan hanya untuk pengguna yang telah login</Li>
            <Li>Kami tidak bertanggung jawab atas akses yang dilakukan oleh pihak yang memberikan pernyataan usia yang tidak benar</Li>
          </ul>
          <P>Kami mematuhi ketentuan Undang-Undang ITE Pasal 27 ayat (1) terkait konten asusila dengan membatasi akses hanya kepada pengguna terverifikasi dan terdaftar.</P>
        </Section>

        <Section title="6. Hak Anda atas Data Pribadi">
          <P>Sesuai Undang-Undang Perlindungan Data Pribadi (UU No. 27 Tahun 2022), Anda memiliki hak:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li><strong>Hak Akses:</strong> Mengetahui data pribadi apa yang kami simpan tentang Anda</Li>
            <Li><strong>Hak Koreksi:</strong> Meminta koreksi data yang tidak akurat</Li>
            <Li><strong>Hak Penghapusan:</strong> Meminta penghapusan akun dan data terkait</Li>
            <Li><strong>Hak Portabilitas:</strong> Mendapatkan salinan data Anda dalam format yang dapat dibaca mesin</Li>
            <Li><strong>Hak Keberatan:</strong> Mengajukan keberatan atas pemrosesan data tertentu</Li>
          </ul>
          <P>Untuk menggunakan hak-hak di atas, hubungi kami di <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a>. Kami akan merespons dalam 14 hari kerja.</P>
        </Section>

        <Section title="7. Cookie dan Teknologi Pelacakan">
          <P>Kami menggunakan cookie sesi (<em>session cookies</em>) yang diperlukan untuk fungsi autentikasi. Cookie ini:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Tidak digunakan untuk pelacakan iklan atau analitik pihak ketiga</Li>
            <Li>Dihapus otomatis saat sesi berakhir atau Anda logout</Li>
            <Li>Diperlukan agar fitur login berfungsi</Li>
          </ul>
        </Section>

        <Section title="8. Retensi Data">
          <P>Kami menyimpan data Anda selama akun Anda aktif. Jika Anda menghapus akun atau meminta penghapusan data:</P>
          <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
            <Li>Data akun dihapus dalam 30 hari</Li>
            <Li>Konten yang diunggah dihapus dari server kami</Li>
            <Li>Beberapa data mungkin disimpan lebih lama jika diperlukan untuk kepatuhan hukum</Li>
          </ul>
        </Section>

        <Section title="9. Anak di Bawah Umur">
          <P>PustakaFoto <strong>tidak ditujukan untuk pengguna di bawah 18 tahun</strong>. Kami tidak secara sengaja mengumpulkan data dari anak-anak. Jika Anda mengetahui bahwa anak di bawah umur telah mendaftar, mohon hubungi kami segera untuk penghapusan akun.</P>
        </Section>

        <Section title="10. Transfer Data Internasional">
          <P>Data Anda mungkin disimpan dan diproses di server yang berlokasi di luar Indonesia (termasuk Amerika Serikat dan negara lain di mana mitra infrastruktur kami beroperasi). Kami memastikan transfer data tersebut dilakukan dengan perlindungan yang memadai sesuai standar internasional.</P>
        </Section>

        <Section title="11. Perubahan Kebijakan">
          <P>Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan material akan diberitahukan melalui pemberitahuan di situs. Penggunaan situs setelah perubahan berlaku dianggap sebagai persetujuan Anda terhadap kebijakan yang diperbarui.</P>
        </Section>

        <Section title="12. Kontak">
          <P>Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait privasi, hubungi kami:</P>
          <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 3, padding: "12px 14px", fontSize: 13 }}>
            <div><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a></div>
            <div><strong>Website:</strong> <a href={BASE} style={{ color: "var(--accent)" }}>{BASE}</a></div>
          </div>
        </Section>

      </div>
    </AppShell>
  );
}