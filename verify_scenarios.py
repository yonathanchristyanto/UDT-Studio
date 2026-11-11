"""
verify_scenarios.py
Verifikasi hasil kalkulasi untuk keempat skenario demo
"""
import math
from pathlib import Path

BASE_DIR = Path(r"C:\Users\Win 10\.gemini\antigravity\scratch\udt-assistant\sample-data\demo-package")

def parse_csv(filepath):
    lines = filepath.read_text(encoding='utf-8').splitlines()
    # find header
    header_idx = -1
    for i, l in enumerate(lines):
        if "Sample Name" in l:
            header_idx = i
            break
    if header_idx == -1:
        return {}
    
    samples = {} # (time, vessel) -> area
    stds = []
    
    for l in lines[header_idx + 1:]:
        if not l.strip():
            continue
        parts = [p.strip('"') for p in l.split(',')]
        name = parts[0]
        try:
            area = float(parts[2] if len(parts) > 2 else parts[1])
        except ValueError:
            continue
            
        if "Std" in name or "Standar" in name:
            stds.append(area)
        else:
            # parse time and vessel
            tokens = name.split()
            # find token with '
            t = None
            v = None
            for idx, tok in enumerate(tokens):
                if "'" in tok:
                    t = int(tok.replace("'", ""))
                    if idx + 1 < len(tokens):
                        v = int(tokens[idx + 1])
            if t is not None and v is not None:
                samples[(t, v)] = area
    return {"samples": samples, "stds": stds}

def eval_f2(times, r_means, t_means, r_rsds, t_rsds):
    idx15 = times.index(15) if 15 in times else -1
    both85at15 = (idx15 >= 0 and r_means[idx15] >= 85 and t_means[idx15] >= 85)
    
    cutoff_idx = len(times) - 1
    for i in range(len(times)):
        if r_means[i] >= 85 and t_means[i] >= 85:
            cutoff_idx = i
            break
            
    n = cutoff_idx + 1
    used_r = r_means[:n]
    used_t = t_means[:n]
    
    sum_sq = sum((used_r[i] - used_t[i])**2 for i in range(n))
    factor = (1 + sum_sq / n)**(-0.5)
    f2 = 50 * math.log10(factor * 100)
    
    rsd_exceeded = []
    for i in range(n):
        limit = 20 if i == 0 else 10
        if r_rsds[i] > limit or t_rsds[i] > limit:
            rsd_exceeded.append((times[i], limit, r_rsds[i], t_rsds[i]))
            
    return {
        "both85at15": both85at15,
        "f2": f2,
        "n": n,
        "cutoff_time": times[cutoff_idx],
        "rsd_exceeded": rsd_exceeded,
        "is_similar": 50 <= f2 <= 100
    }

def analyze_scenario(folder_name, test_file, ref_file, times, std_nom):
    p_test = BASE_DIR / folder_name / "csv" / test_file
    p_ref = BASE_DIR / folder_name / "csv" / ref_file
    
    d_test = parse_csv(p_test)
    d_ref = parse_csv(p_ref)
    
    std_test = sum(d_test["stds"]) / len(d_test["stds"]) if d_test["stds"] else std_nom
    std_ref = sum(d_ref["stds"]) / len(d_ref["stds"]) if d_ref["stds"] else std_nom
    
    t_means = []
    t_rsds = []
    r_means = []
    r_rsds = []
    
    for t in times:
        t_vals = [d_test["samples"][(t, v)] / std_test * 100 for v in range(1, 13) if (t, v) in d_test["samples"]]
        r_vals = [d_ref["samples"][(t, v)] / std_ref * 100 for v in range(1, 13) if (t, v) in d_ref["samples"]]
        
        t_m = sum(t_vals)/len(t_vals)
        t_sd = (sum((x - t_m)**2 for x in t_vals) / (len(t_vals) - 1))**0.5
        t_rsd = (t_sd / t_m) * 100
        
        r_m = sum(r_vals)/len(r_vals)
        r_sd = (sum((x - r_m)**2 for x in r_vals) / (len(r_vals) - 1))**0.5
        r_rsd = (r_sd / r_m) * 100
        
        t_means.append(t_m)
        t_rsds.append(t_rsd)
        r_means.append(r_m)
        r_rsds.append(r_rsd)
        
    res = eval_f2(times, r_means, t_means, r_rsds, t_rsds)
    return res, times, r_means, t_means, r_rsds, t_rsds

