// Scene tabs swap the source of one video; each clip already holds every model in sync.
document.querySelectorAll('.tabs').forEach(function (tabs) {
  var video = document.getElementById(tabs.dataset.target);
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.classList.contains('active')) return;
    tabs.querySelector('.active').classList.remove('active');
    b.classList.add('active');
    video.src = b.dataset.src;
    video.play().catch(function () {});
  });
});

// Show the floating navigation once the hero has scrolled away.
var nav = document.getElementById('nav');
var hero = document.getElementById('top');
new IntersectionObserver(function (entries) {
  nav.classList.toggle('visible', !entries[0].isIntersecting);
}).observe(hero);

// Play videos only while visible, to keep many autoplaying clips cheap.
var seen = new IntersectionObserver(function (entries) {
  entries.forEach(function (en) {
    if (en.isIntersecting) en.target.play().catch(function () {});
    else en.target.pause();
  });
}, { threshold: 0.25 });
document.querySelectorAll('video[autoplay]').forEach(function (v) { seen.observe(v); });

// Right-align numeric table cells and the headers above them.
document.querySelectorAll('table').forEach(function (t) {
  var numericCols = {};
  t.querySelectorAll('tbody tr').forEach(function (tr) {
    Array.prototype.forEach.call(tr.cells, function (c) {
      if (/^[\d.≈]/.test(c.textContent.trim())) { c.classList.add('num'); numericCols[tr.cells.length - c.cellIndex] = true; }
    });
  });
  var head = t.querySelector('thead tr:last-child');
  if (head) Array.prototype.forEach.call(head.cells, function (c) {
    if (numericCols[head.cells.length - c.cellIndex]) c.classList.add('num');
  });
});
