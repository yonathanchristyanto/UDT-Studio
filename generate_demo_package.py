"""
generate_demo_package.py
Generator Paket Data Simulasi UDT Studio untuk Demo Eksekutif / Manajemen:
1. Skenario 1 (HPLC Multi-Media): Empagliflozin 25 mg vs Jardiance 25 mg (Similar & Very Rapid 15')
2. Skenario 2 (HPLC Gagal): Candesartan 16 mg vs Blopress 16 mg (Not Similar / Dissimilar, f2 < 50)
3. Skenario 3 (UV-Vis Cary 60): Metformin HCl 500 mg vs Glucophage 500 mg (Spektrofotometer UV-Vis Cary 60)
4. Skenario 4 (HPLC Audit Kepatuhan): Atorvastatin 20 mg vs Lipitor 20 mg (High RSD Warning)
"""

import os
import random
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors

random.seed(2026)

BASE_DIR = Path(r"C:\Users\Win 10\.gemini\antigravity\scratch\udt-assistant\sample-data\demo-package")

def ensure_dirs(folder: Path):
    (folder / "csv").mkdir(parents=True, exist_ok=True)
    (folder / "pdf").mkdir(parents=True, exist_ok=True)

# ----------------- Helper Penulisan CSV HPLC CDS -----------------
def write_hplc_csv(filepath, rows, meta):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("# ChemStation Sequence Summary Report\n")
        f.write(f"# Sequence: {meta.get('seq', 'UDT_ANALYSIS')}\n")
        f.write(f"# Operator: {meta.get('operator', 'Analyst QA/QC')}\n")
        f.write(f"# Date: {meta.get('date', '2026-11-04 09:15:00')}\n")
        f.write(f"# Instrument: {meta.get('instrument', 'HPLC-02 Agilent 1260 Infinity II')}\n")
        f.write(f"# Method: {meta.get('method', 'DISSOLUTION_METHOD.M')}\n")
        f.write(f"# Column: {meta.get('column', 'C18 4.6 x 150 mm, 5 um')}\n")
        f.write(f"# Medium: {meta.get('medium', 'Buffer pH')}\n")
        f.write(f"# Batch: {meta.get('batch', '')}\n")
        f.write("# Notes: 12 Vessels, Auto-sampler Injections\n")
        f.write('"Sample Name","Ret. Time","Area","USP Tailing","USP Plate Count"\n')
        for r in rows:
            f.write(f'"{r["name"]}",{r["rt"]:.3f},{r["area"]:.4f},{r.get("tail", 1.10):.2f},{r.get("plates", 5500.0):.1f}\n')

