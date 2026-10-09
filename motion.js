(() => {
  const init = () => {
    const page = document.querySelector('.fp-page');
    if (!page) return;
    page.dataset.motionPaused = 'false';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setVisible = (el, visible) => { if (el) el.dataset.motionVisible = visible ? 'true' : 'false'; };
    const setRunning = (el, running) => { if (el) el.dataset.running = running ? 'true' : 'false'; };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const el = entry.target;
      if (el.matches('.build-launch-visual, .fp-idea-diagram, .project-study')) {
        setVisible(el, entry.isIntersecting);
        if (!reduce) setRunning(el, entry.isIntersecting);
      }
    }), {threshold: 0.18, rootMargin: '-8% 0px -8% 0px'});
    document.querySelectorAll('.build-launch-visual,.fp-idea-diagram,.project-study').forEach(el => observer.observe(el));
    const update = () => {
      const y = scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const progress = document.querySelector('.site-motion-progress > *');
      if (progress) progress.style.width = `${Math.min(100, Math.max(0, y / max * 100))}%`;
      document.querySelectorAll('.process-chapter-slot').forEach(slot => {
        const chapter = slot.querySelector('.process-chapter');
        if (!chapter) return;
        const r = slot.getBoundingClientRect();
        const active = r.top < innerHeight * .58 && r.bottom > innerHeight * .28;
        chapter.dataset.active = active ? 'true' : 'false';
      });
      const compact = document.querySelector('.build-launch-visual--compact');
      if (compact) setRunning(compact, compact.getBoundingClientRect().top < innerHeight * .8 && compact.getBoundingClientRect().bottom > innerHeight * .2);
    };
    addEventListener('scroll', update, {passive:true});
    addEventListener('resize', update, {passive:true});
    update();
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
