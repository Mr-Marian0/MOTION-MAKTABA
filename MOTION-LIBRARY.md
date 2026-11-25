# Motion Library

What can be applied to each UI element. **Behaviors** and **Effects** use the exact terms in `src/data/taxonomy.js` (copy them into `meta`). **Recipes** are proven combos to start from. Max ~1k characters per element. Used by [DESIGN-GUIDE.md](DESIGN-GUIDE.md).

## Navigation

### Navbar
- **Behaviors:** Sticky, Fixed, Scroll-hidden, Scroll-revealed, Scroll-responsive, Direction-aware, Velocity-aware, Proximity-aware, Magnetic, Hover-dependent, Selection-dependent, Docked, Self-resizing, Staggered
- **Effects:** Sliding, Stretching, Contracting, Elongation, Attraction-motion, Spring-motion, Bulging, Rising, Dropping, Shape-assembly, Path-following, Shimmering
- **Recipes:** hide on scroll down, return on scroll up · underline that stretches between links · magnetic links · dock that magnifies near the cursor · bar shrinks to a pill after scrolling · masthead assembles on load

### Sidebar
- **Behaviors:** Sticky, Draggable, Elastic, Snapping, Snap-to-position, Scroll-linked, Position-aware, Self-collapsing, Self-expanding, Hierarchical, Nested, Swipe-controlled, Boundary-aware
- **Effects:** Sliding, Elastic-deformation, Bulging, Wobbling, Unfolding, Folding, Extending, Retracting, Overshoot-motion, Follow-through, Rising
- **Recipes:** drag out with a bulging edge that snaps and wobbles · scroll-spy index that highlights the current section · collapse to icons, labels fade in on hover · nested groups unfold like paper

### Hamburger menu
- **Behaviors:** Toggle-dependent, Activation-dependent, Reversible, Interruptible, Sequential, Staggered, Cascading, Keyboard-controlled, Focus-dependent
- **Effects:** Morphing, Path-morphing, Rotating, Shape-shifting, Expansion, Unfolding, Dropping, Liquid-morphing, Shattering, Sliding, Swirl-motion
- **Recipes:** three lines morph into an X · menu spreads out of the button as a circle (clip-path) · torn sheet drops in, links stagger · full-screen panel slides with links rising one by one · lines tie into a knot

### Dropdown
- **Behaviors:** Hover-dependent, Focus-dependent, Activation-dependent, Nested, Hierarchical, Cascading, Boundary-aware, Self-repositioning, Interruptible, Keyboard-controlled
- **Effects:** Unfolding, Folding, Sliding, Dropping, Expansion, Stretching, Swinging, Pendulum-motion, Rising, Morphing
- **Recipes:** submenu unfolds strip by strip like paper · hanging card swings in from its hinge · one panel morphs size between menus (mega menu) · items cascade with a slight delay

### Tabs
- **Behaviors:** Selection-dependent, Direction-aware, State-dependent, Swipe-controlled, Gesture-driven, Reversible, Sequential, Keyboard-controlled, Snapping, Scroll-linked
- **Effects:** Sliding, Axial-rotation, Folding, Stretching, Contracting, Morphing, Liquid-morphing, Rotating, Overshoot-motion
- **Recipes:** indicator stretches toward the new tab, then catches up · folder sheets slide in from the side you moved toward · book pages turn on swipe · gooey pill flows between tabs · cards shuffle forward

### Breadcrumbs
- **Behaviors:** Sequential, Staggered, Context-aware, Self-collapsing, Self-expanding, Hover-dependent, Responsive, Position-aware
- **Effects:** Sliding, Falling, Dropping, Folding, Unfolding, Expansion, Compression, Rising, Shape-assembly
- **Recipes:** crumbs slide in one by one · middle crumbs fold into "…" and unfold on hover · removed crumbs fall away · path draws a line linking each step

