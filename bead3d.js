/* ken.didit: the 3D touch in the hero. A short three-strand braid with a lilac bead, the same
   braid-and-bead idea as the plaited-k logo. It turns slowly and leans toward the cursor on springs
   (mouse only); phones get a slow sway. Motion turned off: one still frame.
   three.js loads only after the page has loaded, so it never slows the first paint or the booking
   flow. No WebGL, or anything fails: the canvas never shows and the hero stays exactly as it was. */
const box = document.querySelector('.hero-bead');
const canvas = box && box.querySelector('canvas');

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
function boot() {
  if (!canvas || !webglOK()) return;
  import('./bead3d-scene.js').then((m) => m.start(box, canvas)).catch(() => {});
}
if (document.readyState === 'complete') setTimeout(boot, 300);
else window.addEventListener('load', () => setTimeout(boot, 300), { once: true });
