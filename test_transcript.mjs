import { Innertube } from 'youtubei.js';

const yt = await Innertube.create();
const info = await yt.getInfo('q37ARYnRDGc');

console.log('Has captions:', Boolean(info.captions));
const tracks = info.captions?.caption_tracks;
if (tracks) {
  console.log('Tracks:', tracks.map(c => `${c.language_code} (${c.kind})`));

  // Try fetching the first track directly
  const track = tracks.find(c => c.language_code === 'en') || tracks[0];
  if (track) {
    console.log('Fetching:', track.base_url.slice(0, 80));
    const resp = await fetch(track.base_url + '&fmt=json3');
    const data = await resp.json();
    const events = (data.events || []).filter(e => e.segs);
    console.log('Got', events.length, 'caption events');
    if (events[0]) {
      const text = events[0].segs.map(s => s.utf8 || '').join('');
      console.log('First:', text);
    }
    if (events[10]) {
      const text = events[10].segs.map(s => s.utf8 || '').join('');
      console.log('Sample:', text);
    }
    console.log('SUCCESS');
  }
}