print("=== VERIFIKASI 4 SKENARIO DATA SIMULASI DEMO ===")

# 1. Empagliflozin pH 1.2
res1a, times1a, r1a, t1a, r_rsd1a, t_rsd1a = analyze_scenario(
    "01_Empagliflozin_HPLC_Similar_and_VeryRapid",
    "Empagliflozin_Test_pH_1.2.csv", "Jardiance_Ref_pH_1.2.csv",
    [5, 10, 15, 20, 30, 45, 60], 12500.0
)
print(f"\n[Skenario 1 - pH 1.2 (Empagliflozin vs Jardiance)]")
print(f"  Very Rapid (@15' >= 85%): {res1a['both85at15']} (Ref@15'={r1a[2]:.1f}%, Test@15'={t1a[2]:.1f}%)")
print(f"  f2: {res1a['f2']:.2f}, n={res1a['n']}, Cutoff={res1a['cutoff_time']}', Similar={res1a['is_similar']}")

# 1b. Empagliflozin pH 4.5
res1b, times1b, r1b, t1b, _, _ = analyze_scenario(
    "01_Empagliflozin_HPLC_Similar_and_VeryRapid",
    "Empagliflozin_Test_pH_4.5.csv", "Jardiance_Ref_pH_4.5.csv",
    [5, 10, 15, 20, 30, 45, 60], 12500.0
)
print(f"\n[Skenario 1 - pH 4.5 (Empagliflozin vs Jardiance)]")
print(f"  Very Rapid: {res1b['both85at15']}, f2: {res1b['f2']:.2f}, n={res1b['n']}, Cutoff={res1b['cutoff_time']}', Similar={res1b['is_similar']}")

# 2. Candesartan pH 6.8 (Not Similar)
res2, times2, r2, t2, _, _ = analyze_scenario(
    "02_Candesartan_HPLC_NotSimilar",
    "Candesartan_Test_pH_6.8_NotSimilar.csv", "Blopress_Ref_pH_6.8.csv",
    [5, 10, 15, 30, 45, 60], 15200.0
)
print(f"\n[Skenario 2 - pH 6.8 (Candesartan vs Blopress)]")
print(f"  f2: {res2['f2']:.2f}, n={res2['n']}, Cutoff={res2['cutoff_time']}', Similar={res2['is_similar']}")
print(f"  Status: {'SIMILAR' if res2['is_similar'] else 'NOT SIMILAR (GAGAL)'}")

# 3. Metformin pH 6.8 (UV Cary 60)
res3, times3, r3, t3, _, _ = analyze_scenario(
    "03_Metformin_UV_Cary60_Rapid",
    "Metformin_Test_pH_6.8_Cary60.csv", "Glucophage_Ref_pH_6.8_Cary60.csv",
    [5, 10, 15, 20, 30, 45], 0.5250
)
print(f"\n[Skenario 3 - pH 6.8 UV Cary 60 (Metformin vs Glucophage)]")
print(f"  Very Rapid (@15' >= 85%): {res3['both85at15']} (Ref@15'={r3[2]:.1f}%, Test@15'={t3[2]:.1f}%)")
print(f"  f2: {res3['f2']:.2f}, n={res3['n']}, Similar={res3['is_similar']}")

# 4. Atorvastatin pH 4.5 (High RSD Warning)
res4, times4, r4, t4, r_rsd4, t_rsd4 = analyze_scenario(
    "04_Atorvastatin_HPLC_HighRSD_Warning",
    "Atorvastatin_Test_pH_4.5_HighRSD.csv", "Lipitor_Ref_pH_4.5.csv",
    [5, 10, 15, 20, 30, 45, 60], 18500.0
)
print(f"\n[Skenario 4 - pH 4.5 (Atorvastatin vs Lipitor)]")
print(f"  f2: {res4['f2']:.2f}, Similar: {res4['is_similar']}")
print(f"  RSD Exceeded: {bool(res4['rsd_exceeded'])}")
for t, limit, r_rsd, t_rsd in res4['rsd_exceeded']:
    print(f"    -> Menit {t}': Batas {limit}%, Ref RSD = {r_rsd:.1f}%, Test RSD = {t_rsd:.1f}% (Melanggar Regulasi!)")
