#!/usr/bin/env python3
"""Mechanical PR gate for AllusionistWikiLab.

Usage: pr_gate_checks.py <base_sha> <head_sha>
Prints GITHUB_OUTPUT lines:
  verdict=PASS|FAIL
  reasons=<semicolon separated>

Checks (all deterministic, no LLM):
  - protected files untouched (build/config/workflow surface)
  - all changed paths under content/
  - deletion ratio vs base content size
  - new external links (non-allowlisted hosts)
"""
import subprocess
import sys
import re

PROTECTED = (
    "quartz/",
    ".github/",
    "scripts/",
    "audit/",
    "quartz.config.ts",
    "quartz.layout.ts",
    "package.json",
    "package-lock.json",
    ".gitignore",
    "globals.d.ts",
)
ALLOWED_PREFIX = "content/"
ALLOWED_HOSTS = (
    "github.com",
    "github.io",
    "tally.so",
    "echothread.io",
)
MAX_DELETE_RATIO = 0.30
MAX_NEW_EXT_LINKS = 5


def sh(cmd: str) -> str:
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout


def main() -> int:
    base, head = sys.argv[1], sys.argv[2]
    reasons = []
    numstat = sh(f"git diff --numstat {base}...{head}")
    total_deleted = 0
    ext_links = 0
    for line in numstat.strip().splitlines():
        if not line.strip():
            continue
        parts = line.split("\t", 2)
        if len(parts) != 3:
            continue
        a, d, path = parts
        if path.startswith(PROTECTED):
            reasons.append(f"protected file changed: {path}")
        if not path.startswith(ALLOWED_PREFIX):
            reasons.append(f"path outside content/: {path}")
        if d != "-":
            total_deleted += int(d)
        if a != "-" and int(a) > 0:
            diff_text = sh(f"git diff {base}...{head} -- {path}")
            for m in re.finditer(r"https?://[^\s\)\]\"'<>]+", diff_text):
                host = m.group(0).split("//")[1].split("/")[0].lower()
                if not any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS):
                    ext_links += 1
    base_lines = int(
        sh(f"git grep -c '' {base} -- content | awk -F: '{{s+=$3}} END {{print s+0}}'").strip()
        or 0
    )
    if base_lines and total_deleted / base_lines > MAX_DELETE_RATIO:
        reasons.append(
            f"deletion ratio {total_deleted}/{base_lines} > {MAX_DELETE_RATIO}"
        )
    if ext_links > MAX_NEW_EXT_LINKS:
        reasons.append(f"new external links: {ext_links} > {MAX_NEW_EXT_LINKS}")
    verdict = "PASS" if not reasons else "FAIL"
    print(f"verdict={verdict}")
    print("reasons=" + "; ".join(reasons).replace("\n", " "))
    return 0


if __name__ == "__main__":
    sys.exit(main())
