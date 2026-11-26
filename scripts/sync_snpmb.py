"""
sync_snpmb.py — Ambil data resmi PTN & Program Studi SNBT dari snpmb.id,
hitung estimasi passing grade dari keketatan, lalu tulis data seed backend.

Sumber : https://snpmb.id/utbk-snbt/daya-tampung-snbt (data publik SNPMB)
         - daftar PTN      : /proxy-ptn-sb.php
         - prodi per PTN   : /proxy-prodi-sb.php?ptn=<id_ptn>
Output : backend/src/universities/data/ptn-snpmb.json

Pemakaian (dari root proyek):
    python scripts/sync_snpmb.py                # unduh (pakai cache jika ada) + build
    python scripts/sync_snpmb.py --refresh      # paksa unduh ulang semua data
    cd backend && npm run seed:universities

Peminatan (Saintek/Soshum) tidak tersedia di data SNPMB; diisi dari PTN_Jurusan.xlsx
(jika ada, butuh `pip install openpyxl`) lalu dari kata kunci nama prodi.

────────────────────────────────────────────────────────────────────────────
METODE ESTIMASI PASSING GRADE (skala SNBT 0–1000) — BUKAN angka resmi
────────────────────────────────────────────────────────────────────────────
SNPMB tidak mempublikasikan skor minimal per prodi. Estimasi diturunkan dari
keketatan (daya tampung ÷ peminat), dengan asumsi skor pendaftar berdistribusi
normal: makin kecil proporsi yang diterima, makin tinggi persentil skor batasnya.

  a_prodi = Σ daya_tampung / Σ peminat   (2 tahun data terakhir yang tersedia)
  a_ptn   = rasio yang sama untuk seluruh prodi S1 di PTN tsb (kualitas pool)
  z(a)    = Φ⁻¹(1 − a),  a dibatasi ke [0.008, 0.9]

  skor = 470 + 65·z(a_prodi) + w_ptn·z(a_ptn) − 90·[jenjang D3/D4]
         w_ptn = 60 untuk universitas/institut, 30 untuk politeknik
         dibatasi ke rentang [400, 780]

Prodi tanpa riwayat peminat (prodi baru) memakai z(a_ptn) untuk kedua suku.
Keterbatasan: tidak memperhitungkan sebaran skor tiap tahun, pilihan 1 vs 2,
atau jalur afirmasi; PTN dengan pendaftar lokal kecil dapat terestimasi rendah.
"""
import argparse, json, os, re, sys, time, urllib.request
from collections import Counter, defaultdict
from statistics import NormalDist

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'backend', 'src', 'universities', 'data', 'ptn-snpmb.json')
XLSX = os.path.join(ROOT, 'PTN_Jurusan.xlsx')
BASE = 'https://snpmb.id'
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Referer': BASE + '/utbk-snbt/daya-tampung-snbt'}

# ── Parameter model estimasi ─────────────────────────────────────────────
BASE_SCORE, W_PRODI, W_PTN, W_PTN_POLITEKNIK, VOKASI_PENALTY = 470, 65, 60, 30, 90
MIN_SCORE, MAX_SCORE, A_MIN, A_MAX, YEARS = 400, 780, 0.008, 0.9, 2

