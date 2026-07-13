import { Innertube } from 'youtubei.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const VIDEOS = [
  "agoD8Cvcz9E","uCYWvl8Dftc","abyhMBRo1bM","vJlExc2eJpI","CqP9a-EMr14",
  "qzvImHRTooI","e_f97qwgcDo","V35DEKzZHKk","q37ARYnRDGc","n28W4AmvMDE",
  "wTBSGgbIvsY","ddq8JIMhz7c","U6dnOVth7-I","RmwbNdyrilk","K-TW2Chpz4k",
  "Pmd6knanPKw","lIo9FcrljDk","iw97uvIge7c","qUz93CyNIz0","OLQRAMZi--c",
  "zYuw-8pwnp8","KBkl3I645c8","vP-JD_IdoBY","-iQw0fSxZ58","83704QVpqQU",
  "rwYMq71l_2M","HEsigW2ASvg","_2JKRAQdR2Q","_sfTLMEoPNw","LEh08JCnUmQ",
  "2EsLsxl5dtE","hXeOcENzdNM","RaYradx6JXg","OLBVF8rts0A","Xy7ccu44tl8",
  "DZER3GNmEwo","IcQXkzMvvlQ","-hZJ1CADebQ","qK6Rh_XODFw","neOoDUAjX2o",
  "UOXD_0ctRYs","LNZJgbVAEKI","59qFZsNhI8s","pK5jcQalrSs","RSJIp7e7fyY",
  "onv3QA6DC4Y","07NXgqFnnls","uCZ1zyr_sqI","2hAWlREjqRk"
];

if (!existsSync('brain')) mkdirSync('brain');

// Load existing data
let existing = {};
if (existsSync('brain/videos.json')) {
  const data = JSON.parse(readFileSync('brain/videos.json', 'utf8'));
  for (const v of (data.videos || [])) {
    existing[v.video_id] = v;
  }
}

async function main() {
  const yt = await Innertube.create();
  const results = [];
  let ok = 0;

  for (let i = 0; i < VIDEOS.length; i++) {
    const vid = VIDEOS[i];

    // Skip if already has transcript
    if (existing[vid] && existing[vid].transcript && !existing[vid].transcript.startsWith('TRANSCRIPT_ERROR')) {
      console.log(`[${i+1}/${VIDEOS.length}] CACHED: ${existing[vid].title}`);
      results.push(existing[vid]);
      ok++;
      continue;
    }

    process.stdout.write(`[${i+1}/${VIDEOS.length}] ${vid}... `);

    try {
      const info = await yt.getInfo(vid);
      const title = info.basic_info?.title || `Unknown (${vid})`;
      const channel = info.basic_info?.channel?.name || info.basic_info?.author || '';
      const duration = info.basic_info?.duration || 0;

      let transcript = 'TRANSCRIPT_ERROR: not available';

      try {
        const transcriptData = await info.getTranscript();
        const segments = transcriptData?.transcript?.content?.body?.initial_segments || [];

        if (segments.length > 0) {
          const lines = segments.map(seg => {
            const startMs = parseInt(seg.start_ms || '0');
            const startSec = startMs / 1000;
            const mins = Math.floor(startSec / 60);
            const secs = Math.floor(startSec % 60);
            const text = seg.snippet?.text || seg.snippet?.runs?.map(r => r.text).join('') || '';
            return `[${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}] ${text}`;
          }).filter(l => l.trim().length > 7);

          if (lines.length > 0) {
            transcript = lines.join('\n');
          }
        }
      } catch (tErr) {
        // Try alternative transcript access
        try {
          const captions = info.captions?.caption_tracks;
          if (captions && captions.length > 0) {
            const track = captions.find(c => c.language_code === 'en') || captions[0];
            if (track) {
              const resp = await fetch(track.base_url + '&fmt=json3');
              const data = await resp.json();
              const events = data.events || [];
              const lines = events
                .filter(ev => ev.segs)
                .map(ev => {
                  const startSec = (ev.tStartMs || 0) / 1000;
                  const mins = Math.floor(startSec / 60);
                  const secs = Math.floor(startSec % 60);
                  const text = ev.segs.map(s => s.utf8 || '').join('').trim();
                  return text ? `[${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}] ${text}` : '';
                })
                .filter(Boolean);
              if (lines.length > 0) transcript = lines.join('\n');
            }
          }
        } catch { /* ignore */ }
      }

      const hasT = !transcript.startsWith('TRANSCRIPT_ERROR');
      console.log(`${title.slice(0, 60)} - ${hasT ? 'OK' : 'FAILED'}`);
      if (hasT) ok++;

      const entry = {
        video_id: vid,
        url: `https://www.youtube.com/watch?v=${vid}`,
        title,
        channel,
        duration_sec: duration,
        transcript,
      };
      results.push(entry);

      // Save progress
      writeFileSync('brain/videos.json', JSON.stringify({ videos: results, total: results.length }, null, 2));

      // Small delay
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.log(`ERROR: ${err.message?.slice(0, 80)}`);
      results.push(existing[vid] || {
        video_id: vid,
        url: `https://www.youtube.com/watch?v=${vid}`,
        title: `Unknown (${vid})`,
        channel: '',
        transcript: `TRANSCRIPT_ERROR: ${err.message}`,
      });
    }
  }

  writeFileSync('brain/videos.json', JSON.stringify({ videos: results, total: results.length }, null, 2));
  console.log(`\nDone! ${ok}/${VIDEOS.length} videos with transcripts.`);
}

main().catch(console.error);