# ----------------- Helper Penulisan PDF HPLC CDS -----------------
def write_hplc_pdf(filepath, rows, meta):
    c = canvas.Canvas(str(filepath), pagesize=A4)
    width, height = A4
    rows_per_page = 38
    total_pages = (len(rows) + rows_per_page - 1) // rows_per_page

    for page_idx in range(total_pages):
        page_num = page_idx + 1
        start_r = page_idx * rows_per_page
        end_r = min(start_r + rows_per_page, len(rows))
        page_rows = rows[start_r:end_r]

        # Header Title
        c.setFont("Helvetica-Bold", 12)
        c.drawString(40, height - 40, "HPLC Sequence Summary Report - Dissolution Testing")
        
        c.setFont("Helvetica", 8)
        c.drawString(40, height - 54, f"Sequence: {meta.get('seq', 'UDT_SEQ')} | Instrument: {meta.get('instrument', 'HPLC-02')} | Operator: {meta.get('operator', 'Analyst QA/QC')}")
        c.drawString(40, height - 66, f"Medium: {meta.get('medium', 'Buffer')} | Batch: {meta.get('batch', '')} | Page {page_num} of {total_pages}")
        
        # Table Header Line
        y = height - 85
        c.setStrokeColor(colors.HexColor("#0071e3"))
        c.setLineWidth(1)
        c.line(40, y + 10, width - 40, y + 10)
        c.line(40, y - 4, width - 40, y - 4)

        c.setFont("Helvetica-Bold", 8)
        c.drawString(40, y, "Sample Name")
        c.drawString(290, y, "RetTime")
        c.drawString(360, y, "Area")
        c.drawString(445, y, "USP Tail")
        c.drawString(505, y, "Plates USP")

        # Table Rows
        y -= 16
        c.setFont("Helvetica", 7.5)
        for r in page_rows:
            if r["type"] == "std":
                c.setFillColor(colors.HexColor("#003366"))
                c.setFont("Helvetica-Bold", 7.5)
            elif "bs" in r["type"].lower():
                c.setFillColor(colors.HexColor("#663300"))
                c.setFont("Helvetica-Bold", 7.5)
            else:
                c.setFillColor(colors.black)
                c.setFont("Helvetica", 7.5)

            c.drawString(40, y, r["name"])
            c.drawString(290, y, f"{r['rt']:.3f}")
            c.drawString(360, y, f"{r['area']:.4f}")
            c.drawString(445, y, f"{r.get('tail', 1.10):.2f}")
            c.drawString(505, y, f"{r.get('plates', 5500.0):.1f}")
            y -= 13.5

        # Footer
        c.setStrokeColor(colors.HexColor("#d2d2d7"))
        c.line(40, 35, width - 40, 35)
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#86868b"))
        c.drawString(40, 24, "Analytical Chemistry Laboratory - Data Integration Summary (Agilent ChemStation / Empower compatible)")
        c.drawRightString(width - 40, 24, "Confidential & Proprietary - Generated for UDT Studio")
        c.showPage()

    c.save()

# ----------------- Helper Penulisan Cary 60 UV-Vis CSV -----------------
def write_cary60_csv(filepath, rows, meta):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("Advanced Reads Report\n")
        f.write(f"Report Date : {meta.get('date', '2026-11-04 10:30:00')}\n")
        f.write(f"Instrument : Agilent Cary 60 UV-Vis Spectrophotometer\n")
        f.write(f"User : {meta.get('operator', 'Analyst Andev')}\n")
        f.write(f"Method : {meta.get('method', 'METFORMIN_UV_233NM.BSW')}\n")
        f.write(f"Wavelength : 233.0 nm\n")
        f.write(f"Medium : {meta.get('medium', 'Buffer pH 6.8')}\n")
        f.write(f"Batch : {meta.get('batch', '')}\n")
        f.write("\n")
        f.write("Sample Readings\n")
        f.write('"Sample Name","Readings"\n')
        for r in rows:
            f.write(f'"{r["name"]}",{r["area"]:.4f}\n')

# ----------------- Helper Penulisan Cary 60 UV-Vis PDF -----------------
def write_cary60_pdf(filepath, rows, meta):
    c = canvas.Canvas(str(filepath), pagesize=A4)
    width, height = A4
    rows_per_page = 38
    total_pages = (len(rows) + rows_per_page - 1) // rows_per_page

    for page_idx in range(total_pages):
        page_num = page_idx + 1
        start_r = page_idx * rows_per_page
        end_r = min(start_r + rows_per_page, len(rows))
        page_rows = rows[start_r:end_r]

        c.setFont("Helvetica-Bold", 12)
        c.drawString(40, height - 40, "Advanced Reads Report - Cary 60 UV-Vis Spectrophotometer")
        
        c.setFont("Helvetica", 8)
        c.drawString(40, height - 54, f"PT. Pharos Indonesia | Departemen Analytical Development | Wavelength: 233.0 nm")
        c.drawString(40, height - 66, f"User: {meta.get('operator', 'Analyst Lab')} | Medium: {meta.get('medium', 'Buffer')} | Batch: {meta.get('batch', '')} | Page {page_num} of {total_pages}")
        
        y = height - 85
        c.setStrokeColor(colors.HexColor("#0f766e"))
        c.setLineWidth(1)
        c.line(40, y + 10, width - 40, y + 10)
        c.line(40, y - 4, width - 40, y - 4)

        c.setFont("Helvetica-Bold", 8)
        c.drawString(40, y, "Analysis")
        c.drawString(380, y, "Sample F Readings")

        y -= 16
        c.setFont("Helvetica", 8)
        for r in page_rows:
            if "std" in r["type"].lower() or "bs" in r["type"].lower():
                c.setFont("Helvetica-Bold", 8)
                c.setFillColor(colors.HexColor("#0f766e"))
            else:
                c.setFont("Helvetica", 8)
                c.setFillColor(colors.black)

            c.drawString(40, y, r["name"])
            c.drawRightString(460, y, f"{r['area']:.4f}")
            y -= 13.5

        c.setStrokeColor(colors.HexColor("#d2d2d7"))
        c.line(40, 35, width - 40, 35)
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#86868b"))
        c.drawString(40, 24, "Agilent Technologies Cary WinUV Software Report - Analytical Development")
        c.drawRightString(width - 40, 24, "Confidential - UDT Studio Simulation Dataset")
        c.showPage()

    c.save()

