/**
 * TAXONOMY — the six ways every specimen in the library is classified.
 *
 *   1. UI Element          what is being animated (one per specimen)
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

export const EFFECTS = list(`
  Morphing, Shape-shifting, Organic-morphing, Liquid-morphing, Blob-morphing, Metaball-morphing,
  Path-morphing, Topology-morphing, Geometry-morphing, Mesh-morphing, Deformation, Elastic-deformation,
  Fluid-deformation, Soft-body-deformation, Surface-deformation, Wave-deformation, Ripple-deformation,
  Torsional-deformation, Bending, Twisting, Warping, Distortion, Displacement, Shearing, Folding,
  Unfolding, Wrapping, Unwrapping, Crumpling, Uncrumpling, Inflation, Deflation, Compression, Expansion,
  Elongation, Stretching, Squashing, Pinching, Bulging, Tapering, Flattening, Fragmentation, Shattering,
  Disintegration, Disassembly, Reassembly, Exploding, Imploding, Splitting, Merging, Dissolving, Melting,
  Freezing, Solidification, Liquefaction, Crystallization, Fracturing, Breaking, Reconstructing,
  Levitation, Floating, Drifting, Gliding, Hovering, Bobbing, Swaying, Swinging, Pendulum-motion,
  Wobbling, Wiggle, Jittering, Shaking, Vibrating, Oscillating, Pulsating, Breathing, Bouncing,
  Rebounding, Ricocheting, Rolling, Tumbling, Somersaulting, Spinning, Rotating, Axial-rotation,
  Precession, Nutation, Gyroscopic-motion, Barrel-roll, Corkscrew-motion, Screw-motion, Orbiting,
  Revolving, Circling, Spiraling, Helical-motion, Looping-motion, Figure-eight-motion, Circular-motion,
  Elliptical-motion, Parabolic-motion, Projectile-motion, Ballistic-motion, Free-fall, Accelerating,
  Decelerating, Reciprocating, Sliding, Skidding, Scraping, Crawling, Walking, Running, Hopping, Jumping,
  Leaping, Flying, Diving, Rising, Descending, Falling, Dropping, Launching, Propelling, Ejecting,
  Catapulting, Springing, Recoiling, Snapping, Retracting, Extending, Contracting, Oscillatory-rotation,
  Eccentric-rotation, Mechanical-rotation, Ratcheting, Piston-motion, Cam-motion, Turbine-motion,
  Propeller-motion, Gear-motion, Kinetic-sculpture-motion, Path-following, Bezier-path-motion,
  Spline-following, Trajectory-motion, Curved-path-motion, Wave-path-motion, Sinusoidal-motion,
  Lissajous-motion, Motion-trail, Particle-trail, Echo-motion, Afterimage-motion, Ghosting, Motion-smear,
  Motion-blur, Velocity-streak, Accumulation, Scattering, Dispersion, Convergence, Divergence,
  Attraction-motion, Repulsion-motion, Swarming, Flocking, Flow-field-motion, Brownian-motion,
  Random-walk, Perlin-noise-motion, Procedural-motion, Generative-motion, Fractal-motion,
  Kinematic-motion, Inverse-kinematic-motion, Forward-kinematic-motion, Physics-based-motion,
  Spring-motion, Inertial-motion, Momentum-motion, Gravity-motion, Collision-motion, Impact-motion,
  Recoil-motion, Rebound-motion, Secondary-motion, Follow-through, Anticipation-motion, Overshoot-motion,
  Aftershock-motion, Resonance-motion, Damped-oscillation, Underdamped-motion, Overdamped-motion,
  Wave-propagation, Traveling-wave, Standing-wave, Surface-wave, Fluid-flow, Vortex-motion, Swirl-motion,
  Turbulence-motion, Smoke-motion, Fire-motion, Water-motion, Cloth-motion, Rope-motion, Chain-motion,
  Hair-motion, Soft-body-motion, Rigid-body-motion, Holographic-motion, Refraction-motion,
  Reflection-distortion, Optical-warping, Chromatic-aberration-motion, Caustic-motion, Iridescent-motion,
  Shimmering, Scanning, Sweeping, Glitching, Pixel-sorting, Pixel-dissolving, Pixel-explosion,
  Datamoshing, RGB-splitting, Kaleidoscopic-motion, Morphing-transition, Shape-assembly, Shape-disassembly
`);

export const PURPOSES = list(`
  Navigation, Wayfinding, Orientation, Feedback, Affordance, Hierarchy, Focus, Progress, Continuity,
  Decoration, Delight, Storytelling, Branding
`);

/** The filter axes, in the order the user walks them: element → trigger → effect. */
export const AXES = [
  { key: 'element', label: 'UI Element', step: '01', hint: 'What are you animating?' },
  { key: 'trigger', label: 'Interaction', step: '02', hint: 'What sets it off?', all: TRIGGERS },
  { key: 'effect', label: 'Motion Effect', step: '03', hint: 'What does the movement look like?', all: EFFECTS },
  { key: 'behavior', label: 'Behavior', step: '+', hint: 'Optional: how it sits or reacts', all: BEHAVIORS },
  { key: 'purpose', label: 'Purpose', step: '+', hint: 'Optional: why it moves', all: PURPOSES },
];
