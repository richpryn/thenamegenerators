"""Turn the ONS 'Baby names in England and Wales: 1996 to 2025' workbook into
content/data/ons-names.json, used by the name list pages for real ranks.

Usage: python3 scripts/data/ons-names.py <path to babynames1996to2025.xlsx>
Source: Office for National Statistics, Open Government Licence v3.0.
Kept per name: ranks in 2025, 2020, 2015, 2010, 2005 and 1996 (null if not
listed) and the 2025 count."""
import json, sys, openpyxl
YEARS = [2025, 2020, 2015, 2010, 2005, 1996]
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
out = {"source": "Office for National Statistics, Baby names in England and Wales: 1996 to 2025 (Open Government Licence v3.0)",
       "years": YEARS, "girl": {}, "boy": {}}
for sheet, key in (("Table_1", "girl"), ("Table_2", "boy")):
    rows = wb[sheet].iter_rows(values_only=True)
    header = None
    for r in rows:
        if r and r[0] == "Name": header = list(r); break
    col = {h: i for i, h in enumerate(header)}
    for r in rows:
        if not r or not r[0]: continue
        num = lambda v: v if isinstance(v, int) else None
        ranks = [num(r[col[f"{y} Rank"]]) for y in YEARS]
        if not any(ranks): continue
        out[key][str(r[0])] = ranks + [num(r[col["2025 Count"]])]
json.dump(out, open("content/data/ons-names.json", "w"), ensure_ascii=False, separators=(",", ":"))
print({k: len(out[k]) for k in ("girl", "boy")})