### Pagination
- **Behaviors:** Selection-dependent, Direction-aware, State-dependent, Discrete, Snapping, Keyboard-controlled, Swipe-controlled, Infinite-scrolling, Load-dependent
- **Effects:** Liquid-morphing, Metaball-morphing, Stretching, Squashing, Sliding, Rolling, Axial-rotation, Bouncing
- **Recipes:** ink drop stretches to the next page and squashes · numbers roll like an odometer · page dots merge (gooey) · load-more button turns into a progress ring

## Buttons & Controls

### Primary button
- **Behaviors:** Hover-dependent, Focus-dependent, Magnetic, Proximity-aware, Cursor-following, Long-press-controlled, Event-driven, State-dependent, Load-dependent, Interruptible
- **Effects:** Squashing, Stretching, Bouncing, Springing, Rising, Ripple-deformation, Shimmering, Sweeping, Morphing, Expansion, Shattering, Particle-trail, Anticipation-motion
- **Recipes:** lift on hover, squash on press, bounce back · fill sweeps in from the cursor side · magnetic pull toward cursor · label slides out, new label slides in · button morphs into spinner → check · confetti burst on success

### Icon button
- **Behaviors:** Hover-dependent, Toggle-dependent, State-dependent, Reactive, Magnetic, Event-driven
- **Effects:** Rotating, Spinning, Path-morphing, Morphing, Wiggle, Shaking, Pulsating, Bouncing, Inflation, Particle-trail, Expansion
- **Recipes:** heart pops and bursts particles · bell wiggles · play/pause path-morph · gear spins while busy · copy icon swaps to check

### Toggle
- **Behaviors:** Toggle-dependent, State-dependent, Draggable, Snapping, Elastic, Reversible, Keyboard-controlled
- **Effects:** Sliding, Stretching, Squashing, Liquid-morphing, Morphing, Rolling, Rotating, Overshoot-motion, Spring-motion, Morphing-transition
- **Recipes:** knob stretches while traveling, squashes at the end · sun morphs to moon · knob rolls like a ball · paper tab flips over

### Checkbox
- **Behaviors:** Toggle-dependent, State-dependent, Sequential, Staggered, Keyboard-controlled
- **Effects:** Path-following, Path-morphing, Squashing, Bouncing, Bezier-path-motion, Expansion, Particle-trail, Sweeping
- **Recipes:** tick draws itself (stroke-dashoffset) · box squashes then checks · hand-drawn scribble fills the box · list item gets struck through and fades

### Radio
- **Behaviors:** Selection-dependent, State-dependent, Direction-aware, Keyboard-controlled
- **Effects:** Liquid-morphing, Sliding, Expansion, Contracting, Pulsating, Ripple-deformation, Metaball-morphing
- **Recipes:** dot travels like a drop from the old option to the new one · dot grows from the center with a ripple · ring pulses once on select

### Slider
- **Behaviors:** Draggable, Constrained, Clamped, Snapping, Snap-to-grid, Velocity-aware, Inertial, Elastic, Keyboard-controlled, Pointer-tracking
- **Effects:** Stretching, Elongation, Wave-deformation, Rope-motion, Rotating, Bulging, Rebounding, Damped-oscillation, Rolling
- **Recipes:** track bends like a rope under the thumb · tooltip value rolls and tilts with speed · thumb squashes at the limits and rebounds · steps click with a small bounce

### FAB
- **Behaviors:** Floating, Fixed, Scroll-hidden, Scroll-responsive, Activation-dependent, Staggered, Cascading, Self-expanding
- **Effects:** Expansion, Morphing, Morphing-transition, Rotating, Orbiting, Circling, Springing, Bobbing, Divergence, Convergence
- **Recipes:** plus rotates to X, actions fan out in an arc · FAB morphs into a full sheet · shrinks on scroll down, returns on up · gentle bobbing when idle

## Cards & Containers

### Product card
- **Behaviors:** Hover-dependent, Pointer-tracking, Device-orientation-aware, Selection-dependent, Event-driven, Visibility-dependent
- **Effects:** Axial-rotation, Rotating, Shimmering, Iridescent-motion, Rising, Expansion, Sliding, Dropping, Projectile-motion, Morphing-transition
- **Recipes:** 3D tilt with a glare that follows the cursor · image swaps on hover · "add to cart" flies the image into the bag · color swatches morph the product

