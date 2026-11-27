/**
 * TAXONOMY — the six ways every specimen in the library is classified.
 *
 *   1. UI Element          what is being animated (one or more per specimen)
 *   2. Element Properties  which properties of it change
 *   3. Interaction/Trigger what sets it off
 *   4. Behavior            how it is placed or how it reacts over time
 *   5. Motion Effect       what the movement looks like
 *   6. Purpose             why the motion is there
 *
 * Rule: Behavior and Motion Effect can be combined, but not every behavior
 * needs a motion effect, and not every motion effect needs a behavior.
 * A specimen may leave either list empty.
 *
 * Lists are plain comma-separated strings so they're easy to extend:
 * just add a term. Spelling must match the specimen data exactly.
 */
const list = (s) => s.split(',').map((t) => t.trim()).filter(Boolean);

/** UI elements per catalog drawer (matches `items` in cards.js). */
export const ELEMENTS = {
  navigation: ['Navbar', 'Sidebar', 'Hamburger menu', 'Dropdown', 'Tabs', 'Breadcrumbs', 'Pagination'],
  'buttons-controls': ['Primary button', 'Icon button', 'Toggle', 'Checkbox', 'Radio', 'Slider', 'FAB'],
  'cards-containers': ['Product card', 'Profile card', 'Pricing card', 'Content card', 'Widget', 'Card stack'],
  'panels-sections': ['Hero section', 'Sidebar panel', 'Drawer', 'Accordion', 'Expandable panel', 'Footer'],
  'overlays-popups': ['Modal', 'Dialog', 'Tooltip', 'Popover', 'Toast', 'Lightbox', 'Bottom sheet'],
  'forms-inputs': ['Text field', 'Search bar', 'Select', 'Date picker', 'Textarea', 'File upload'],
  'typography-media': ['Heading', 'Paragraph', 'Text reveal', 'Image', 'Gallery', 'Video', 'Avatar', 'Icon'],
  'data-feedback': ['Charts', 'Tables', 'Progress bar', 'Loader', 'Skeleton', 'Badges', 'Notifications'],
};

export const PROPERTIES = list(`
  Position, Size, Scale, Rotation, Layout, Spacing, Order, Opacity, Color, Shape, Clip & mask,
  Border, Radius, Shadow, Blur, Depth (z), Typography, Path
`);

export const TRIGGERS = list(`
  Hover, Click, Scroll, Drag, Load, Focus, Keyboard, Cursor move, Swipe, Long-press,
  Resize, Idle, In view, State change
`);

export const BEHAVIORS = list(`
  Sticky, Fixed, Static, Absolute, Relative, Floating, Draggable, Scroll-linked, Scroll-triggered,
  Scroll-controlled, Scroll-scrubbed, Scroll-pinned, Scroll-snapping, Scroll-responsive, Scroll-revealed,
  Scroll-hidden, Parallax, Reverse-parallax, Multi-layer parallax, Horizontal-scrolling, Vertical-scrolling,
  Infinite-scrolling, Auto-playing, Auto-rotating, Auto-sliding, Auto-advancing, Looping, Repeating,
  Ping-pong, Alternating, Reversible, Interactive, Reactive, Responsive, Adaptive, Context-aware,
  State-dependent, Conditional, Event-driven, Time-driven, Direction-aware, Velocity-aware, Position-aware,
  Proximity-aware, Cursor-following, Pointer-tracking, Mouse-tracking, Touch-responsive, Gesture-driven,
  Magnetic, Repulsive, Attracted, Repelled, Following, Leading, Trailing, Chasing, Avoiding, Orbiting,
  Anchored, Docked, Suspended, Attached, Detached, Independent, Synchronized, Desynchronized, Coordinated,
  Sequential, Concurrent, Parallel, Staggered, Cascading, Hierarchical, Nested, Recursive, Elastic,
  Inertial, Momentum-driven, Physics-driven, Spring-driven, Gravity-driven, Collision-responsive,
  Bounce-responsive, Friction-responsive, Snapping, Snap-to-grid, Snap-to-position, Snap-to-path,
  Constrained, Unconstrained, Boundary-aware, Clamped, Unbounded, Oscillating, Periodic, Cyclic,
  Continuous, Discrete, Intermittent, Randomized, Procedural, Generative, Deterministic, Seeded-random,
  Autonomous, Self-organizing, Self-correcting, Self-centering, Self-aligning, Self-adjusting,
  Self-repositioning, Self-resizing, Self-expanding, Self-collapsing, Persistent, Temporary, Transient,
  Interruptible, Uninterruptible, Pausable, Resumable, Cancellable, Queue-based, Priority-based,
  Load-dependent, Visibility-dependent, Viewport-dependent, Focus-dependent, Hover-dependent,
  Selection-dependent, Activation-dependent, Toggle-dependent, Audio-reactive, Sound-reactive,
  Frequency-reactive, Amplitude-reactive, Device-orientation-aware, Device-motion-aware, Sensor-driven,
  Multi-touch, Multi-gesture, Drag-and-drop, Swipe-controlled, Pinch-controlled, Long-press-controlled,
  Keyboard-controlled
`);

