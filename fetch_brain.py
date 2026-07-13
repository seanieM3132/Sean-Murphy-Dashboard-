"""
Fetch YouTube video titles and transcripts to build the LLM knowledge brain.
Outputs a JSON file: brain/videos.json
"""

import json
import os
import re
import sys
import time
from pathlib import Path

# All video URLs (deduplicated)
URLS = [
    "https://www.youtube.com/watch?v=agoD8Cvcz9E",
    "https://www.youtube.com/watch?v=uCYWvl8Dftc",
    "https://www.youtube.com/watch?v=abyhMBRo1bM",
    "https://www.youtube.com/watch?v=vJlExc2eJpI",
    "https://www.youtube.com/watch?v=CqP9a-EMr14",
    "https://www.youtube.com/watch?v=qzvImHRTooI",
    "https://www.youtube.com/watch?v=e_f97qwgcDo",
    "https://www.youtube.com/watch?v=V35DEKzZHKk",
    "https://www.youtube.com/watch?v=q37ARYnRDGc",
    "https://www.youtube.com/watch?v=n28W4AmvMDE",
    "https://www.youtube.com/watch?v=wTBSGgbIvsY",
    "https://www.youtube.com/watch?v=ddq8JIMhz7c",
    "https://www.youtube.com/watch?v=U6dnOVth7-I",
    "https://www.youtube.com/watch?v=RmwbNdyrilk",
    "https://www.youtube.com/watch?v=K-TW2Chpz4k",
    "https://www.youtube.com/watch?v=Pmd6knanPKw",
    "https://www.youtube.com/watch?v=lIo9FcrljDk",
    "https://www.youtube.com/watch?v=iw97uvIge7c",
    "https://www.youtube.com/watch?v=qUz93CyNIz0",
    "https://www.youtube.com/watch?v=OLQRAMZi--c",
    "https://www.youtube.com/watch?v=zYuw-8pwnp8",
    "https://www.youtube.com/watch?v=KBkl3I645c8",
    "https://www.youtube.com/watch?v=vP-JD_IdoBY",
    "https://www.youtube.com/watch?v=-iQw0fSxZ58",
    "https://www.youtube.com/watch?v=83704QVpqQU",
    "https://www.youtube.com/watch?v=rwYMq71l_2M",
    "https://www.youtube.com/watch?v=HEsigW2ASvg",
    "https://www.youtube.com/watch?v=_2JKRAQdR2Q",
    "https://www.youtube.com/shorts/_sfTLMEoPNw",
    "https://www.youtube.com/watch?v=LEh08JCnUmQ",
    "https://www.youtube.com/watch?v=2EsLsxl5dtE",
    "https://www.youtube.com/watch?v=hXeOcENzdNM",
    "https://www.youtube.com/watch?v=RaYradx6JXg",
    "https://www.youtube.com/watch?v=OLBVF8rts0A",
    "https://www.youtube.com/watch?v=Xy7ccu44tl8",
    "https://www.youtube.com/watch?v=DZER3GNmEwo",
    "https://www.youtube.com/watch?v=IcQXkzMvvlQ",
    "https://www.youtube.com/watch?v=-hZJ1CADebQ",
    "https://www.youtube.com/watch?v=qK6Rh_XODFw",
    "https://www.youtube.com/watch?v=neOoDUAjX2o",
    "https://www.youtube.com/watch?v=UOXD_0ctRYs",
    "https://www.youtube.com/watch?v=LNZJgbVAEKI",
    "https://www.youtube.com/watch?v=59qFZsNhI8s",
    "https://www.youtube.com/watch?v=pK5jcQalrSs",
    "https://www.youtube.com/watch?v=RSJIp7e7fyY",
    "https://www.youtube.com/watch?v=onv3QA6DC4Y",
    "https://www.youtube.com/watch?v=07NXgqFnnls",
    "https://www.youtube.com/watch?v=uCZ1zyr_sqI",
    "https://www.youtube.com/watch?v=2hAWlREjqRk",
]

# Playlist to expand later if needed
PLAYLIST = "https://www.youtube.com/playlist?list=PLCGIzmTE4d0jJ8nngB9Szd8uWwuEPD4QD"


