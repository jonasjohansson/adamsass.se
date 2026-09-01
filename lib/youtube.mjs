const ID = /^[A-Za-z0-9_-]{11}$/;

// Adam pastes whatever his browser gave him, so accept every shape YouTube
// hands out and keep only the ID. The ID is the whole point: the page builds
// its own youtube-nocookie.com embed URL around it, so nothing from the
// pasted host survives and the match does not need anchoring.
//
// `(?:[^&]*&)*?` skips whole query parameters, lazily, so `v` is found at a
// parameter boundary and the first one wins, the same one a browser plays.
// A plain `.*&` would land mid-parameter and take the last `v=` instead.
export function youtubeId(input) {
  const value = String(input).trim();
  if (ID.test(value)) return value;

  const match = value.match(
    /(?:youtube\.com\/watch\?(?:[^&]*&)*?v=|youtu\.be\/|youtube(?:-nocookie)?\.com\/embed\/)([A-Za-z0-9_-]{11})/
  );
  if (!match) throw new Error(`not a YouTube URL: ${input}`);
  return match[1];
}
