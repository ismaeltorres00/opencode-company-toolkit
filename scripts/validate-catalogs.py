#!/usr/bin/env python3
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1] / "catalogs"
errors = []
for index in root.glob("*/index.json"):
    catalog = json.loads(index.read_text(encoding="utf-8"))
    for skill in catalog.get("skills", []):
        name = skill.get("name")
        version = skill.get("version")
        files = skill.get("files", [])
        if not name or not version or not files:
            errors.append(f"{index}: invalid entry {skill}")
            continue
        for f in files:
            path = index.parent / name / f
            if not path.is_file():
                errors.append(f"{index}: missing {name}/{f}")
        if not any(f in ("SKILL.md", f"{name}.md") for f in files):
            errors.append(f"{index}: {name} needs SKILL.md or {name}.md")
if errors:
    print("\n".join(errors))
    sys.exit(1)
print("Catalog validation OK")