/**
 * MOTION EFFECTS, arranged in families.
 *
 * Every group below is `Parent: list(\`children\`)`. Filtering by a parent
 * also finds every design tagged with one of its children, so "Rotating"
 * finds a design tagged "Spinning". Groups can nest: Morphing sits inside
 * Deformation, and Soft-body-motion inside Physics-based-motion, so
 * "Blob-morphing" counts toward Morphing *and* Deformation.
 *
 * To add a term, put it in the group it belongs to. To add a group, add a
 * new `Parent: list(...)` entry. EFFECTS (the full term list) is built from
 * these groups, so there is only one place to edit.
 */
export const EFFECT_FAMILIES = {
  // ── Shape change ───────────────────────────────────────────
  Deformation: list(`
    Morphing, Elastic-deformation, Fluid-deformation, Soft-body-deformation, Surface-deformation,
    Wave-deformation, Ripple-deformation, Torsional-deformation, Bending, Twisting, Warping, Distortion,
    Displacement, Shearing, Crumpling, Uncrumpling, Inflation, Deflation, Compression, Elongation,
    Stretching, Squashing, Pinching, Bulging, Tapering, Flattening
  `),
  Morphing: list(`
    Shape-shifting, Organic-morphing, Liquid-morphing, Blob-morphing, Metaball-morphing, Path-morphing,
    Topology-morphing, Geometry-morphing, Mesh-morphing, Morphing-transition
  `),
  Scaling: list(`Expansion, Contracting, Extending, Retracting`),
  Folding: list(`Unfolding, Wrapping, Unwrapping`),

  // ── Breaking apart & coming together ───────────────────────
  Fragmentation: list(`
    Shattering, Fracturing, Breaking, Splitting, Exploding, Imploding, Disintegration, Disassembly,
    Shape-disassembly, Reassembly, Reconstructing, Shape-assembly, Merging
  `),
  'Phase-change': list(`Dissolving, Melting, Freezing, Solidification, Liquefaction, Crystallization`),

  // ── Moving from place to place ─────────────────────────────
  Sliding: list(`Skidding, Scraping, Sweeping`),
  Rising: list(`Launching, Propelling, Ejecting, Catapulting`),
  Falling: list(`Dropping, Descending, Free-fall, Diving`),
  Locomotion: list(`Crawling, Walking, Running, Hopping, Jumping, Leaping, Flying`),
  Floating: list(`Levitation, Drifting, Gliding, Hovering, Bobbing`),
  'Path-following': list(`
    Bezier-path-motion, Spline-following, Trajectory-motion, Curved-path-motion, Wave-path-motion,
    Sinusoidal-motion, Lissajous-motion, Parabolic-motion, Projectile-motion, Ballistic-motion
  `),

  // ── Turning & circling ─────────────────────────────────────
  Rotating: list(`
    Spinning, Rolling, Tumbling, Somersaulting, Axial-rotation, Barrel-roll, Corkscrew-motion,
    Screw-motion, Oscillatory-rotation, Eccentric-rotation, Precession, Nutation, Gyroscopic-motion
  `),
  Orbiting: list(`
    Revolving, Circling, Spiraling, Helical-motion, Looping-motion, Figure-eight-motion, Circular-motion,
    Elliptical-motion
  `),
  'Mechanical-motion': list(`
    Mechanical-rotation, Gear-motion, Ratcheting, Piston-motion, Cam-motion, Turbine-motion,
    Propeller-motion, Kinetic-sculpture-motion
  `),

  // ── Back & forth ───────────────────────────────────────────
  Oscillating: list(`
    Swaying, Swinging, Pendulum-motion, Wobbling, Wiggle, Jittering, Shaking, Vibrating, Pulsating,
    Breathing, Reciprocating, Resonance-motion, Damped-oscillation, Underdamped-motion, Overdamped-motion
  `),
  Bouncing: list(`
    Rebounding, Rebound-motion, Ricocheting, Springing, Snapping, Recoiling, Recoil-motion, Impact-motion,
    Collision-motion, Aftershock-motion
  `),

  // ── Physics & animation principles ─────────────────────────
  'Physics-based-motion': list(`
    Spring-motion, Inertial-motion, Momentum-motion, Gravity-motion, Accelerating, Decelerating,
    Rigid-body-motion, Soft-body-motion, Kinematic-motion, Inverse-kinematic-motion,
    Forward-kinematic-motion
  `),
  'Soft-body-motion': list(`Cloth-motion, Rope-motion, Chain-motion, Hair-motion`),
  'Secondary-motion': list(`Anticipation-motion, Follow-through, Overshoot-motion`),

  // ── Many things at once ────────────────────────────────────
  'Particle-motion': list(`
    Scattering, Dispersion, Accumulation, Convergence, Divergence, Attraction-motion, Repulsion-motion,
    Swarming, Flocking
  `),
  'Procedural-motion': list(`
    Generative-motion, Flow-field-motion, Brownian-motion, Random-walk, Perlin-noise-motion, Fractal-motion
  `),
  'Motion-trail': list(`
    Particle-trail, Echo-motion, Afterimage-motion, Ghosting, Motion-smear, Motion-blur, Velocity-streak
  `),

  // ── Waves & fluids ─────────────────────────────────────────
  'Wave-propagation': list(`Traveling-wave, Standing-wave, Surface-wave`),
  'Fluid-flow': list(`Water-motion, Vortex-motion, Swirl-motion, Turbulence-motion, Smoke-motion, Fire-motion`),

  // ── Light & screen effects ─────────────────────────────────
  'Light-effect': list(`
    Shimmering, Scanning, Iridescent-motion, Holographic-motion, Refraction-motion, Reflection-distortion,
    Optical-warping, Caustic-motion, Chromatic-aberration-motion, Kaleidoscopic-motion
  `),
  Glitching: list(`RGB-splitting, Pixel-sorting, Pixel-dissolving, Pixel-explosion, Datamoshing`),
};

