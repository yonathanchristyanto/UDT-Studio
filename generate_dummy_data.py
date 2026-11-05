"""
generate_dummy_data.py
Generator data dummy HPLC UDT (Uji Disolusi Terbanding)
- 3 Media pH: pH 1.2, pH 4.5, pH 6.8
- 1 Media Rilis: Air (Purified Water)
- 12 Vessel per media (V1 - V12)
- 7 Waktu sampling: 5', 10', 15', 20', 30', 45', 60'
- Produk Uji: Empagliflozin 25 mg (Batch F0048J26A)
- Produk Pembanding: Jardiance 25 mg (Batch F0006H26A)
- Standar SST: 5 injeksi standar utama (RSD < 1.0%)
- Bracketing Standards: BS Mid 2x, BS End 2x (Drift < 2.0%)
- Format output: CSV dan PDF (parseable oleh UDT Studio)
"""

import os
import random
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors

random.seed(42)

BASE_DIR = Path(r"C:\Users\Win 10\.gemini\antigravity\scratch\udt-assistant\sample-data")
CSV_DIR = BASE_DIR / "csv"
PDF_DIR = BASE_DIR / "pdf"
CSV_DIR.mkdir(parents=True, exist_ok=True)
PDF_DIR.mkdir(parents=True, exist_ok=True)

MEDIA_CONFIG = [
    {
        "id": "1.2",
        "code": "1.2",
        "name": "Buffer HCl pH 1.2",
        "nominal_curve": {
            5: (68.0, 70.0),
            10: (84.0, 86.0),
            15: (91.5, 93.0),
            20: (95.0, 96.5),
            30: (97.5, 98.5),
            45: (99.0, 99.5),
            60: (99.8, 100.2),
        }
    },
    {
        "id": "4.5",
        "code": "4.5",
        "name": "Buffer Asetat pH 4.5",
        "nominal_curve": {
            5: (34.0, 36.0),
            10: (54.0, 56.5),
            15: (69.0, 71.0),
            20: (78.0, 80.5),
            30: (86.5, 88.5),
            45: (92.5, 94.0),
            60: (96.0, 97.5),
        }
    },
    {
        "id": "6.8",
        "code": "6.8",
        "name": "Buffer Fosfat pH 6.8",
        "nominal_curve": {
            5: (45.0, 47.0),
            10: (65.0, 67.5),
            15: (78.5, 80.0),
            20: (85.0, 87.0),
            30: (91.5, 93.0),
            45: (95.5, 97.0),
            60: (98.5, 99.5),
        }
    },
    {
        "id": "Air",
        "code": "Air",
        "name": "Purified Water (Air)",
        "nominal_curve": {
            5: (28.0, 31.0),
            10: (48.0, 51.5),
            15: (63.0, 66.0),
            20: (73.0, 76.0),
            30: (82.5, 85.0),
            45: (89.5, 91.5),
            60: (93.5, 95.5),
        }
    }
]

PRODUCTS = {
    "test": {
        "product": "Empagliflozin 25 mg",
        "batch": "F0048J26A",
        "label": "Test",
        "file_prefix": "Empagliflozin_Test"
    },
    "ref": {
        "product": "Jardiance 25 mg",
        "batch": "F0006H26A",
        "label": "Ref",
        "file_prefix": "Jardiance_Ref"
    }
}

TIMEPOINTS = [5, 10, 15, 20, 30, 45, 60]
VESSELS = list(range(1, 13))

STD_100_AREA = 12500.0

