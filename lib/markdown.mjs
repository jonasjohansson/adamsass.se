const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

// An allowlist, not a blocklist: anything that is not plainly a web page, a
// mail address or a file in this repo is refused, so javascript: and data:
// never need naming.
function href(url) {
  if (!/^(https?:\/\/|mailto:|\/|assets\/)/.test(url)) {
    throw new Error(`unsupported URL: ${url}`);
  }
  return url;
}

// Inline only, on purpose. See CLAUDE.md: four type sizes, and nothing that
// explains the page. Block level markdown would let a heading in.
//
// Escaping runs first, so everything after it works on text that is already
// safe and the emphasis and link markers are the only markup we add. Links
// resolve before emphasis so a * inside a link label still becomes an <em>.
export function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
    const target = href(url);
    const rel = target.startsWith('mailto:') ? '' : ' rel="noopener"';
    return `<a href="${target}"${rel}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}