/** Every effect term, in family order (parent first, then its children). */
export const EFFECTS = [...new Set(Object.entries(EFFECT_FAMILIES).flatMap(([parent, kids]) => [parent, ...kids]))];

/** The top-level families (not nested inside another) with all their terms, for the grouped term index. */
const NESTED = new Set(Object.values(EFFECT_FAMILIES).flat());
export const EFFECT_GROUPS = Object.keys(EFFECT_FAMILIES)
  .filter((p) => !NESTED.has(p))
  .map((parent) => {
    const terms = [];
    const walk = (t) => !terms.includes(t) && (terms.push(t), (EFFECT_FAMILIES[t] || []).forEach(walk));
    walk(parent);
    return { parent, terms };
  });

/** A term plus every family it belongs to, at any depth: 'Blob-morphing' → ['Blob-morphing', 'Morphing', 'Deformation']. */
const PARENTS = {};
Object.entries(EFFECT_FAMILIES).forEach(([parent, kids]) => kids.forEach((k) => (PARENTS[k] ||= []).push(parent)));
export function withFamilies(terms) {
  const out = new Set();
  const walk = (t) => !out.has(t) && (out.add(t), (PARENTS[t] || []).forEach(walk));
  terms.forEach(walk);
  return [...out];
}

export const PURPOSES = list(`
  Navigation, Wayfinding, Orientation, Feedback, Affordance, Hierarchy, Focus, Progress, Continuity,
  Decoration, Delight, Storytelling, Branding
`);

/** The filter axes, in the order the user walks them: effect → trigger → element (motion first: it's a motion library). */
export const AXES = [
  { key: 'effect', label: 'Motion Effect', step: '01', hint: 'What does the movement look like?', all: EFFECTS },
  { key: 'trigger', label: 'Interaction', step: '02', hint: 'What sets it off?', all: TRIGGERS },
  { key: 'element', label: 'UI Element', step: '03', hint: 'What will you put it on?' },
  { key: 'behavior', label: 'Behavior', step: '+', hint: 'Optional: how it sits or reacts', all: BEHAVIORS },
  { key: 'purpose', label: 'Purpose', step: '+', hint: 'Optional: why it moves', all: PURPOSES },
];