def extract_video_id(url):
    """Extract video ID from various YouTube URL formats."""
    patterns = [
        r'(?:v=|/v/|youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:shorts/)([a-zA-Z0-9_-]{11})',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


def get_metadata(video_id):
    """Fetch video title and channel using yt-dlp (no download)."""
    import subprocess
    result = subprocess.run(
        [
            sys.executable, "-m", "yt_dlp",
            "--skip-download",
            "--print", "%(title)s|||%(channel)s|||%(duration)s|||%(upload_date)s",
            "--no-warnings",
            f"https://www.youtube.com/watch?v={video_id}",
        ],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode == 0 and result.stdout.strip():
        parts = result.stdout.strip().split("|||")
        if len(parts) >= 4:
            return {
                "title": parts[0],
                "channel": parts[1],
                "duration_sec": int(parts[2]) if parts[2].isdigit() else 0,
                "upload_date": parts[3],
            }
    return None


def get_transcript(video_id):
    """Fetch transcript using yt-dlp subtitle extraction."""
    import subprocess
    import tempfile

    with tempfile.TemporaryDirectory() as tmpdir:
        sub_path = os.path.join(tmpdir, "sub")
        # Try auto-subs first (covers most videos), then manual subs
        # Use browser cookies to bypass IP blocks
        result = subprocess.run(
            [
                sys.executable, "-m", "yt_dlp",
                "--skip-download",
                "--write-auto-sub",
                "--write-sub",
                "--sub-lang", "en",
                "--sub-format", "json3",
                "--output", sub_path,
                "--no-warnings",
                "--cookies-from-browser", "chrome",
                f"https://www.youtube.com/watch?v={video_id}",
            ],
            capture_output=True, text=True, timeout=60,
        )

        # Look for the subtitle file
        sub_file = None
        for ext in [".en.json3", ".en.json3"]:
            candidate = sub_path + ext
            if os.path.exists(candidate):
                sub_file = candidate
                break

        # Also check for any json3 file in tmpdir
        if not sub_file:
            for f in os.listdir(tmpdir):
                if f.endswith(".json3"):
                    sub_file = os.path.join(tmpdir, f)
                    break

        if not sub_file:
            # Try vtt format as fallback
            result2 = subprocess.run(
                [
                    sys.executable, "-m", "yt_dlp",
                    "--skip-download",
                    "--write-auto-sub",
                    "--write-sub",
                    "--sub-lang", "en",
                    "--sub-format", "vtt",
                    "--output", sub_path,
                    "--no-warnings",
                    "--cookies-from-browser", "chrome",
                    f"https://www.youtube.com/watch?v={video_id}",
                ],
                capture_output=True, text=True, timeout=60,
            )
            for f in os.listdir(tmpdir):
                if f.endswith(".vtt"):
                    sub_file = os.path.join(tmpdir, f)
                    break

        if not sub_file:
            return f"TRANSCRIPT_ERROR: no subtitles found"

        with open(sub_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse based on format
        if sub_file.endswith(".json3"):
            try:
                data = json.load(open(sub_file, "r", encoding="utf-8"))
                events = data.get("events", [])
                lines = []
                for ev in events:
                    if "segs" not in ev:
                        continue
                    start_ms = ev.get("tStartMs", 0)
                    start_s = start_ms / 1000
                    mins = int(start_s // 60)
                    secs = int(start_s % 60)
                    text = "".join(seg.get("utf8", "") for seg in ev["segs"]).strip()
                    if text and text != "\n":
                        lines.append(f"[{mins:02d}:{secs:02d}] {text}")
                return "\n".join(lines) if lines else "TRANSCRIPT_ERROR: empty json3"
            except Exception as e:
                return f"TRANSCRIPT_ERROR: json3 parse: {e}"
        else:
            # VTT - just clean it up
            lines = []
            for line in content.split("\n"):
                line = line.strip()
                if not line or line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:") or "-->" in line or line.isdigit():
                    continue
                # Remove VTT tags
                clean = re.sub(r'<[^>]+>', '', line)
                if clean.strip():
                    lines.append(clean.strip())
            # Deduplicate consecutive lines (VTT repeats)
            deduped = []
            for line in lines:
                if not deduped or line != deduped[-1]:
                    deduped.append(line)
            return "\n".join(deduped) if deduped else "TRANSCRIPT_ERROR: empty vtt"


def main():
    brain_dir = Path("brain")
    brain_dir.mkdir(exist_ok=True)

    output_file = brain_dir / "videos.json"

    # Load existing progress if any
    existing = {}
    if output_file.exists():
        with open(output_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            existing = {v["video_id"]: v for v in data.get("videos", [])}

    videos = []
    total = len(URLS)

    for i, url in enumerate(URLS):
        vid = extract_video_id(url)
        if not vid:
            print(f"[{i+1}/{total}] SKIP - can't parse ID from {url}")
            continue

        # Skip if already fetched
        if vid in existing and not existing[vid].get("transcript", "").startswith("TRANSCRIPT_ERROR"):
            print(f"[{i+1}/{total}] CACHED: {existing[vid].get('title', vid)}")
            videos.append(existing[vid])
            continue

        print(f"[{i+1}/{total}] Fetching: {vid}...", end=" ", flush=True)

        meta = get_metadata(vid)
        if meta:
            print(f"'{meta['title']}'", end=" ", flush=True)
        else:
            meta = {"title": f"Unknown ({vid})", "channel": "", "duration_sec": 0, "upload_date": ""}
            print("(no metadata)", end=" ", flush=True)

        transcript = get_transcript(vid)
        has_transcript = not transcript.startswith("TRANSCRIPT_ERROR")
        print(f"- transcript: {'OK' if has_transcript else 'FAILED'}")

        entry = {
            "video_id": vid,
            "url": url,
            **meta,
            "transcript": transcript,
        }
        videos.append(entry)

        # Save progress after each video
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump({"videos": videos, "total": len(videos)}, f, indent=2, ensure_ascii=False)

        time.sleep(8)  # Be polite to YouTube - avoid rate limits

    # Final save
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "videos": videos,
            "total": len(videos),
            "playlist": PLAYLIST,
        }, f, indent=2, ensure_ascii=False)

    # Print summary
    ok = sum(1 for v in videos if not v.get("transcript", "").startswith("TRANSCRIPT_ERROR"))
    print(f"\nDone! {ok}/{len(videos)} videos with transcripts saved to brain/videos.json")


if __name__ == "__main__":
    main()