# ==============================================================================
# 1. GENERATOR SKENARIO 1: Empagliflozin vs Jardiance (HPLC 4 Media, Similar & Very Rapid)
# ==============================================================================
def gen_scenario_1():
    folder = BASE_DIR / "01_Empagliflozin_HPLC_Similar_and_VeryRapid"
    ensure_dirs(folder)
    print("\n[Scenario 1] Generating Empagliflozin vs Jardiance (Similar & Very Rapid)...")

    media_configs = [
        {
            "id": "1.2",
            "name": "Buffer HCl pH 1.2",
            # Very Rapid Dissolution: Both >= 85% at 15'
            "test_curve": {5: (67.5, 69.5), 10: (84.0, 85.5), 15: (91.0, 93.0), 20: (95.0, 96.5), 30: (97.5, 98.5), 45: (99.0, 99.5), 60: (99.8, 100.2)},
            "ref_curve":  {5: (68.5, 70.5), 10: (84.5, 86.0), 15: (92.0, 93.5), 20: (95.5, 97.0), 30: (97.8, 98.8), 45: (99.2, 99.8), 60: (100.0, 100.5)}
        },
        {
            "id": "4.5",
            "name": "Buffer Asetat pH 4.5",
            # Dissolution gradual, f2 ~ 74
            "test_curve": {5: (33.5, 35.5), 10: (53.5, 56.0), 15: (68.5, 70.5), 20: (77.5, 79.5), 30: (86.0, 88.0), 45: (92.0, 93.5), 60: (95.5, 97.0)},
            "ref_curve":  {5: (34.5, 36.5), 10: (55.0, 57.0), 15: (69.5, 71.5), 20: (78.5, 80.5), 30: (87.0, 89.0), 45: (93.0, 94.5), 60: (96.5, 98.0)}
        },
        {
            "id": "6.8",
            "name": "Buffer Fosfat pH 6.8",
            # Dissolution gradual, f2 ~ 72
            "test_curve": {5: (44.0, 46.5), 10: (64.0, 66.5), 15: (77.5, 79.5), 20: (85.0, 86.5), 30: (91.0, 92.5), 45: (95.0, 96.5), 60: (98.0, 99.0)},
            "ref_curve":  {5: (45.5, 47.5), 10: (65.5, 68.0), 15: (79.0, 80.5), 20: (86.0, 87.5), 30: (92.0, 93.5), 45: (96.0, 97.5), 60: (99.0, 100.0)}
        },
        {
            "id": "Air",
            "name": "Purified Water (Air)",
            # Dissolution gradual, f2 ~ 69
            "test_curve": {5: (27.5, 30.0), 10: (47.0, 50.5), 15: (62.0, 65.0), 20: (72.0, 75.0), 30: (81.5, 84.0), 45: (88.5, 90.5), 60: (92.5, 94.5)},
            "ref_curve":  {5: (29.0, 31.5), 10: (49.0, 52.0), 15: (64.0, 67.0), 20: (74.0, 77.0), 30: (83.5, 86.0), 45: (90.5, 92.5), 60: (94.5, 96.5)}
        }
    ]

    all_test = []
    all_ref = []

    for mc in media_configs:
        m_id = mc["id"]
        # Standar Area = 12500
        std_area = 12500.0

        # Generator Helper
        def build_rows(p_name, batch, curve, role):
            rows = []
            # 5 Standar Utama
            for i in range(1, 6):
                rows.append({"name": f"Std {i} MD {m_id}", "rt": round(3.42 + random.uniform(-0.01, 0.01), 3), "area": round(std_area + random.uniform(-15, 15), 4), "type": "std"})
            # Sample 5', 10', 15', 20' (V1-V12)
            for t in [5, 10, 15, 20]:
                for v in range(1, 13):
                    pct = random.uniform(*curve[t]) + random.uniform(-0.8, 0.8)
                    area = round((pct / 100.0) * std_area + random.uniform(-10, 10), 4)
                    rows.append({"name": f"{p_name} {batch} MD {m_id} {t}' {v}", "rt": round(3.42 + random.uniform(-0.02, 0.02), 3), "area": area, "type": "sample"})
            # 2 BS Mid
            for i in range(1, 3):
                rows.append({"name": f"BS Mid {i} MD {m_id}", "rt": round(3.42 + random.uniform(-0.01, 0.01), 3), "area": round(std_area + random.uniform(-18, 18), 4), "type": "bsMid"})
            # Sample 30', 45', 60' (V1-V12)
            for t in [30, 45, 60]:
                for v in range(1, 13):
                    pct = random.uniform(*curve[t]) + random.uniform(-0.6, 0.6)
                    area = round((pct / 100.0) * std_area + random.uniform(-10, 10), 4)
                    rows.append({"name": f"{p_name} {batch} MD {m_id} {t}' {v}", "rt": round(3.42 + random.uniform(-0.02, 0.02), 3), "area": area, "type": "sample"})
            # 2 BS End
            for i in range(1, 3):
                rows.append({"name": f"BS End {i} MD {m_id}", "rt": round(3.42 + random.uniform(-0.01, 0.01), 3), "area": round(std_area + random.uniform(-20, 20), 4), "type": "bsEnd"})
            return rows

        t_rows = build_rows("Empagliflozin", "F0048J26A", mc["test_curve"], "test")
        r_rows = build_rows("Jardiance", "F0006H26A", mc["ref_curve"], "ref")
        all_test.extend(t_rows)
        all_ref.extend(r_rows)

        # Simpan per media
        t_meta = {"seq": f"SEQ_EMPA_MD_{m_id}", "medium": mc["name"], "batch": "Empagliflozin 25 mg (F0048J26A)", "operator": "Kania R&D"}
        r_meta = {"seq": f"SEQ_JARD_MD_{m_id}", "medium": mc["name"], "batch": "Jardiance 25 mg (F0006H26A)", "operator": "Kania R&D"}
        write_hplc_csv(folder / "csv" / f"Empagliflozin_Test_pH_{m_id}.csv", t_rows, t_meta)
        write_hplc_pdf(folder / "pdf" / f"Empagliflozin_Test_pH_{m_id}.pdf", t_rows, t_meta)
        write_hplc_csv(folder / "csv" / f"Jardiance_Ref_pH_{m_id}.csv", r_rows, r_meta)
        write_hplc_pdf(folder / "pdf" / f"Jardiance_Ref_pH_{m_id}.pdf", r_rows, r_meta)

    # Simpan file gabungan 4 Media
    comb_t_meta = {"seq": "SEQ_EMPA_ALL_4MEDIA", "medium": "4 Media (pH 1.2, 4.5, 6.8, Air)", "batch": "Empagliflozin 25 mg (F0048J26A)", "operator": "Kania R&D"}
    comb_r_meta = {"seq": "SEQ_JARD_ALL_4MEDIA", "medium": "4 Media (pH 1.2, 4.5, 6.8, Air)", "batch": "Jardiance 25 mg (F0006H26A)", "operator": "Kania R&D"}
    write_hplc_csv(folder / "csv" / "Empagliflozin_Test_AllMedia_4Media.csv", all_test, comb_t_meta)
    write_hplc_pdf(folder / "pdf" / "Empagliflozin_Test_AllMedia_4Media.pdf", all_test, comb_t_meta)
    write_hplc_csv(folder / "csv" / "Jardiance_Ref_AllMedia_4Media.csv", all_ref, comb_r_meta)
    write_hplc_pdf(folder / "pdf" / "Jardiance_Ref_AllMedia_4Media.pdf", all_ref, comb_r_meta)
    print("  -> Skenario 1 selesai: 4 media individual + 1 file gabungan All-Media.")