SHORT = {
    111: 'USK', 112: 'UNIMAL', 121: 'USU', 122: 'UNIMED', 131: 'UNRI', 141: 'UNAND', 142: 'UNP',
    151: 'UNJA', 161: 'UNIB', 171: 'UNSRI', 191: 'UNILA', 311: 'UNTIRTA', 321: 'UI', 322: 'UIN Jakarta',
    323: 'UNJ', 324: 'UPNVJ', 331: 'UNSIKA', 332: 'ITB', 333: 'UNPAD', 334: 'UPI', 336: 'UIN SGD',
    341: 'IPB', 342: 'UNSIL', 351: 'UNSOED', 352: 'UNTIDAR', 353: 'UNS', 354: 'ISI Surakarta',
    355: 'UNDIP', 356: 'UNNES', 357: 'UIN Walisongo', 361: 'UGM', 362: 'UNY', 363: 'UPNVY',
    364: 'ISI Yogyakarta', 365: 'UIN SUKA', 371: 'UNEJ', 372: 'UB', 373: 'UM', 374: 'UIN Malang',
    381: 'UNAIR', 382: 'ITS', 383: 'UNESA', 384: 'UTM', 385: 'UPNVJT', 511: 'UNTAN', 521: 'UPR',
    531: 'ULM', 541: 'UNMUL', 611: 'UNUD', 612: 'UNDIKSHA', 621: 'UNRAM', 631: 'UNDANA',
    711: 'UNHAS', 712: 'UNM', 713: 'UIN Alauddin', 721: 'UNSRAT', 731: 'UNTAD', 751: 'UHO',
    811: 'UNPATTI', 911: 'UNCEN', 913: 'ISBI Tanah Papua',
}

UPPER_KEEP = {'UPN', 'ISI', 'ISBI', 'PSDKU', 'PDSKU', 'PGSD', 'PAUD', 'PG', 'PGPAUD', 'PPKN', 'PJKR', 'DKV',
              'NK', 'MBD', 'ARU', 'TOUNA', 'FITB', 'FTTM', 'SF', 'FTMD', 'FSRD', 'SBM', 'UPI', 'PWK', 'IP',
              'SI', 'IH', 'IKS', 'ITS', 'IPA', 'IPS', 'D3', 'D4', 'S1', 'II', 'III', 'IV', 'TIK', 'K3', 'UIN',
              'IAIN', 'STAIN', 'STEI', 'FTI', 'FTSL', 'SAPPK', 'SITH', 'SIKIA', 'GLR', 'IPB', 'ITB', 'UGM',
              'UI', 'ITK', 'ITERA', 'ISBI', 'PKN', 'SMK', 'SD', 'SMP', 'SMA', 'IT', 'TV', 'PLB', 'BK'}
LOWER_KEEP = {'dan', 'di', 'dari', 'untuk', 'serta', 'atau', 'yang', 'pada', 'ke'}


def title(s):
    s = re.sub(r'\s+', ' ', (s or '').strip())

    def word(w, first):
        core = re.sub(r'[^A-Za-z0-9]', '', w)
        if core.upper() in UPPER_KEEP:
            return w.upper()
        if not first and w.lower() in LOWER_KEEP:
            return w.lower()
        return re.sub(r'[A-Za-z0-9]+', lambda m: m.group(0).upper() if m.group(0).upper() in UPPER_KEEP
                      else m.group(0)[0].upper() + m.group(0)[1:].lower(), w)

    return ' '.join(word(w, i == 0) for i, w in enumerate(s.split(' ')))


# ── Unduh dengan cache ────────────────────────────────────────────────────
def fetch_json(url, path, refresh):
    if not refresh and os.path.exists(path) and os.path.getsize(path) > 0:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read().decode('utf-8'))
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False)
            time.sleep(0.7)  # sopan terhadap server SNPMB
            return data
        except Exception as e:  # noqa: BLE001
            print(f'  ! gagal ({e}), ulang {attempt + 1}/4', file=sys.stderr)
            time.sleep(3 * (attempt + 1))
    raise SystemExit(f'Gagal mengunduh {url}')