### Profile card
- **Behaviors:** Hover-dependent, Toggle-dependent, Reversible, Sequential, Staggered, Activation-dependent
- **Effects:** Axial-rotation, Unfolding, Expansion, Rising, Sliding, Scattering, Morphing, Pulsating
- **Recipes:** flip to reveal the back · avatar grows, details slide up · social icons stagger in · follow button morphs to "Following"

### Pricing card
- **Behaviors:** Toggle-dependent, State-dependent, Hover-dependent, Selection-dependent, Synchronized, Staggered
- **Effects:** Rising, Expansion, Rolling, Shimmering, Sweeping, Bouncing, Floating, Pulsating
- **Recipes:** monthly/yearly toggle rolls every price like an odometer · featured card floats higher with a shimmer border · hovered card lifts, others dim · feature ticks stagger in

### Content card
- **Behaviors:** Scroll-revealed, Scroll-triggered, Hover-dependent, Staggered, Cascading, Parallax, Activation-dependent
- **Effects:** Rising, Sliding, Expansion, Morphing-transition, Unfolding, Sweeping, Drifting
- **Recipes:** cards rise in staggered on scroll · image zooms slightly on hover, title underlines · card expands into the full article (FLIP) · image parallax inside the card

### Widget
- **Behaviors:** Draggable, Drag-and-drop, Snap-to-grid, Self-resizing, Time-driven, Event-driven, Auto-playing, Persistent
- **Effects:** Rolling, Pulsating, Breathing, Sliding, Expansion, Contracting, Wobbling, Rotating, Wave-propagation
- **Recipes:** rearrange by drag with snapping neighbors · weather icon animates (rain, sun rays) · numbers roll on update · widget resizes with spring

### Card stack
- **Behaviors:** Draggable, Swipe-controlled, Gesture-driven, Velocity-aware, Momentum-driven, Physics-driven, Snapping, Queue-based, Looping, Auto-advancing, Scroll-scrubbed, Scroll-pinned
- **Effects:** Sliding, Rotating, Projectile-motion, Falling, Divergence, Accumulation, Spring-motion, Axial-rotation
- **Recipes:** swipe cards away (Tinder-style), the next one springs up · deck fans out on hover · pinned scroll stacks cards on top of each other · infinite shuffle loop

## Panels & Sections

### Hero section
- **Behaviors:** Scroll-pinned, Scroll-scrubbed, Scroll-linked, Parallax, Multi-layer parallax, Pointer-tracking, Load-dependent, Auto-playing, Sequential
- **Effects:** Rising, Splitting, Unfolding, Fragmentation, Expansion, Sweeping, Morphing, Floating, Drifting, Distortion, Fluid-flow, Particle-trail
- **Recipes:** cover tears open on scroll · headline letters rise in staggered · layers move at different depths with the cursor · video/image zooms out from a mask · background blob morphs slowly

### Sidebar panel
- **Behaviors:** Toggle-dependent, Draggable, Snapping, Elastic, Swipe-controlled, Boundary-aware, Nested
- **Effects:** Sliding, Elastic-deformation, Bulging, Unfolding, Folding, Extending, Retracting, Rising
- **Recipes:** panel slides in, page content shifts and dims · edge bulges while dragged · sections inside unfold one by one

### Drawer
- **Behaviors:** Draggable, Swipe-controlled, Snapping, Snap-to-position, Elastic, Inertial, Momentum-driven, Boundary-aware, Toggle-dependent
- **Effects:** Sliding, Extending, Retracting, Overshoot-motion, Spring-motion, Stretching, Damped-oscillation
- **Recipes:** pull handle with rubber-band resistance at the end · snaps to half/full positions · content behind scales down slightly · paper drawer slides out of a cabinet

### Accordion
- **Behaviors:** Toggle-dependent, Activation-dependent, Hierarchical, Nested, Selection-dependent, Keyboard-controlled, Self-expanding, Self-collapsing
- **Effects:** Unfolding, Folding, Expansion, Contracting, Rotating, Sliding, Rising
- **Recipes:** height eases open, chevron rotates, content fades up · opening one closes the others · folds open like a paper map · plus morphs into minus