# ==============================================================================
# 2. GENERATOR SKENARIO 2: Candesartan vs Blopress (HPLC Gagal / NOT SIMILAR, f2 < 50)
# ==============================================================================
def gen_scenario_2():
    folder = BASE_DIR / "02_Candesartan_HPLC_NotSimilar"
    ensure_dirs(folder)
    print("\n[Scenario 2] Generating Candesartan vs Blopress (NOT SIMILAR, f2 < 50)...")

    m_id = "6.8"
    std_area = 15200.0

    # Inovator: Blopress 16 mg pelepasan standar (cepat di pH 6.8 + surfaktan)
    # 5': 22%, 10': 48%, 15': 68%, 30': 86%, 45': 94%, 60': 98%
    ref_curve = {5: (21.0, 23.5), 10: (46.5, 49.5), 15: (66.5, 69.5), 30: (85.0, 87.5), 45: (93.0, 95.0), 60: (97.0, 99.0)}

    # Formulasi Uji Prototype: Keterlambatan disintegrasi & pelepasan lambat
    # 5': 8%, 10': 22%, 15': 38%, 30': 58%, 45': 71%, 60': 79% (Selisih > 25%!)
    # f2 akan jatuh di angka ~ 32 - 36 (NOT SIMILAR)
    test_curve = {5: (7.5, 9.5), 10: (21.0, 23.5), 15: (36.5, 39.5), 30: (56.5, 59.5), 45: (69.5, 72.5), 60: (78.0, 80.5)}

    def build_rows(p_name, batch, curve):
        rows = []
        for i in range(1, 6):
            rows.append({"name": f"Std {i} MD {m_id}", "rt": 4.150, "area": round(std_area + random.uniform(-18, 18), 4), "type": "std"})
        for t in [5, 10, 15]:
            for v in range(1, 13):
                pct = random.uniform(*curve[t]) + random.uniform(-0.8, 0.8)
                area = round((pct / 100.0) * std_area + random.uniform(-12, 12), 4)
                rows.append({"name": f"{p_name} {batch} MD {m_id} {t}' {v}", "rt": 4.150, "area": area, "type": "sample"})
        for i in range(1, 3):
            rows.append({"name": f"BS Mid {i} MD {m_id}", "rt": 4.150, "area": round(std_area + random.uniform(-20, 20), 4), "type": "bsMid"})
        for t in [30, 45, 60]:
            for v in range(1, 13):
                pct = random.uniform(*curve[t]) + random.uniform(-0.7, 0.7)
                area = round((pct / 100.0) * std_area + random.uniform(-12, 12), 4)
                rows.append({"name": f"{p_name} {batch} MD {m_id} {t}' {v}", "rt": 4.150, "area": area, "type": "sample"})
        for i in range(1, 3):
            rows.append({"name": f"BS End {i} MD {m_id}", "rt": 4.150, "area": round(std_area + random.uniform(-22, 22), 4), "type": "bsEnd"})
        return rows

    t_rows = build_rows("Candesartan", "F0091L26B", test_curve)
    r_rows = build_rows("Blopress", "B8014K26A", ref_curve)

    t_meta = {"seq": "SEQ_CAND_PROTOTYPE_PH68", "medium": "Buffer Fosfat pH 6.8 + 0.05% Tween 20", "batch": "Candesartan 16 mg (F0091L26B - Prototype)", "operator": "Budi Formulasi"}
    r_meta = {"seq": "SEQ_BLOPRESS_REF_PH68", "medium": "Buffer Fosfat pH 6.8 + 0.05% Tween 20", "batch": "Blopress 16 mg (B8014K26A - Inovator Takeda)", "operator": "Budi Formulasi"}

    write_hplc_csv(folder / "csv" / "Candesartan_Test_pH_6.8_NotSimilar.csv", t_rows, t_meta)
    write_hplc_pdf(folder / "pdf" / "Candesartan_Test_pH_6.8_NotSimilar.pdf", t_rows, t_meta)
    write_hplc_csv(folder / "csv" / "Blopress_Ref_pH_6.8.csv", r_rows, r_meta)
    write_hplc_pdf(folder / "pdf" / "Blopress_Ref_pH_6.8.pdf", r_rows, r_meta)
    print("  -> Skenario 2 selesai: Candesartan vs Blopress (Hasil: Not Similar, f2 < 50).")