def generate_sequence_rows(media_info, role_key):
    p_info = PRODUCTS[role_key]
    prod_name = p_info["product"].split()[0]
    batch = p_info["batch"]
    m_code = media_info["code"]
    curve = media_info["nominal_curve"]

    rows = []

    # 1. Standar Utama (5 Injeksi)
    for i in range(1, 6):
        rt = round(3.420 + random.uniform(-0.015, 0.015), 3)
        area = round(STD_100_AREA + random.uniform(-18.0, 18.0), 4)
        tail = round(1.10 + random.uniform(-0.02, 0.03), 2)
        plates = round(5450.0 + random.uniform(-60.0, 80.0), 1)
        name = f"Std {i} MD {m_code}"
        rows.append({"name": name, "rt": rt, "area": area, "tail": tail, "plates": plates, "type": "std"})

    # 2. Timepoints 5', 10', 15', 20' (V1 - V12)
    for t in [5, 10, 15, 20]:
        t_min, t_max = curve[t]
        for v in VESSELS:
            rt = round(3.420 + random.uniform(-0.020, 0.020), 3)
            # vessel to vessel variation
            v_bias = random.uniform(-1.2, 1.2)
            pct = random.uniform(t_min, t_max) + v_bias
            area = round((pct / 100.0) * STD_100_AREA + random.uniform(-15.0, 15.0), 4)
            tail = round(1.11 + random.uniform(-0.03, 0.04), 2)
            plates = round(5420.0 + random.uniform(-70.0, 90.0), 1)
            name = f"{prod_name} {batch} MD {m_code} {t}' {v}"
            rows.append({"name": name, "rt": rt, "area": area, "tail": tail, "plates": plates, "type": "sample"})

    # 3. Bracketing Mid (2 Injeksi)
    for i in range(1, 3):
        rt = round(3.420 + random.uniform(-0.015, 0.015), 3)
        area = round(STD_100_AREA + random.uniform(-20.0, 20.0), 4)
        tail = round(1.10 + random.uniform(-0.02, 0.03), 2)
        plates = round(5430.0 + random.uniform(-60.0, 70.0), 1)
        name = f"BS Mid {i} MD {m_code}"
        rows.append({"name": name, "rt": rt, "area": area, "tail": tail, "plates": plates, "type": "bsMid"})

    # 4. Timepoints 30', 45', 60' (V1 - V12)
    for t in [30, 45, 60]:
        t_min, t_max = curve[t]
        for v in VESSELS:
            rt = round(3.420 + random.uniform(-0.020, 0.020), 3)
            v_bias = random.uniform(-1.0, 1.0)
            pct = random.uniform(t_min, t_max) + v_bias
            area = round((pct / 100.0) * STD_100_AREA + random.uniform(-15.0, 15.0), 4)
            tail = round(1.11 + random.uniform(-0.03, 0.04), 2)
            plates = round(5420.0 + random.uniform(-70.0, 90.0), 1)
            name = f"{prod_name} {batch} MD {m_code} {t}' {v}"
            rows.append({"name": name, "rt": rt, "area": area, "tail": tail, "plates": plates, "type": "sample"})

    # 5. Bracketing End (2 Injeksi)
    for i in range(1, 3):
        rt = round(3.420 + random.uniform(-0.015, 0.015), 3)
        area = round(STD_100_AREA + random.uniform(-22.0, 22.0), 4)
        tail = round(1.10 + random.uniform(-0.02, 0.03), 2)
        plates = round(5410.0 + random.uniform(-60.0, 70.0), 1)
        name = f"BS End {i} MD {m_code}"
        rows.append({"name": name, "rt": rt, "area": area, "tail": tail, "plates": plates, "type": "bsEnd"})

    return rows

def write_csv(filepath, rows, title_meta):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# ChemStation Sequence Report\n")
        f.write(f"# Sequence: {title_meta.get('seq', 'UDT_ANALYSIS')}\n")
        f.write(f"# Operator: Analyst QA/QC\n")
        f.write(f"# Date: 2026-11-04 09:15:00\n")
        f.write(f"# Instrument: HPLC-02 Agilent 1260 Infinity II\n")
        f.write(f"# Method: DISSOLUTION_EMPAGLIFLOZIN.M\n")
        f.write(f"# Column: C18 4.6 x 150 mm, 5 um\n")
        f.write(f"# Medium: {title_meta.get('medium', 'Dissolution Medium')}\n")
        f.write(f"# Batch: {title_meta.get('batch', '')}\n")
        f.write(f"# Notes: 12 Vessels, Automated Sampler\n")
        f.write(f'"Sample Name","Ret. Time","Area","USP Tailing","USP Plate Count"\n')
        for r in rows:
            f.write(f'"{r["name"]}",{r["rt"]:.3f},{r["area"]:.4f},{r["tail"]:.2f},{r["plates"]:.1f}\n')

