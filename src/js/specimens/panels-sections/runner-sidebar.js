/** Runner Sidebar: a small runner marks your place in the course sidebar. Pick a lesson and it sprints down the track to it, leaning into the run, and skids to a stop. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Runner Sidebar',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Selection-dependent', 'Direction-aware', 'Momentum-driven', 'Interruptible'],
  effect: ['Running', 'Accelerating', 'Decelerating', 'Velocity-streak'],
  purpose: ['Progress', 'Wayfinding', 'Delight'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A course sidebar with a running track down its edge and a little runner on it. Pick a lesson and the runner sprints along the track to it, leaning into the run with its legs a blur and speed lines behind it, then plants its feet and skids to a stop beside the lesson. Lessons it has passed get ticked.',
  params: [
    { key: 'speed', label: 'Top speed', group: 'Motion', type: 'range', min: 10, max: 60, step: 5, unit: 'em/s', default: 30, live: true },
    { key: 'lean', label: 'Lean', group: 'Motion', type: 'range', min: 0, max: 30, step: 5, unit: '°', default: 15, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Runner'),
  ],
};

const LESSONS = ['Warm up', 'Folding basics', 'Score and crease', 'Pop-ups', 'Hinges', 'Final project'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-run">
        <nav class="sp-run__side" aria-label="Lessons">
          <i class="sp-run__track"></i>
          <div class="sp-run__runner" aria-hidden="true"><i class="sp-run__streaks"></i><i class="sp-run__dot"></i></div>
          ${LESSONS.map((t, i) => `<button type="button" class="sp-run__lesson" aria-current="${i ? 'false' : 'step'}"><i class="sp-run__tick"></i>${t}</button>`).join('')}
        </nav>
        <div class="sp-pn__page sp-run__page"><span class="sp-pn__kick">Lesson</span><b class="sp-pn__h sp-run__title">Warm up</b>${bars(6)}</div>
      </div>`);
    const runner = k.$('.sp-run__runner');
    const dot = k.$('.sp-run__dot');
    const streaks = k.$('.sp-run__streaks');
    const lessons = k.$$('.sp-run__lesson');
    const title = k.$('.sp-run__title');
    const spot = (i) => lessons[i].offsetTop + lessons[i].offsetHeight / 2;
    k.resize(stage, () => gsap.set(runner, { y: spot(cur) }));
    let cur = 0;
    let run;
    gsap.set(streaks, { autoAlpha: 0, scaleY: 0 });

    lessons.forEach((l, i) => k.on(l, 'click', () => {
      if (i === cur) return;
      const dir = i > cur ? 1 : -1;
      cur = i;
      lessons.forEach((x, j) => {
        x.setAttribute('aria-current', j === i ? 'step' : 'false');
        x.classList.toggle('is-done', j < i);
      });
      title.textContent = LESSONS[i];
      run?.kill();
      if (reducedMotion) return gsap.set(runner, { y: spot(i) });
      const em = parseFloat(getComputedStyle(runner).fontSize);
      const dist = Math.abs(spot(i) - gsap.getProperty(runner, 'y'));
      const t = Math.max(0.35, dist / (p.speed * em) * 2);
      run = gsap.timeline()
        // Lean in and sprint (fast start, legs a blur, speed lines behind)…
        .to(dot, { rotation: dir * p.lean, scaleY: 1.25, scaleX: 0.85, duration: 0.12 })
        .set(streaks, { rotation: dir < 0 ? 180 : 0 })
        .to(streaks, { autoAlpha: 1, scaleY: 1, duration: 0.15 }, '<')
        .to(runner, { y: spot(i), duration: t, ease: 'power2.inOut' }, '<')
        // …then plant the feet and skid to a stop.
        .to(streaks, { autoAlpha: 0, scaleY: 0, duration: 0.2 }, `-=${t * 0.3}`)
        .to(dot, { rotation: -dir * p.lean * 0.7, scaleY: 0.85, scaleX: 1.15, duration: 0.15 }, '<')
        .to(dot, { rotation: 0, scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    }));

    return () => { run?.kill(); k.destroy(); };
  },
};