# ── Peminatan ─────────────────────────────────────────────────────────────
SAINTEK_KW = [
    'teknik', 'teknologi', 'informatika', 'komputer', 'sistem informasi', 'matematika', 'fisika', 'kimia',
    'biologi', 'statistik', 'kedokteran', 'dokter', 'farmasi', 'keperawatan', 'kebidanan', 'gizi',
    'kesehatan', 'agro', 'pertanian', 'peternakan', 'perikanan', 'kehutanan', 'kelautan', 'geologi',
    'geofisika', 'geodesi', 'geomatika', 'arsitektur', 'perencanaan wilayah', 'aktuaria', 'sains',
    'ilmu tanah', 'budidaya', 'akuakultur', 'mesin', 'elektro', 'sipil', 'biomedis', 'bioteknologi',
    'oseanografi', 'meteorologi', 'rekayasa', 'sains data', 'gigi', 'hewan', 'veteriner', 'fisioterapi',
    'radiologi', 'analis', 'lingkungan', 'pangan', 'perkebunan', 'agroteknologi', 'agronomi', 'otomasi',
    'mekatronika', 'listrik', 'elektronika', 'telekomunikasi', 'manufaktur', 'kimia', 'pertambangan',
    'perminyakan', 'metalurgi', 'material', 'penerbangan', 'aeronautika', 'perkapalan', 'akupunktur',
    'sanitasi', 'laboratorium', 'optometri', 'ipa', 'astronomi', 'kesehatan masyarakat', 'epidemiologi',
    'budi daya', 'ternak', 'hortikultura', 'tanaman', 'benih', 'hasil hutan', 'perairan',
]
SOSHUM_FIRST = ['pendidikan teknologi informasi', 'teknologi pendidikan', 'ekonomi', 'akuntansi', 'manajemen',
                'bisnis', 'hukum']


def classify(name):
    n = name.lower()
    if any(k in n for k in SOSHUM_FIRST) and not any(k in n for k in ('teknik industri', 'teknologi pangan')):
        return 'SOSHUM'
    if any(k in n for k in SAINTEK_KW):
        return 'SAINTEK'
    return 'SOSHUM'


def norm_name(s):
    s = re.sub(r'\((sarjana|diploma iii|diploma iv|sarjana terapan|d4)\)', '', (s or '').lower())
    return re.sub(r'[^a-z0-9]', '', s)


def excel_peminatan():
    """{(id_ptn, nama_norm, jenjang): peminatan} dan {nama_norm: peminatan mayoritas}"""
    if not os.path.exists(XLSX):
        return {}, {}
    try:
        import openpyxl
    except ImportError:
        print('  (openpyxl tidak terpasang — peminatan dari Excel dilewati)', file=sys.stderr)
        return {}, {}
    ws = openpyxl.load_workbook(XLSX, read_only=True).active
    exact, votes = {}, defaultdict(Counter)
    for r in list(ws.iter_rows(values_only=True))[1:]:
        if not r[0] or not r[3] or not r[5] or not str(r[5]).strip():
            continue
        pem = str(r[5]).strip().upper()
        key = norm_name(r[3])
        exact[(int(r[0]), key, (r[4] or 'S1').strip().upper())] = pem
        votes[key][pem] += 1
    return exact, {k: v.most_common(1)[0][0] for k, v in votes.items()}


# ── Model estimasi ────────────────────────────────────────────────────────
N = NormalDist()


def z_of(a):
    return N.inv_cdf(1 - min(max(a, A_MIN), A_MAX))