### Expandable panel
- **Behaviors:** Toggle-dependent, Self-resizing, Context-aware, Reversible, Interruptible
- **Effects:** Expansion, Morphing-transition, Unfolding, Stretching, Sliding, Sweeping
- **Recipes:** "read more" grows smoothly with a fade mask · card expands into a full-screen panel (FLIP) and back · clip-path circle grows from the button

### Footer
- **Behaviors:** Scroll-revealed, Scroll-triggered, Sticky, Parallax, Hover-dependent, Visibility-dependent
- **Effects:** Rising, Sliding, Splitting, Wave-deformation, Drifting, Attraction-motion, Shape-assembly
- **Recipes:** page lifts to reveal a fixed footer underneath · huge wordmark rises letter by letter · infinite marquee of links · links lean toward the cursor

## Overlays & Popups

### Modal
- **Behaviors:** Activation-dependent, Focus-dependent, Toggle-dependent, Interruptible, Cancellable, Keyboard-controlled, Context-aware
- **Effects:** Expansion, Rising, Dropping, Morphing-transition, Unfolding, Dissolving, Springing, Shaking
- **Recipes:** grows out of the button that opened it (FLIP) · drops in with a small overshoot · backdrop blurs in · shakes on invalid action · unfolds like a letter

### Dialog
- **Behaviors:** Activation-dependent, Focus-dependent, Event-driven, Priority-based, Cancellable, Keyboard-controlled
- **Effects:** Rising, Expansion, Shaking, Wobbling, Pulsating, Sliding, Dissolving
- **Recipes:** confirm dialog scales up from 0.95 with a fade · destructive button pulses softly · wrong input shakes the box · stacked dialogs slide back

### Tooltip
- **Behaviors:** Hover-dependent, Focus-dependent, Cursor-following, Pointer-tracking, Boundary-aware, Self-repositioning, Transient, Temporary
- **Effects:** Rising, Expansion, Sliding, Swinging, Wobbling, Shape-assembly
- **Recipes:** pops from its arrow with a tiny overshoot · follows the cursor with lag · flips side near the edge · swings on a string · text types in

### Popover
- **Behaviors:** Activation-dependent, Anchored, Attached, Boundary-aware, Self-repositioning, Nested, Focus-dependent
- **Effects:** Expansion, Unfolding, Morphing, Sliding, Rising, Sweeping
- **Recipes:** grows from the anchor point · one popover morphs between triggers · unfolds like a paper note · menu items stagger in

### Toast
- **Behaviors:** Transient, Temporary, Time-driven, Queue-based, Priority-based, Swipe-controlled, Pausable, Hover-dependent, Auto-advancing
- **Effects:** Sliding, Rising, Dropping, Bouncing, Contracting, Sweeping, Accumulation
- **Recipes:** slides in from the corner, stacks with a slight scale · timer bar sweeps, pauses on hover · swipe to dismiss · stack fans out on hover

### Lightbox
- **Behaviors:** Activation-dependent, Gesture-driven, Swipe-controlled, Pinch-controlled, Draggable, Keyboard-controlled, Looping, Velocity-aware
- **Effects:** Morphing-transition, Expansion, Sliding, Projectile-motion, Dissolving
- **Recipes:** thumbnail grows into the full image (FLIP) · swipe between images · drag down to close, background fades with distance · pinch to zoom

### Bottom sheet
- **Behaviors:** Draggable, Swipe-controlled, Snapping, Snap-to-position, Elastic, Inertial, Velocity-aware, Boundary-aware
- **Effects:** Sliding, Rising, Spring-motion, Overshoot-motion, Stretching, Damped-oscillation
- **Recipes:** drag handle with detents (peek / half / full) · fling to close by velocity · rubber-band at the top · page behind scales down

## Forms & Inputs

