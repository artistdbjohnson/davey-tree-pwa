#!/usr/bin/env python3
"""Static gates for the Davey Tree design-study PWA."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_DESC = (
    "With over 130 years of experience, you can rely on Davey’s safe, "
    "professional tree services for your home, like tree trimming, tree health "
    "inspections, tree removal, tree fertilization, and cabling and bracing. "
    "Find a local office near you to schedule a free tree consultation today."
)
FAILS: list[str] = []


def fail(msg: str) -> None:
    FAILS.append(msg)


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.exists():
        fail(f"missing {rel}")
        return ""
    return path.read_text(encoding="utf-8")


def main() -> int:
    vercel = json.loads(read("vercel.json") or "{}")
    if vercel.get("cleanUrls") is not True:
        fail("vercel.json cleanUrls must be true")
    if vercel.get("trailingSlash") is not False:
        fail("vercel.json trailingSlash must be false")
    extra = set(vercel) - {"cleanUrls", "trailingSlash"}
    if extra:
        fail(f"vercel.json has extra keys: {sorted(extra)}")

    index = read("index.html")
    meta = re.search(r'<meta name="description" content="([^"]+)"', index)
    if not meta:
        fail("index.html missing meta description")
    else:
        got = meta.group(1).replace("&amp;", "&").replace("&#x2019;", "’")
        if got != OFFICIAL_DESC:
            fail(f"index meta description is not the official line: {got!r}")
        if got.endswith("...") or "Davey Tree." == got[-11:]:
            fail("index meta description is still truncated")

    for tag in ("og:title", "og:description", "og:image", "twitter:description"):
        if f'property="{tag}"' not in index and f'name="{tag}"' not in index:
            fail(f"index.html missing {tag}")

    css = read("css/app.css")
    js = read("js/app.js")
    if ".liquid-glass" not in css:
        fail("css missing .liquid-glass")
    if "--r: 5px" not in css:
        fail("css missing 5px craft radius")
    if "prefers-reduced-motion" not in css:
        fail("css missing reduced-motion gate")
    if "visibilitychange" not in js:
        fail("js missing visibility gate")
    if "prefers-reduced-motion" not in js:
        fail("js missing reduced-motion gate")
    if "IntersectionObserver" not in js:
        fail("js missing visibility/offscreen gate")
    if "requestAnimationFrame" not in js:
        fail("js missing rAF-owned motion")
    if "translate3d" not in js:
        fail("js missing compositor translate3d")
    if "[hidden]" not in css:
        fail("css missing [hidden] override")
    if "serviceWorker" not in js:
        fail("js missing service worker registration")
    if "dt-theme" not in js or "dt-lang" not in js:
        fail("js missing persisted theme/lang keys")

    manifest = json.loads(read("manifest.json") or "{}")
    if manifest.get("display") != "standalone":
        fail("manifest is not installable standalone")
    if not manifest.get("icons"):
        fail("manifest missing icons")

    for rel in (
        "sw.js",
        "manifest.json",
        "icons/icon.svg",
        "icons/icon-192.svg",
        "icons/icon-512.svg",
        "images/grain.svg",
        "images/hero.jpg",
        "images/canopy.jpg",
        "residential/index.html",
        "commercial/index.html",
        "utility/index.html",
        "environmental/index.html",
        "about/index.html",
        "contact/index.html",
    ):
        if not (ROOT / rel).exists():
            fail(f"missing {rel}")

    pages = [
        "index.html",
        "residential/index.html",
        "commercial/index.html",
        "utility/index.html",
        "environmental/index.html",
        "about/index.html",
        "contact/index.html",
    ]
    for rel in pages:
        html = read(rel)
        if "Independent design study" not in html:
            fail(f"{rel} missing independent design-study disclaimer")
        if "liquid-glass" not in html:
            fail(f"{rel} missing liquid-glass chrome")
        if "built by dglxss" not in html:
            fail(f"{rel} missing built by dglxss attribution")
        if "data-set-lang" not in html or "data-set-theme" not in html:
            fail(f"{rel} missing EN|PT or dark|light chrome")
        if "..." in html and "og:description" in html:
            # allow ellipsis only if not in a meta content attribute
            if re.search(r'content="[^"]*\.\.\.', html):
                fail(f"{rel} has truncated meta/OG line")

    banned = "hello@" + "dglxss.com"
    for path in ROOT.rglob("*"):
        if ".git" in path.parts or path.is_dir():
            continue
        if path.suffix.lower() in {".png", ".webp", ".jpg", ".jpeg", ".gif", ".mp4"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if banned in text:
            fail(f"{path.relative_to(ROOT)} contains forbidden email")

    if FAILS:
        print("FAIL")
        for item in FAILS:
            print(f"- {item}")
        return 1
    print("PASS")
    print("official meta, OG, liquid glass, PWA, vercel.json, motion gates")
    return 0


if __name__ == "__main__":
    sys.exit(main())