def write_pdf(filepath, rows, title_meta):
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
        c.drawString(40, height - 54, f"Sequence: {title_meta.get('seq', 'UDT_SEQ')} | Instrument: HPLC-02 | Operator: Analyst Lab | Method: DISS_EMPA.M")
        c.drawString(40, height - 66, f"Medium: {title_meta.get('medium', 'Dissolution Medium')} | Batch: {title_meta.get('batch', '')} | Page {page_num} of {total_pages}")
        
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
            # Highlight standards
            if r["type"] == "std":
                c.setFillColor(colors.HexColor("#003366"))
                c.setFont("Helvetica-Bold", 7.5)
            elif "bs" in r["type"].lower():
                c.setFillColor(colors.HexColor("#663300"))
                c.setFont("Helvetica-Bold", 7.5)
            else:
                c.setFillColor(colors.black)
                c.setFont("Helvetica", 7.5)

            # Columns at exact horizontal positions so itemsToLines produces space-delimited text on same y
            c.drawString(40, y, r["name"])
            c.drawString(290, y, f"{r['rt']:.3f}")
            c.drawString(360, y, f"{r['area']:.4f}")
            c.drawString(445, y, f"{r['tail']:.2f}")
            c.drawString(505, y, f"{r['plates']:.1f}")

            y -= 13.5

        # Footer Line
        c.setStrokeColor(colors.HexColor("#d2d2d7"))
        c.line(40, 35, width - 40, 35)
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#86868b"))
        c.drawString(40, 24, "Analytical Chemistry Laboratory - Data Integration Summary (Agilent ChemStation / Empower compatible)")
        c.drawRightString(width - 40, 24, f"Confidential & Proprietary - Generated for UDT Studio")

        c.showPage()

    c.save()

def main():
    print("Generating UDT Dummy Datasets (3 pH media + 1 release medium Air)...")
    
    all_test_rows = []
    all_ref_rows = []

    for med in MEDIA_CONFIG:
        m_id = med["id"]
        m_code = med["code"]
        m_name = med["name"]

        # 1. Generate Test Rows
        t_rows = generate_sequence_rows(med, "test")
        all_test_rows.extend(t_rows)
        t_csv = CSV_DIR / f"Empagliflozin_Test_pH_{m_code}.csv"
        t_pdf = PDF_DIR / f"Empagliflozin_Test_pH_{m_code}.pdf"
        t_meta = {
            "seq": f"SEQ_TEST_EMPA_MD_{m_code}",
            "medium": m_name,
            "batch": "Empagliflozin 25 mg (F0048J26A)"
        }
        write_csv(t_csv, t_rows, t_meta)
        write_pdf(t_pdf, t_rows, t_meta)
        print(f"  [OK] Test: {t_csv.name} & {t_pdf.name} ({len(t_rows)} rows)")

        # 2. Generate Ref Rows
        r_rows = generate_sequence_rows(med, "ref")
        all_ref_rows.extend(r_rows)
        r_csv = CSV_DIR / f"Jardiance_Ref_pH_{m_code}.csv"
        r_pdf = PDF_DIR / f"Jardiance_Ref_pH_{m_code}.pdf"
        r_meta = {
            "seq": f"SEQ_REF_JARD_MD_{m_code}",
            "medium": m_name,
            "batch": "Jardiance 25 mg (F0006H26A)"
        }
        write_csv(r_csv, r_rows, r_meta)
        write_pdf(r_pdf, r_rows, r_meta)
        print(f"  [OK] Ref : {r_csv.name} & {r_pdf.name} ({len(r_rows)} rows)")

    # 3. Generate Combined All-Media Files
    all_test_csv = CSV_DIR / "Empagliflozin_Test_AllMedia_4Media.csv"
    all_test_pdf = PDF_DIR / "Empagliflozin_Test_AllMedia_4Media.pdf"
    write_csv(all_test_csv, all_test_rows, {"seq": "SEQ_TEST_ALL_4MEDIA", "medium": "Multi-Media (pH 1.2, 4.5, 6.8, Air)", "batch": "Empagliflozin (F0048J26A)"})
    write_pdf(all_test_pdf, all_test_rows, {"seq": "SEQ_TEST_ALL_4MEDIA", "medium": "Multi-Media (pH 1.2, 4.5, 6.8, Air)", "batch": "Empagliflozin (F0048J26A)"})
    print(f"  [OK] Test Combined: {all_test_csv.name} & {all_test_pdf.name} ({len(all_test_rows)} rows)")

    all_ref_csv = CSV_DIR / "Jardiance_Ref_AllMedia_4Media.csv"
    all_ref_pdf = PDF_DIR / "Jardiance_Ref_AllMedia_4Media.pdf"
    write_csv(all_ref_csv, all_ref_rows, {"seq": "SEQ_REF_ALL_4MEDIA", "medium": "Multi-Media (pH 1.2, 4.5, 6.8, Air)", "batch": "Jardiance (F0006H26A)"})
    write_pdf(all_ref_pdf, all_ref_rows, {"seq": "SEQ_REF_ALL_4MEDIA", "medium": "Multi-Media (pH 1.2, 4.5, 6.8, Air)", "batch": "Jardiance (F0006H26A)"})
    print(f"  [OK] Ref Combined : {all_ref_csv.name} & {all_ref_pdf.name} ({len(all_ref_rows)} rows)")

    print("\nAll dummy data generated successfully!")

if __name__ == "__main__":
    main()