def recent_history(p):
    h = [x for x in (p.get('history_daya_tampung') or []) if x.get('peminat') and x.get('daya_tampung')]
    return sorted(h, key=lambda x: x['tahun'])[-YEARS:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--refresh', action='store_true', help='unduh ulang walau cache ada')
    ap.add_argument('--cache', default=os.path.join(ROOT, 'scripts', '.cache-snpmb'))
    args = ap.parse_args()
    os.makedirs(os.path.join(args.cache, 'prodi'), exist_ok=True)

    print('Mengambil daftar PTN SNBT dari snpmb.id ...')
    ptns = fetch_json(f'{BASE}/proxy-ptn-sb.php', os.path.join(args.cache, 'ptn.json'), args.refresh)
    prodi = []
    for i, u in enumerate(ptns, 1):
        pid = u['id_ptn']
        data = fetch_json(f'{BASE}/proxy-prodi-sb.php?ptn={pid}',
                          os.path.join(args.cache, 'prodi', f'{pid}.json'), args.refresh)
        prodi.extend(data)
        if i % 20 == 0:
            print(f'   {i}/{len(ptns)} PTN')
    print(f'{len(ptns)} PTN, {len(prodi)} program studi')

    ptn_by_id = {u['id_ptn']: u for u in ptns}

    # Pool kualitas per PTN (S1; politeknik pakai semua prodi)
    agg_s1, agg_all = defaultdict(lambda: [0, 0]), defaultdict(lambda: [0, 0])
    for p in prodi:
        for x in recent_history(p):
            agg_all[p['id_ptn']][0] += x['daya_tampung']; agg_all[p['id_ptn']][1] += x['peminat']
            if p['jenjang'] == 'S1':
                agg_s1[p['id_ptn']][0] += x['daya_tampung']; agg_s1[p['id_ptn']][1] += x['peminat']
    z_ptn = {}
    for pid in ptn_by_id:
        a = agg_s1[pid] if agg_s1[pid][1] else agg_all[pid]
        z_ptn[pid] = z_of(a[0] / a[1]) if a[1] else 0.0

    exact_pem, vote_pem = excel_peminatan()

    universities = []
    for u in sorted(ptns, key=lambda x: x['id_ptn']):
        prov = (u.get('provinsi') or [{}])[0]
        kategori = 'PTKIN' if u.get('is_ptkin') else 'Vokasi' if u.get('is_vokasi') else 'Akademik'
        universities.append({
            'id': u['id_ptn'], 'name': title(u['nama']), 'shortName': SHORT.get(u['id_ptn']),
            'province': prov.get('nama_prov1'), 'city': prov.get('nama_kota') if prov.get('nama_kota') not in (None, '-') else None,
            'kategori': kategori, 'isPtnBh': bool(u.get('is_ptnbh')), 'website': u.get('web') or None,
        })

    majors, pem_src = [], Counter()
    for p in prodi:
        pid, jen = p['id_ptn'], (p.get('jenjang') or 'S1').upper()
        h = recent_history(p)
        zp_ptn = z_ptn.get(pid, 0.0)
        zp = z_of(sum(x['daya_tampung'] for x in h) / sum(x['peminat'] for x in h)) if h else zp_ptn
        w = W_PTN_POLITEKNIK if ptn_by_id[pid].get('is_vokasi') else W_PTN
        raw = BASE_SCORE + W_PRODI * zp + w * zp_ptn - (VOKASI_PENALTY if jen != 'S1' else 0)
        pg = round(min(max(raw, MIN_SCORE), MAX_SCORE))

        key = norm_name(p['nama'])
        if (pid, key, jen) in exact_pem:
            pem = exact_pem[(pid, key, jen)]; pem_src['excel'] += 1
        elif key in vote_pem:
            pem = vote_pem[key]; pem_src['excel-nama'] += 1
        else:
            pem = classify(p['nama']); pem_src['kata-kunci'] += 1

        last = h[-1] if h else None
        dt = p.get('daya_tampung_snbt')
        porto = p.get('nama_portofolio')
        majors.append({
            'id': p['id_prodi'], 'universityId': pid, 'name': title(p['nama']), 'jenjang': jen,
            'peminatan': pem,
            'dayaTampung': int(dt) if str(dt or '').isdigit() else None,
            'peminat': last['peminat'] if last else None,
            'peminatTahun': last['tahun'] if last else None,
            'portofolio': porto if porto and porto != 'Tidak Ada' else None,
            'passingGrade': pg,
        })

    majors.sort(key=lambda m: m['id'])
    out = {
        'source': BASE + '/utbk-snbt/daya-tampung-snbt',
        'generatedAt': time.strftime('%Y-%m-%d'),
        'universities': universities,
        'majors': majors,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'Tersimpan: {OUT}')
    print(f'   {len(universities)} PTN, {len(majors)} prodi · peminatan: {dict(pem_src)}')
    print(f'   kategori PTN: {dict(Counter(u["kategori"] for u in universities))}')


if __name__ == '__main__':
    main()