# ==============================================================================
# 3. GENERATOR SKENARIO 3: Metformin vs Glucophage (UV-Vis Cary 60 Spektrofotometer)
# ==============================================================================
def gen_scenario_3():
    folder = BASE_DIR / "03_Metformin_UV_Cary60_Rapid"
    ensure_dirs(folder)
    print("\n[Scenario 3] Generating Metformin vs Glucophage (UV-Vis Cary 60, Rapid)...")

    m_id = "6.8"
    std_abs = 0.5250  # Absorbansi standar 10 ppm pada 233 nm

    # Keduanya terdisolusi cepat (Metformin BCS III)
    # 5': ~58%, 10': ~78%, 15': ~88%, 20': ~94%, 30': ~98%, 45': ~100%
    test_curve = {5: (56.0, 58.5), 10: (76.0, 78.5), 15: (87.0, 89.0), 20: (93.5, 95.0), 30: (97.0, 98.5), 45: (99.0, 100.5)}
    ref_curve  = {5: (57.5, 60.0), 10: (77.5, 80.0), 15: (88.0, 90.0), 20: (94.0, 96.0), 30: (98.0, 99.5), 45: (99.5, 101.0)}

    def build_cary_rows(p_name, batch, curve):
        rows = []
        for i in range(1, 6):
            rows.append({"name": f"Standar {i} MD {m_id}", "area": round(std_abs + random.uniform(-0.002, 0.002), 4), "type": "std"})
        for t in [5, 10, 15, 20]:
            for v in range(1, 13):
                pct = random.uniform(*curve[t]) + random.uniform(-0.8, 0.8)
                abs_val = round((pct / 100.0) * std_abs + random.uniform(-0.002, 0.002), 4)
                rows.append({"name": f"{p_name} {batch} MD {m_id} {t}' {v}", "area": abs_val, "type": "sample"})
        for i in range(1, 3):
            rows.append({"name": f"BS Mid {i} MD {m_id}", "area": round(std_abs + random.uniform(-0.003, 0.003), 4), "type": "bsMid"})
        for t in [30, 45]:
            for v in range(1, 13):
                pct = random.uniform(*curve[t]) + random.uniform(-0.6, 0.6)
                abs_val = round((pct / 100.0) * std_abs + random.uniform(-0.002, 0.002), 4)
                rows.append({"name": f"{p_name} {batch} MD {m_id} {t}' {v}", "area": abs_val, "type": "sample"})
        for i in range(1, 3):
            rows.append({"name": f"BS End {i} MD {m_id}", "area": round(std_abs + random.uniform(-0.003, 0.003), 4), "type": "bsEnd"})
        return rows

    t_rows = build_cary_rows("Metformin", "F0012A26A", test_curve)
    r_rows = build_cary_rows("Glucophage", "G0088F26A", ref_curve)

    t_meta = {"method": "METFORMIN_UV_233NM.BSW", "medium": "Buffer Fosfat pH 6.8", "batch": "Metformin HCl 500 mg (F0012A26A)", "operator": "Dewi Analis"}
    r_meta = {"method": "METFORMIN_UV_233NM.BSW", "medium": "Buffer Fosfat pH 6.8", "batch": "Glucophage 500 mg (G0088F26A - Merck Serono)", "operator": "Dewi Analis"}

    write_cary60_csv(folder / "csv" / "Metformin_Test_pH_6.8_Cary60.csv", t_rows, t_meta)
    write_cary60_pdf(folder / "pdf" / "Metformin_Test_pH_6.8_Cary60.pdf", t_rows, t_meta)
    write_cary60_csv(folder / "csv" / "Glucophage_Ref_pH_6.8_Cary60.csv", r_rows, r_meta)
    write_cary60_pdf(folder / "pdf" / "Glucophage_Ref_pH_6.8_Cary60.pdf", r_rows, r_meta)
    print("  -> Skenario 3 selesai: Metformin vs Glucophage (Cary 60 UV-Vis Format).")