### Text field
- **Behaviors:** Focus-dependent, State-dependent, Event-driven, Reactive, Self-resizing, Keyboard-controlled
- **Effects:** Rising, Sliding, Stretching, Shaking, Sweeping, Path-following, Pulsating, Morphing
- **Recipes:** label floats up on focus · underline draws from the click point · shakes on error, ink turns red · check pops in when valid · password eye blinks

### Search bar
- **Behaviors:** Focus-dependent, Activation-dependent, Self-expanding, Load-dependent, Event-driven, Keyboard-controlled
- **Effects:** Expansion, Morphing, Sliding, Rotating, Rising, Shimmering, Scanning
- **Recipes:** icon expands into the full bar · results stagger in under it · magnifier morphs to spinner then X · placeholder cycles suggestions

### Select
- **Behaviors:** Activation-dependent, Selection-dependent, Keyboard-controlled, Boundary-aware, Scroll-snapping
- **Effects:** Unfolding, Dropping, Sliding, Rolling, Rotating, Morphing, Rising
- **Recipes:** list unfolds from the field · options roll like a drum wheel · chosen item slides into the field · chevron flips

### Date picker
- **Behaviors:** Selection-dependent, Direction-aware, Swipe-controlled, Keyboard-controlled
- **Effects:** Sliding, Axial-rotation, Liquid-morphing, Stretching, Expansion, Folding
- **Recipes:** months slide in the direction you move · range highlight stretches across days · tear-off calendar page flips · selected day pops

### Textarea
- **Behaviors:** Self-resizing, Focus-dependent, Reactive, Event-driven, Keyboard-controlled
- **Effects:** Expansion, Stretching, Rolling, Pulsating, Shaking, Shape-assembly
- **Recipes:** grows with content smoothly · character counter rolls and turns red near the limit · lined paper extends

### File upload
- **Behaviors:** Drag-and-drop, Hover-dependent, Load-dependent, Event-driven, Queue-based, Proximity-aware
- **Effects:** Bouncing, Expansion, Dropping, Falling, Sweeping, Morphing, Pulsating, Crumpling, Accumulation
- **Recipes:** drop zone breathes when a file hovers · file drops into a folder · progress ring fills, morphs to check · removed file crumples away

## Typography & Media

### Heading
- **Behaviors:** Scroll-revealed, Scroll-scrubbed, Hover-dependent, Pointer-tracking, Staggered, Sequential, Load-dependent
- **Effects:** Rising, Splitting, Sliding, Rotating, Scattering, Reassembly, Stretching, Wave-propagation, Glitching, RGB-splitting, Distortion, Morphing
- **Recipes:** letters rise from a mask, staggered · words scatter on hover and reassemble · weight/width morphs with scroll · glitch flicker on load

### Paragraph
- **Behaviors:** Scroll-revealed, Scroll-scrubbed, Staggered, Sequential, Visibility-dependent
- **Effects:** Rising, Sliding, Dissolving, Sweeping, Accumulation
- **Recipes:** lines rise one by one · words light up as you scroll (scrubbed opacity) · marker highlight sweeps behind key phrases

### Text reveal
- **Behaviors:** Scroll-triggered, Scroll-scrubbed, Load-dependent, Sequential, Staggered, Time-driven, Randomized
- **Effects:** Sweeping, Rising, Splitting, Glitching, Shape-assembly, Dissolving, Unfolding, Falling
- **Recipes:** mask wipes across · characters scramble then resolve · typewriter with blinking caret · letters fall in and bounce · blur-to-sharp

### Image
- **Behaviors:** Scroll-revealed, Parallax, Hover-dependent, Pointer-tracking, Load-dependent, Scroll-scrubbed
- **Effects:** Sweeping, Expansion, Drifting, Distortion, Ripple-deformation, Pixel-dissolving, Dissolving, Rotating, RGB-splitting
- **Recipes:** reveal through a growing mask · slow zoom inside a fixed frame · develops like a photo print · ripple distortion on hover (WebGL) · parallax in frame

