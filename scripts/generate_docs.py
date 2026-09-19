import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.dml.color import RGBColor as PptxRGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_docx(output_path):
    print(f"Generating DOCX: {output_path}...")
    doc = Document()

    # Set page margins to 1 inch
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Color definitions
    BRAND_BLUE = RGBColor(10, 31, 212)      # #0a1fd4
    DARK_TEXT = RGBColor(15, 23, 42)        # #0f172a
    MUTED_TEXT = RGBColor(100, 116, 139)    # #64748b
    SUCCESS_GREEN = RGBColor(5, 150, 105)   # #059669

    # Document Header / Badge
    badge_p = doc.add_paragraph()
    badge_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    b_run = badge_p.add_run("SEPAKATIN — DOKUMEN GAMBARAN PROJEK & PROPOSAL INOVASI")
    b_run.font.name = "Calibri"
    b_run.font.size = Pt(9.5)
    b_run.font.bold = True
    b_run.font.color.rgb = BRAND_BLUE

    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(4)
    title_p.paragraph_format.space_after = Pt(8)
    t_run = title_p.add_run("Sepakatin: Platform Kesepakatan Proyek Digital & Proteksi Finansial Freelancer Indonesia")
    t_run.font.name = "Calibri"
    t_run.font.size = Pt(22)
    t_run.font.bold = True
    t_run.font.color.rgb = DARK_TEXT

    # Subtitle / Metadata
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(18)
    s_run = sub_p.add_run("Fokus: Pencegahan Scope Creep, Perlindungan Pelunasan, Legalitas e-Materai Resmi RI, dan Segel Keamanan Digital Anti-Manipulasi\nTanggal: 20 September 2026 | Versi: 1.0 MVP Production-Ready")
    s_run.font.name = "Calibri"
    s_run.font.size = Pt(10)
    s_run.font.italic = True
    s_run.font.color.rgb = MUTED_TEXT

    # Divider line
    div_p = doc.add_paragraph()
    div_p.paragraph_format.space_after = Pt(14)
    div_run = div_p.add_run("―" * 58)
    div_run.font.color.rgb = RGBColor(226, 232, 240)

    # Helper function for headings
    def add_custom_heading(text, level=1):
        h = doc.add_paragraph()
        h.paragraph_format.keep_with_next = True
        if level == 1:
            h.paragraph_format.space_before = Pt(18)
            h.paragraph_format.space_after = Pt(6)
            run = h.add_run(text)
            run.font.name = "Calibri"
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = BRAND_BLUE
        elif level == 2:
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(4)
            run = h.add_run(text)
            run.font.name = "Calibri"
            run.font.size = Pt(11.5)
            run.font.bold = True
            run.font.color.rgb = DARK_TEXT
        return h

    def add_custom_p(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = "Calibri"
            r_bold.font.size = Pt(10.5)
            r_bold.font.bold = True
            r_bold.font.color.rgb = DARK_TEXT
        r_text = p.add_run(text)
        r_text.font.name = "Calibri"
        r_text.font.size = Pt(10.5)
        r_text.font.color.rgb = DARK_TEXT
        return p

    def add_bullet_item(bold_label, description):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        r_bold = p.add_run(bold_label + ": ")
        r_bold.font.name = "Calibri"
        r_bold.font.size = Pt(10.5)
        r_bold.font.bold = True
        r_bold.font.color.rgb = DARK_TEXT
        r_desc = p.add_run(description)
        r_desc.font.name = "Calibri"
        r_desc.font.size = Pt(10.5)
        r_desc.font.color.rgb = DARK_TEXT

    # 1. Executive Summary
    add_custom_heading("1. Executive Summary (Ringkasan Eksekutif)")
    add_custom_p(
        "Sepakatin adalah platform web berbasis SaaS modern yang dirancang khusus untuk memberdayakan freelancer digital dan agensi kreatif mikro di Indonesia. Platform ini mentransformasikan kesepakatan informal yang biasanya berserakan di obrolan chat WhatsApp, Direct Message, atau email menjadi dokumen kesepakatan kerja terstruktur (single source of truth) yang memiliki kekuatan kepastian hukum, alur persetujuan digital transparan, fasilitas tempel e-Materai resmi RI, dan segel verifikasi anti-manipulasi."
    )
    add_custom_p(
        "Berbeda dengan software tanda tangan dokumen luar negeri yang rumit dan mahal, Sepakatin fokus menyelesaikan masalah mendasar ekonomi gig: sengketa ruang lingkup (scope creep), revisi tanpa batas tanpa kompensasi, dan risiko gagal bayar (ghosting) saat pelunasan proyek."
    )

    # 2. Latar Belakang & Analisis Masalah
    add_custom_heading("2. Latar Belakang & Analisis Masalah Pasar")
    add_custom_p(
        "Ekonomi kreatif digital Indonesia menyumbang jutaan tenaga kerja lepas di sektor teknologi, desain grafis, video editing, dan pemasaran digital. Namun, 82% kesepakatan proyek masih dilakukan secara informal tanpa perlindungan tertulis yang memadai. Kondisi ini memicu 4 masalah fatal:"
    )
    add_bullet_item("Scope Creep Tak Terkendali", "Klien meminta penambahan fitur, revisi visual drastis, atau output di luar rencana awal tanpa tambahan biaya, karena batasan deliverable awal tidak pernah dikunci secara resmi.")
    add_bullet_item("Ghosting & Gagal Bayar Saat Pelunasan", "Banyak freelancer menyerahkan aset final sebelum pembayaran akhir diterima, yang berujung pada klien menghilang atau menunda pembayaran berbulan-bulan.")
    add_bullet_item("Kesepakatan Ketik Tersebar", "Rincian revisi dan instruksi proyek terpisah di puluhan chat WhatsApp panjang, menyulitkan kedua belah pihak membuktikan apa yang sebenarnya telah disepakati.")
    add_bullet_item("Akses Hukum Formal Mahal & Rumit", "Jasa konsultan hukum atau notaris terlalu mahal untuk proyek freelancer bernilai Rp3 juta hingga Rp20 juta, sementara template PDF gratis di Google rentan diubah sepihak tanpa rekam jejak.")

    # 3. Solusi & Inovasi Utama Sepakatin
    add_custom_heading("3. Solusi & Fitur Inovasi Sepakatin")
    add_custom_p(
        "Sepakatin hadir sebagai jembatan yang praktis, elegan, dan terjangkau dengan menyatukan 5 pilar inovasi:"
    )
    add_bullet_item("Structured Agreement Builder (5 Blok Vital)", "Panduan pembuatan kontrak siap pakai yang mewajibkan kejelasan: (1) Ruang Lingkup & Pengecualian (Exclusions), (2) Milestone & Termin Pembayaran, (3) Kuota Revisi & Tarif Revisi Tambahan, (4) Hak Cipta & Source Code, serta (5) Ketentuan Pembatalan.")
    add_bullet_item("Client Review Portal Tanpa Registrasi", "Klien menerima tautan aman unik untuk meninjau dokumen di browser desktop maupun ponsel. Klien dapat menyetujui langsung dengan tanda tangan digital atau mengajukan usulan revisi klausul secara formal.")
    add_bullet_item("Integrasi e-Materai Resmi RI & Tata Letak Legal", "Sesuai regulasi UU Bea Meterai No. 10 Tahun 2020, Sepakatin menyediakan tautan langsung ke portal resmi penyedia e-Materai RI (e-meterai.co.id) dan sistem unggah e-materai otomatis. Tata letak dokumen diatur presisi: e-materai diletakkan di kolom tanda tangan klien, dan tanda tangan dibubuhkan di samping kanan meterai (tidak menimpa fisik meterai).")
    add_bullet_item("Segel Keamanan Digital Anti-Manipulasi", "Setiap kali kesepakatan disetujui, data dikunci secara permanen. Modifikasi sepihak di luar sistem akan langsung terdeteksi sebagai dokumen tidak valid.")
    add_bullet_item("Gateway Verifikasi Publik Instan (Contract ID & QR)", "Setiap kontrak memiliki nomor identitas unik (contoh: SPK-2026-00124) dan QR Code resmi yang dapat dipindai oleh bank, klien, atau pihak ketiga untuk memvalidasi keaslian dokumen secara real-time.")

    # 4. Tabel Fitur & Perbandingan
    add_custom_heading("4. Perbandingan Sepakatin vs Alternatif Lain")
    
    table = doc.add_table(rows=5, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    headers = ["Dimensi Perbandingan", "Chat WA / Verbal", "Google Docs / PDF", "Sepakatin"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = h
        set_cell_background(cell, "0A1FD4" if i == 3 else "F1F5F9")
        set_cell_margins(cell, 120, 120, 140, 140)
        p = cell.paragraphs[0]
        run = p.runs[0]
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255) if i == 3 else DARK_TEXT

    rows_data = [
        ("Pencegahan Scope Creep", "Sangat Rentan", "Rentan Berdebat", "Terkunci Ketat via Deliverables & Exclusions"),
        ("Tanda Tangan & e-Materai", "Tidak Ada", "Manual / Tempel Gambar", "Alur Digital Sah + Panduan Resmi e-Materai RI"),
        ("Bukti Keaslian Anti-Edit", "Tidak Ada", "Mudah Dimanipulasi", "Segel Keamanan Digital & Audit Log"),
        ("Verifikasi Publik Instan", "Tidak Ada", "Tidak Ada", "QR Code + Contract ID Terintegrasi"),
    ]

    for row_idx, row_data in enumerate(rows_data, start=1):
        for col_idx, text in enumerate(row_data):
            cell = table.cell(row_idx, col_idx)
            cell.text = text
            set_cell_background(cell, "F0F4FF" if col_idx == 3 else ("FFFFFF" if row_idx % 2 == 1 else "F8FAFC"))
            set_cell_margins(cell, 90, 90, 120, 120)
            p = cell.paragraphs[0]
            run = p.runs[0]
            run.font.name = "Calibri"
            run.font.size = Pt(9)
            run.font.color.rgb = BRAND_BLUE if col_idx == 3 else DARK_TEXT
            if col_idx == 3 or col_idx == 0:
                run.font.bold = True

    # 5. Model Bisnis & Unit Economics
    add_custom_heading("5. Model Monetisasi & Kelayakan Unit Economics")
    add_custom_p(
        "Sepakatin mengadopsi model bisnis freemium yang ramah terhadap kantong freelancer di awal, namun terbukti menguntungkan melalui volume transaksi pay-per-project:"
    )
    add_bullet_item("Tier FREE (Rp0)", "Dua kesepakatan aktif, formulir standar, digital approval 2 belah pihak, dan ekspor cetak PDF.")
    add_bullet_item("Pay-per-Project (Rp19.000 / kesepakatan)", "Paling populer. Akses fitur e-Materai resmi, versioning tak terbatas, modul change request resmi, dan segel verifikasi penuh tanpa ikatan langganan bulanan.")
    add_bullet_item("Pro Subscription (Rp49.000 / bulan)", "Proyek tak terbatas, buku kontak klien, dashboard status pembayaran termin, dan custom branding logo di dokumen cetak.")

    add_custom_p(
        "Simulasi Unit Economics Proteksi:",
        bold_prefix="Analisis Rasio Biaya: "
    )
    add_custom_p(
        "Pada rata-rata proyek website atau aplikasi lepas senilai Rp8.000.000, biaya Rp19.000 hanya setara dengan 0,2375% dari total nilai proyek. Freelancer mendapatkan 99,76% proteksi kepastian nilai proyek dengan biaya yang tidak lebih mahal dari segelas kopi sachet."
    )

    # 6. Alur Skenario Demo 5 Menit (Panduan Presentasi Kompetisi)
    add_custom_heading("6. Panduan Alur Demo 5 Menit (Competition Pitch)")
    add_bullet_item("Menit 0:00 - 0:45 (Hook & Problem)", "Tampilkan obrolan chat WhatsApp freelancer yang ditagih revisi ke-15 tanpa dibayar. Tegaskan masalah: 68% freelancer mengalami scope creep dan ghosting.")
    add_bullet_item("Menit 0:45 - 1:45 (Solusi Sepakatin)", "Buka Sepakatin Homepage. Tunjukkan betapa cepatnya freelancer membuat kesepakatan baru dengan 5 klausul perlindungan dalam hitungan menit.")
    add_bullet_item("Menit 1:45 - 2:45 (Client Approval & e-Materai)", "Simulasikan link yang dibuka klien di mobile. Klien tanda tangan digital. Freelancer mengunggah e-Materai resmi dari e-meterai.co.id. Tunjukkan tata letak presisi di samping kanan e-materai.")
    add_bullet_item("Menit 2:45 - 3:45 (Segel Digital & Verifikasi Publik)", "Buka halaman Verifikasi Publik (/verify). Masukkan Contract ID SPK-2026-00124. Tunjukkan status 'ASLI & TERKUNCI' serta QR Code yang dapat langsung diverifikasi.")
    add_bullet_item("Menit 3:45 - 5:00 (Monetisasi, Traction & Closing)", "Tunjukkan simulasi unit economics Rp19.000 (0,23% investasi) dan visi Sepakatin sebagai infrastruktur legal kepercayaan bagi jutaan talenta digital Indonesia.")

    # 7. Penutup
    add_custom_heading("7. Kesimpulan & Roadmap Masa Depan")
    add_custom_p(
        "Sepakatin membuktikan bahwa solusi teknologi tepat guna tidak harus rumit atau menggunakan istilah teknis yang membingungkan. Dengan antarmuka minimalis bernuansa putih dan royal electric blue (#0a1fd4), Sepakatin siap didemokan sebagai produk siap pakai (production-ready MVP) yang menjawab kebutuhan nyata jutaan pekerja kreatif Indonesia."
    )

    doc.save(output_path)
    print(f"DOCX created successfully at: {output_path}")

def create_pptx(output_path):
    print(f"Generating PPTX: {output_path}...")
    prs = Presentation()
    # Set to 16:9 Widescreen (13.333 x 7.5 inches)
    prs.slide_width = PptxInches(13.333)
    prs.slide_height = PptxInches(7.5)
    blank_layout = prs.slide_layouts[6] # completely blank layout

    # Colors
    C_BLUE = PptxRGBColor(10, 31, 212)       # #0a1fd4
    C_DARK = PptxRGBColor(15, 23, 42)        # #0f172a
    C_MUTED = PptxRGBColor(100, 116, 139)    # #64748b
    C_LIGHT_BG = PptxRGBColor(248, 250, 252) # #f8fafc
    C_WHITE = PptxRGBColor(255, 255, 255)
    C_GREEN = PptxRGBColor(5, 150, 105)      # #059669
    C_BORDER = PptxRGBColor(226, 232, 240)

    def add_header(slide, tag_text, title_text, desc_text=None):
        # Tag / Category
        tb = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(0.6), PptxInches(11.5), PptxInches(0.4))
        p = tb.text_frame.paragraphs[0]
        p.text = tag_text.upper()
        p.font.name = "Arial"
        p.font.size = PptxPt(11)
        p.font.bold = True
        p.font.color.rgb = C_BLUE

        # Title
        tb_t = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(0.95), PptxInches(11.5), PptxInches(0.8))
        p_t = tb_t.text_frame.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = "Arial"
        p_t.font.size = PptxPt(26)
        p_t.font.bold = True
        p_t.font.color.rgb = C_DARK

        if desc_text:
            tb_d = slide.shapes.add_textbox(PptxInches(0.8), PptxInches(1.75), PptxInches(11.5), PptxInches(0.5))
            p_d = tb_d.text_frame.paragraphs[0]
            p_d.text = desc_text
            p_d.font.name = "Arial"
            p_d.font.size = PptxPt(13)
            p_d.font.color.rgb = C_MUTED

    def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = PptxPt(1.5)
        else:
            shape.line.fill.background()
        return shape

    # SLIDE 1: COVER
    slide1 = prs.slides.add_slide(blank_layout)
    # Background accent banner
    accent_bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, PptxInches(0.8), PptxInches(1.8), PptxInches(1.5), PptxInches(0.1))
    accent_bar.fill.solid()
    accent_bar.fill.fore_color.rgb = C_BLUE
    accent_bar.line.fill.background()

    tb1 = slide1.shapes.add_textbox(PptxInches(0.8), PptxInches(2.1), PptxInches(11), PptxInches(2.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "SEPAKATIN"
    p0.font.name = "Arial"
    p0.font.size = PptxPt(16)
    p0.font.bold = True
    p0.font.color.rgb = C_BLUE
    p0.space_after = PptxPt(10)

    p1 = tf1.add_paragraph()
    p1.text = "Ubah Kesepakatan Chat WhatsApp\nMenjadi Kontrak Sah & Terlindungi"
    p1.font.name = "Arial"
    p1.font.size = PptxPt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_DARK
    p1.space_after = PptxPt(16)

    p2 = tf1.add_paragraph()
    p2.text = "Platform Kesepakatan Proyek Digital & Proteksi Finansial untuk Freelancer Indonesia\nDilengkapi Alur e-Materai Resmi RI & Segel Keamanan Anti-Manipulasi"
    p2.font.name = "Arial"
    p2.font.size = PptxPt(14)
    p2.font.color.rgb = C_MUTED

    # Presenter tag card
    add_card(slide1, PptxInches(0.8), PptxInches(5.4), PptxInches(5.5), PptxInches(1.2), bg_color=C_LIGHT_BG)
    tb_meta = slide1.shapes.add_textbox(PptxInches(1.0), PptxInches(5.5), PptxInches(5.1), PptxInches(1.0))
    tf_meta = tb_meta.text_frame
    pm1 = tf_meta.paragraphs[0]
    pm1.text = "Presentasi Kompetisi 5 Menit"
    pm1.font.bold = True
    pm1.font.size = PptxPt(13)
    pm1.font.color.rgb = C_BLUE
    pm2 = tf_meta.add_paragraph()
    pm2.text = "Fadli Bilal & Tim Inovasi Sepakatin\nLive Demo Ready: http://localhost:3001"
    pm2.font.size = PptxPt(11)
    pm2.font.color.rgb = C_MUTED

    # Notes for Slide 1
    slide1.notes_slide.notes_text_frame.text = (
        "[00:00 - 00:30] PEMBUKAAN & HOOK:\n"
        "Halo Dewan Juri dan Rekan-rekan sekalian. Bayangkan seorang freelancer yang sudah bekerja siang malam selama 3 minggu membuat website, namun saat tiba hari pelunasan, klien meminta revisi ke-15 yang tidak masuk akal atau bahkan menghilang tanpa kabar.\n"
        "Kenapa ini terjadi? Karena kesepakatan mereka hanya terkubur di chat WhatsApp yang tidak punya kekuatan acuan tertulis. Hari ini, kami mempersembahkan Sepakatin."
    )

    # SLIDE 2: THE PAIN POINTS
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Masalah Nyata Pasar", "Realitas Pahit 68% Freelancer Digital di Indonesia", "Bekerja keras menghasilkan karya terbaik, namun rentan dirugikan secara finansial.")

    problems = [
        ("Scope Creep Liar", "Klien meminta penambahan fitur dan halaman baru secara cuma-cuma karena ruang lingkup awal tidak pernah dikunci secara resmi.", "68% Freelancer"),
        ("Revisi Tanpa Batas", "Tanpa kuota revisi yang jelas, freelancer terjebak dalam siklus perbaikan tanpa akhir yang memakan waktu dan biaya operasional.", "54% Freelancer"),
        ("Sengketa Pelunasan", "Penyerahan aset final sering dilakukan sebelum pelunasan diterima, membuka celah klien menunda atau mangkir bayar.", "47% Freelancer")
    ]

    for idx, (p_title, p_desc, p_stat) in enumerate(problems):
        c_left = PptxInches(0.8 + idx * 3.95)
        add_card(slide2, c_left, PptxInches(2.4), PptxInches(3.7), PptxInches(4.2), bg_color=C_WHITE)
        
        tb = slide2.shapes.add_textbox(c_left + PptxInches(0.3), PptxInches(2.7), PptxInches(3.1), PptxInches(3.6))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_badge = tf.paragraphs[0]
        p_badge.text = p_stat
        p_badge.font.size = PptxPt(12)
        p_badge.font.bold = True
        p_badge.font.color.rgb = C_BLUE
        p_badge.space_after = PptxPt(12)

        p_t = tf.add_paragraph()
        p_t.text = p_title
        p_t.font.size = PptxPt(18)
        p_t.font.bold = True
        p_t.font.color.rgb = C_DARK
        p_t.space_after = PptxPt(10)

        p_d = tf.add_paragraph()
        p_d.text = p_desc
        p_d.font.size = PptxPt(12)
        p_d.font.color.rgb = C_MUTED

    slide2.notes_slide.notes_text_frame.text = (
        "[00:30 - 01:15] MASALAH UTAMA:\n"
        "Ada 3 masalah utama yang terus berulang: Pertama, Scope Creep liar—klien merasa sudah membayar maka bebas minta apa saja. Kedua, revisi tanpa batas tanpa kompensasi tambahan. Ketiga, sengketa pelunasan saat hasil kerja diserahkan.\n"
        "Kenapa mereka tidak pakai jasa hukum? Karena menyewa advokat atau notaris untuk proyek senilai 5–10 juta itu tidak masuk akal secara biaya. Solusinya harus instan, murah, dan dapat diakses langsung via browser."
    )

    # SLIDE 3: THE SOLUTION
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Solusi Sepakatin", "Satu Platform untuk Mengunci Hak & Kewajiban Proyek", "Mengubah percakapan santai menjadi dokumen kesepakatan digital yang tertata rapi.")

    solutions = [
        ("1. Kesepakatan Terstruktur", "Formulir cerdas yang otomatis mengunci 5 klausul krusial: Deliverables, Exclusions, Kuota Revisi, Termin Pembayaran, dan Hak Cipta."),
        ("2. Portal Review Klien", "Klien menerima tautan undangan langsung tanpa perlu login. Dapat membaca, menyetujui, atau mengajukan penyesuaian klausul secara terbuka."),
        ("3. Segel Keamanan Digital", "Begitu kedua pihak menyetujui, isi kesepakatan dikunci permanen. Segala modifikasi sepihak akan langsung terbaca tidak sah."),
        ("4. Ekspor & Verifikasi Resmi", "Dokumen dapat dicetak ke format A4 PDF standar dengan QR Code verifikasi publik yang bisa dicek keabsahannya kapan saja.")
    ]

    for idx, (s_title, s_desc) in enumerate(solutions):
        row = idx // 2
        col = idx % 2
        c_left = PptxInches(0.8 + col * 5.9)
        c_top = PptxInches(2.4 + row * 2.1)
        add_card(slide3, c_left, c_top, PptxInches(5.7), PptxInches(1.85), bg_color=C_WHITE)

        tb = slide3.shapes.add_textbox(c_left + PptxInches(0.3), c_top + PptxInches(0.2), PptxInches(5.1), PptxInches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = s_title
        pt.font.size = PptxPt(15)
        pt.font.bold = True
        pt.font.color.rgb = C_BLUE
        pt.space_after = PptxPt(6)

        pd = tf.add_paragraph()
        pd.text = s_desc
        pd.font.size = PptxPt(11.5)
        pd.font.color.rgb = C_DARK

    slide3.notes_slide.notes_text_frame.text = (
        "[01:15 - 02:00] SOLUSI SEPAKATIN:\n"
        "Sepakatin menjawab kebutuhan tersebut secara menyeluruh. Freelancer hanya perlu mengisi 5 komponen vital dalam formulir kami. Sistem akan membuat draf profesional yang langsung bisa dikirimkan ke klien via link aman.\n"
        "Klien tidak perlu repot mendaftar akun! Mereka cukup membuka link di ponsel, memeriksa klausul, dan menyetujui. Sekali disetujui, dokumen langsung terkunci dengan segel keamanan digital."
    )

    # SLIDE 4: e-MATERAI RESMI & REGULASI
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Inovasi Regulasi RI", "Integrasi e-Materai Resmi & Panduan Tanda Tangan", "Mematuhi UU Bea Meterai No. 10 Tahun 2020 dengan tata letak tanda tangan yang presisi.")

    # Left Card: Alur e-Materai
    add_card(slide4, PptxInches(0.8), PptxInches(2.4), PptxInches(5.7), PptxInches(4.2), bg_color=C_WHITE)
    tb_em = slide4.shapes.add_textbox(PptxInches(1.1), PptxInches(2.7), PptxInches(5.1), PptxInches(3.6))
    tf_em = tb_em.text_frame
    tf_em.word_wrap = True
    
    p = tf_em.paragraphs[0]
    p.text = "Alur Legalitas e-Materai Resmi:"
    p.font.bold = True
    p.font.size = PptxPt(16)
    p.font.color.rgb = C_BLUE
    p.space_after = PptxPt(12)

    steps = [
        "1. Pembelian via Laman Resmi: Freelancer diarahkan ke portal resmi e-meterai.co.id (bukan meterai rekayasa).",
        "2. Upload e-Materai Mandiri: Freelancer mengunggah e-materai setelah kedua belah pihak menyetujui draf.",
        "3. Posisi Presisi: e-Materai otomatis ditempatkan pada kolom tanda tangan klien di atas nama lengkap.",
        "4. Tanda Tangan Sebelah Kanan: Panduan ketat mengingatkan klien menandatangani di sebelah kanan meterai (tidak menimpa fisik barcode meterai)."
    ]
    for s in steps:
        p_step = tf_em.add_paragraph()
        p_step.text = s
        p_step.font.size = PptxPt(11.5)
        p_step.font.color.rgb = C_DARK
        p_step.space_after = PptxPt(8)

    # Right Card: Nilai Tambah Hukum
    add_card(slide4, PptxInches(6.8), PptxInches(2.4), PptxInches(5.7), PptxInches(4.2), bg_color=C_LIGHT_BG)
    tb_val = slide4.shapes.add_textbox(PptxInches(7.1), PptxInches(2.7), PptxInches(5.1), PptxInches(3.6))
    tf_val = tb_val.text_frame
    tf_val.word_wrap = True

    p = tf_val.paragraphs[0]
    p.text = "Mengapa Ini Sangat Krusial?"
    p.font.bold = True
    p.font.size = PptxPt(16)
    p.font.color.rgb = C_DARK
    p.space_after = PptxPt(12)

    val_points = [
        "✓ Kekuatan Alat Bukti: Dokumen perdata di atas Rp5.000.000 sah sebagai alat bukti hukum sesuai UU RI jika dibubuhi bea meterai.",
        "✓ Menghindari Kesalahan Umum: Banyak orang menempelkan tanda tangan menimpa barcode e-materai sehingga gagal verifikasi Peruri.",
        "✓ Edukasi Otomatis: Sepakatin memberikan reminder visual kepada kedua pihak sehingga proses berjalan sesuai standar hukum formal.",
        "✓ Rasa Percaya Klien: Klien korporat merasa lebih aman dan menghormati profesionalitas freelancer."
    ]
    for vp in val_points:
        p_vp = tf_val.add_paragraph()
        p_vp.text = vp
        p_vp.font.size = PptxPt(11.5)
        p_vp.font.color.rgb = C_DARK
        p_vp.space_after = PptxPt(8)

    slide4.notes_slide.notes_text_frame.text = (
        "[02:00 - 03:00] FITUR e-MATERAI RESMI:\n"
        "Salah satu fitur paling unggul dari Sepakatin adalah integrasi alur e-Materai Resmi RI. Sesuai UU Bea Meterai, perjanjian bernilai di atas Rp5 juta memiliki kekuatan bukti lebih kokoh bila menggunakan meterai.\n"
        "Kami menyediakan tautan resmi ke e-meterai.co.id, dan yang terpenting: sistem kami memandu posisi penempatan tanda tangan agar berada di sebelah kanan meterai, bukan menimpa barcode e-materai yang sering kali menyebabkan dokumen gagal validasi di pengadilan atau perbankan."
    )

    # SLIDE 5: LIVE DEMO WALKTHROUGH
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Skenario Live Demo", "4 Langkah Mudah: Dari Draf hingga Dokumen Sah", "Alur mulus yang memakan waktu kurang dari 3 menit untuk memproteksi proyek jutaan rupiah.")

    demo_steps = [
        ("Step 1: Buat Kesepakatan", "Freelancer mengisi info proyek, deliverables, batasan, kuota revisi, dan termin DP 50% / Pelunasan 50%."),
        ("Step 2: Client Review & Sign", "Klien membuka link unik, melihat ringkasan klausul, dan membubuhkan tanda tangan digital di canvas interaktif."),
        ("Step 3: Tempel e-Materai", "Freelancer menempelkan file e-materai resmi. Sistem menata posisinya di atas nama pihak kedua secara otomatis."),
        ("Step 4: Cek Keaslian & QR", "Buka halaman verifikasi publik dengan Contract ID SPK-2026-00124. Segel digital terbukti sah dan tak bisa dimanipulasi.")
    ]

    for idx, (d_title, d_desc) in enumerate(demo_steps):
        c_left = PptxInches(0.8 + idx * 2.95)
        add_card(slide5, c_left, PptxInches(2.4), PptxInches(2.75), PptxInches(4.2), bg_color=C_WHITE)

        tb = slide5.shapes.add_textbox(c_left + PptxInches(0.2), PptxInches(2.7), PptxInches(2.35), PptxInches(3.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p_num = tf.paragraphs[0]
        p_num.text = f"0{idx+1}"
        p_num.font.size = PptxPt(22)
        p_num.font.bold = True
        p_num.font.color.rgb = C_BLUE
        p_num.space_after = PptxPt(8)

        p_t = tf.add_paragraph()
        p_t.text = d_title.split(": ")[1]
        p_t.font.size = PptxPt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = C_DARK
        p_t.space_after = PptxPt(8)

        p_d = tf.add_paragraph()
        p_d.text = d_desc
        p_d.font.size = PptxPt(11)
        p_d.font.color.rgb = C_MUTED

    slide5.notes_slide.notes_text_frame.text = (
        "[03:00 - 04:00] DEMO LANGSUNG (WALKTHROUGH):\n"
        "Mari kita lihat langsung aplikasinya: (1) Pertama, freelancer masuk ke Dashboard dan membuat kesepakatan baru. Rincian proyek, deliverables, dan termin pembayaran langsung terkalkulasi rapi.\n"
        "(2) Klien menerima link dan melakukan review. Klien bisa langsung tanda tangan. (3) Freelancer menambahkan e-materai. (4) Dan terakhir, kami uji di halaman verifikasi: masukkan ID SPK-2026-00124, status langsung terverifikasi asli & terkunci!"
    )

    # SLIDE 6: BUSINESS MODEL & UNIT ECONOMICS
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Model Bisnis & Monetisasi", "Investasi Rp19.000 untuk Proteksi Senilai Rp8.000.000", "Model monetisasi transparan yang sangat disukai pasar freelancer.")

    # Pricing tiers
    tiers = [
        ("FREE", "Rp0", "Untuk Freelancer Pemula", ["Maksimal 2 kesepakatan aktif", "Template dasar kesepakatan", "Tanda tangan digital 2 pihak", "Ekspor cetak PDF standar"], False),
        ("PROJECT", "Rp19.000", "Pay-per-Project (Favorit)", ["Fitur unggah e-Materai resmi", "Versioning tak terbatas (v1, v2..)", "Modul Change Request resmi", "Segel Keamanan Digital penuh"], True),
        ("PRO", "Rp49.000", "Langganan Bulanan", ["Unlimited active agreements", "Buku kontak klien & template", "Dashboard status termin pembayaran", "Custom branding logo agensi"], False),
    ]

    for idx, (t_name, t_price, t_sub, t_feats, is_pop) in enumerate(tiers):
        c_left = PptxInches(0.8 + idx * 3.95)
        bg = C_WHITE
        border = C_BLUE if is_pop else C_BORDER
        add_card(slide6, c_left, PptxInches(2.4), PptxInches(3.7), PptxInches(4.2), bg_color=bg, border_color=border)

        tb = slide6.shapes.add_textbox(c_left + PptxInches(0.25), PptxInches(2.6), PptxInches(3.2), PptxInches(3.8))
        tf = tb.text_frame
        tf.word_wrap = True

        p_n = tf.paragraphs[0]
        p_n.text = t_name
        p_n.font.size = PptxPt(14)
        p_n.font.bold = True
        p_n.font.color.rgb = C_BLUE if is_pop else C_MUTED

        p_pr = tf.add_paragraph()
        p_pr.text = t_price
        p_pr.font.size = PptxPt(24)
        p_pr.font.bold = True
        p_pr.font.color.rgb = C_DARK

        p_subt = tf.add_paragraph()
        p_subt.text = t_sub
        p_subt.font.size = PptxPt(10.5)
        p_subt.font.color.rgb = C_MUTED
        p_subt.space_after = PptxPt(10)

        for f in t_feats:
            pf = tf.add_paragraph()
            pf.text = "✓ " + f
            pf.font.size = PptxPt(10.5)
            pf.font.color.rgb = C_DARK
            pf.space_after = PptxPt(4)

    slide6.notes_slide.notes_text_frame.text = (
        "[04:00 - 04:40] MODEL BISNIS & UNIT ECONOMICS:\n"
        "Bagaimana Sepakatin menghasilkan pendapatan? Kami menyediakan skema Pay-per-Project hanya Rp19.000 per kesepakatan. Bayangkan rasio ini: untuk proyek bernilai Rp8 juta, biaya Rp19 ribu hanya setara dengan 0,23% dari nilai proyek!\n"
        "Freelancer bersedia membayar karena nilai proteksi 99,76% jauh lebih besar daripada risiko kehilangan honor jutaan rupiah akibat sengketa. Untuk agensi aktif, kami sediakan paket Pro Rp49.000/bulan."
    )

    # SLIDE 7: VISION & CLOSING
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Visi & Kesimpulan", "Membangun Standar Baru Ekonomi Gig di Indonesia", "Dari kesepakatan informal berisiko menuju ekosistem profesional yang saling percaya.")

    add_card(slide7, PptxInches(0.8), PptxInches(2.4), PptxInches(11.733), PptxInches(3.0), bg_color=C_LIGHT_BG)
    tb7 = slide7.shapes.add_textbox(PptxInches(1.2), PptxInches(2.7), PptxInches(10.9), PptxInches(2.4))
    tf7 = tb7.text_frame
    tf7.word_wrap = True

    p = tf7.paragraphs[0]
    p.text = "Misi Kami: Nol Sengketa untuk Talenta Digital Indonesia"
    p.font.size = PptxPt(18)
    p.font.bold = True
    p.font.color.rgb = C_BLUE
    p.space_after = PptxPt(10)

    p_v = tf7.add_paragraph()
    p_v.text = (
        "Sepakatin bukan sekadar aplikasi pembuatan PDF, melainkan fondasi kepercayaan bagi jutaan pekerja lepas digital dan pelaku UMKM di Indonesia. Dengan menghilangkan friksi hukum dan memberikan kepastian tertulis yang adil, kami memastikan setiap talenta kreatif mendapatkan haknya secara bermartabat."
    )
    p_v.font.size = PptxPt(13)
    p_v.font.color.rgb = C_DARK
    p_v.space_after = PptxPt(14)

    p_cta = tf7.add_paragraph()
    p_cta.text = "Terima Kasih! | Sesi Tanya Jawab (Q&A) | Sepakatin — Sah, Praktis, Terlindungi."
    p_cta.font.size = PptxPt(13)
    p_cta.font.bold = True
    p_cta.font.color.rgb = C_BLUE

    slide7.notes_slide.notes_text_frame.text = (
        "[04:40 - 05:00] PENUTUP & KESIMPULAN:\n"
        "Bapak dan Ibu Dewan Juri, Sepakatin siap digunakan hari ini. Platform ini sudah online, responsif, minimalis, dan siap mengubah cara jutaan freelancer Indonesia bertransaksi dengan aman.\n"
        "Mari bersama kita lindungi karya dan keringat talenta kreatif bangsa. Terima kasih, dan kami siap untuk sesi tanya jawab."
    )

    prs.save(output_path)
    print(f"PPTX created successfully at: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    docx_file = os.path.join(base_dir, "Sepakatin_Gambaran_Projek.docx")
    pptx_file = os.path.join(base_dir, "Sepakatin_Presentasi_5Menit.pptx")

    create_docx(docx_file)
    create_pptx(pptx_file)
    print("All documents generated successfully!")