# ==============================================================================
# 4. GENERATOR SKENARIO 4: Atorvastatin vs Lipitor (High % RSD Warning)
# ==============================================================================
def gen_scenario_4():
    folder = BASE_DIR / "04_Atorvastatin_HPLC_HighRSD_Warning"
    ensure_dirs(folder)
    print("\n[Scenario 4] Generating Atorvastatin vs Lipitor (High % RSD Warning)...")

    m_id = "4.5"
    std_area = 18500.0

    # Inovator Lipitor: disolusi konsisten, RSD rendah (< 5%)
    ref_curve = {5: (28.0, 31.0), 10: (48.0, 51.5), 15: (65.0, 68.0), 20: (75.0, 78.0), 30: (84.0, 86.5), 45: (91.0, 93.5), 60: (95.0, 97.0)}

    # Produk Uji Atorvastatin F0077C26A:
    # Memiliki variasi vessel yang tinggi:
    # Pada menit ke-5: Beberapa vessel terapung/lambat (14%), beberapa cepat (38%) -> % RSD ~ 26% (> 20% limit!)
    # Pada menit ke-20: Satu vessel menggumpal -> % RSD ~ 14.5% (> 10% limit!)
    # Rata-rata tetap mirip sehingga f2 ~ 56, tetapi SISTEM MENCETUSKAN PERINGATAN KEPATUHAN REGULASI!
    test_mean = {5: 29.5, 10: 49.5, 15: 66.0, 20: 76.5, 30: 85.0, 45: 92.0, 60: 96.0}

    def build_ref_rows():
        rows = []
        for i in range(1, 6):
            rows.append({"name": f"Std {i} MD {m_id}", "rt": 5.220, "area": round(std_area + random.uniform(-15, 15), 4), "type": "std"})
        for t in [5, 10, 15, 20]:
            for v in range(1, 13):
                pct = random.uniform(*ref_curve[t]) + random.uniform(-1.0, 1.0)
                rows.append({"name": f"Lipitor L0042D26A MD {m_id} {t}' {v}", "rt": 5.220, "area": round((pct/100.0)*std_area, 4), "type": "sample"})
        for i in range(1, 3):
            rows.append({"name": f"BS Mid {i} MD {m_id}", "rt": 5.220, "area": round(std_area + random.uniform(-18, 18), 4), "type": "bsMid"})
        for t in [30, 45, 60]:
            for v in range(1, 13):
                pct = random.uniform(*ref_curve[t]) + random.uniform(-0.8, 0.8)
                rows.append({"name": f"Lipitor L0042D26A MD {m_id} {t}' {v}", "rt": 5.220, "area": round((pct/100.0)*std_area, 4), "type": "sample"})
        for i in range(1, 3):
            rows.append({"name": f"BS End {i} MD {m_id}", "rt": 5.220, "area": round(std_area + random.uniform(-20, 20), 4), "type": "bsEnd"})
        return rows

    def build_test_high_rsd_rows():
        rows = []
        for i in range(1, 6):
            rows.append({"name": f"Std {i} MD {m_id}", "rt": 5.220, "area": round(std_area + random.uniform(-15, 15), 4), "type": "std"})
        
        # Titik 5': Dispersi lebar (RSD > 20%)
        # Vessel 1..12 dengan variasi ekstrim dari 16% hingga 42%
        vessel_biases_5 = [-11.5, -9.0, -7.5, -5.0, -2.0, 0.5, 2.0, 4.5, 6.0, 8.5, 10.0, 12.5]
        # Titik 20': RSD > 10%
        vessel_biases_20 = [-13.0, -9.5, -6.0, -3.0, -1.0, 1.0, 2.0, 4.0, 6.0, 8.0, 10.0, 14.5]

        for t in [5, 10, 15, 20]:
            for v in range(1, 13):
                base = test_mean[t]
                if t == 5:
                    pct = base + vessel_biases_5[v - 1] + random.uniform(-0.8, 0.8)
                elif t == 20:
                    pct = base + vessel_biases_20[v - 1] + random.uniform(-0.8, 0.8)
                else:
                    pct = base + random.uniform(-2.5, 2.5)
                rows.append({"name": f"Atorvastatin F0077C26A MD {m_id} {t}' {v}", "rt": 5.220, "area": round((pct/100.0)*std_area, 4), "type": "sample"})

        for i in range(1, 3):
            rows.append({"name": f"BS Mid {i} MD {m_id}", "rt": 5.220, "area": round(std_area + random.uniform(-18, 18), 4), "type": "bsMid"})

        for t in [30, 45, 60]:
            for v in range(1, 13):
                pct = test_mean[t] + random.uniform(-2.0, 2.0)
                rows.append({"name": f"Atorvastatin F0077C26A MD {m_id} {t}' {v}", "rt": 5.220, "area": round((pct/100.0)*std_area, 4), "type": "sample"})

        for i in range(1, 3):
            rows.append({"name": f"BS End {i} MD {m_id}", "rt": 5.220, "area": round(std_area + random.uniform(-20, 20), 4), "type": "bsEnd"})
        return rows

    t_rows = build_test_high_rsd_rows()
    r_rows = build_ref_rows()

    t_meta = {"seq": "SEQ_ATORVA_HIGHRSD", "medium": "Buffer Asetat pH 4.5", "batch": "Atorvastatin 20 mg (F0077C26A - Variabilitas Tinggi)", "operator": "Rudi QA"}
    r_meta = {"seq": "SEQ_LIPITOR_REF", "medium": "Buffer Asetat pH 4.5", "batch": "Lipitor 20 mg (L0042D26A - Pfizer)", "operator": "Rudi QA"}

    write_hplc_csv(folder / "csv" / "Atorvastatin_Test_pH_4.5_HighRSD.csv", t_rows, t_meta)
    write_hplc_pdf(folder / "pdf" / "Atorvastatin_Test_pH_4.5_HighRSD.pdf", t_rows, t_meta)
    write_hplc_csv(folder / "csv" / "Lipitor_Ref_pH_4.5.csv", r_rows, r_meta)
    write_hplc_pdf(folder / "pdf" / "Lipitor_Ref_pH_4.5.pdf", r_rows, r_meta)
    print("  -> Skenario 4 selesai: Atorvastatin vs Lipitor (High % RSD Warning).")

def main():
    print("=================================================================")
    print("Membuat Seluruh Paket Data Simulasi UDT Studio untuk Demo Atasan")
    print(f"Target Direktori: {BASE_DIR}")
    print("=================================================================")
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    gen_scenario_1()
    gen_scenario_2()
    gen_scenario_3()
    gen_scenario_4()
    print("\nSemua dataset simulasi demo berhasil dibuat dengan format CSV & PDF!")

if __name__ == "__main__":
    main()