### Gallery
- **Behaviors:** Horizontal-scrolling, Scroll-pinned, Draggable, Inertial, Momentum-driven, Infinite-scrolling, Snapping, Swipe-controlled, Auto-sliding, Looping
- **Effects:** Sliding, Distortion, Expansion, Morphing-transition, Rotating, Velocity-streak
- **Recipes:** pinned horizontal scroll · drag with inertia, images skew with speed · grid ↔ list via FLIP · infinite loop marquee · click expands to full view

### Video
- **Behaviors:** Visibility-dependent, Hover-dependent, Scroll-scrubbed, Auto-playing, Pausable, Resumable, Cursor-following
- **Effects:** Expansion, Morphing-transition, Sweeping, Pulsating, Morphing
- **Recipes:** scroll scrubs the frames · plays on hover, pauses when out of view · play button follows the cursor · thumbnail expands to full screen

### Avatar
- **Behaviors:** Hover-dependent, Staggered, State-dependent, Event-driven, Hierarchical
- **Effects:** Expansion, Sliding, Bouncing, Pulsating, Breathing, Rotating, Divergence
- **Recipes:** stacked avatars fan out on hover · online dot pulses · photo bounces in · story ring rotates while loading

### Icon
- **Behaviors:** Hover-dependent, State-dependent, Looping, Event-driven, Toggle-dependent
- **Effects:** Path-morphing, Path-following, Rotating, Spinning, Wiggle, Bouncing, Shaking, Pulsating, Morphing
- **Recipes:** stroke draws itself · hamburger ↔ X morph · bell wiggles on notify · arrow nudges on hover · loader spins

## Data & Feedback

### Charts
- **Behaviors:** Scroll-triggered, Visibility-dependent, Hover-dependent, Pointer-tracking, Staggered, Sequential, Event-driven
- **Effects:** Path-following, Rising, Expansion, Morphing, Rolling, Pulsating
- **Recipes:** line draws in, points pop · bars grow from 0, staggered · pie slices sweep around · morph between datasets · crosshair follows the cursor

### Tables
- **Behaviors:** Selection-dependent, Sticky, Scroll-linked, Hover-dependent, Staggered, State-dependent
- **Effects:** Sliding, Expansion, Sweeping, Rising, Contracting
- **Recipes:** rows reorder with FLIP on sort · row expands to show details · new row flashes then settles · filtered rows collapse out

### Progress bar
- **Behaviors:** Load-dependent, Scroll-linked, Time-driven, State-dependent, Continuous, Discrete
- **Effects:** Stretching, Sliding, Shimmering, Wave-propagation, Fluid-flow, Pulsating, Bouncing
- **Recipes:** reading progress tied to scroll · shimmer runs while indeterminate · liquid fill with a wave top · bounce and turn green at 100%

### Loader
- **Behaviors:** Looping, Continuous, Load-dependent, Time-driven, Cyclic, Ping-pong
- **Effects:** Spinning, Rotating, Bouncing, Pulsating, Breathing, Orbiting, Liquid-morphing, Metaball-morphing, Path-following, Morphing
- **Recipes:** three dots bounce in sequence · gooey blobs orbit · line draws a looping path · paper plane flies a loop · ink drop pulses

### Skeleton
- **Behaviors:** Load-dependent, Looping, Continuous, Synchronized, Staggered
- **Effects:** Shimmering, Sweeping, Breathing, Pulsating, Dissolving
- **Recipes:** shimmer sweeps across all blocks in sync · blocks pulse softly · crossfade into real content, staggered

### Badges
- **Behaviors:** State-dependent, Event-driven, Reactive, Transient
- **Effects:** Bouncing, Expansion, Pulsating, Rolling, Shaking, Shimmering, Springing
- **Recipes:** count rolls up and the badge pops · "new" badge shimmers once · dot pulses for live status

### Notifications
- **Behaviors:** Event-driven, Queue-based, Priority-based, Transient, Time-driven, Swipe-controlled, Pausable, Hierarchical
- **Effects:** Sliding, Dropping, Bouncing, Wiggle, Shaking, Expansion, Contracting, Accumulation
- **Recipes:** bell rings, badge pops, panel drops in · cards stack and expand on hover · swipe away to dismiss · urgent ones shake once
