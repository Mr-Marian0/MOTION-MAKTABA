/**
 * THE COLLECTIONS — the library's index. One object = one row + one page.
 * Rows alternate automatically: odd rows put the plate on the left,
 * even rows on the right. Drawer numbers come from the order below.
 *
 * Adding a category:
 *   1. add an object below
 *   2. copy library/_template.html → library/<category>.html
 *      and set data-category="<category>"
 *
 * Fields
 *   title         row + page title
 *   category      slug → library/<category>.html
 *   description   one or two sentences
 *   items         the components filed in this drawer (shown as tags)
 *   itemLinks     true → each tag links to the drawer filtered by that element
 *   hint          tiny instruction on the plate
 *   effect        src/js/effects/<effect>.js powers the live plate
 *   effectOptions passed to the effect's init() (ui-specimen reads `kind`)
 */
export const cards = [
  {
    title: 'Navigation Bar',
    category: 'navigation',
    description: 'The signposts of an interface. How people find their way in, move around, and always know where they are.',
    items: ['Navbar', 'Sidebar', 'Hamburger menu', 'Dropdown', 'Tabs', 'Breadcrumbs', 'Pagination'],
    itemLinks: true, // tags open the drawer already filtered to that element
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'navigation' },
  },
  {
    title: 'Buttons & Controls',
    category: 'buttons-controls',
    description: 'Small things you press, flip and drag. Each one should answer back the moment it is touched.',
    items: ['Primary button', 'Icon button', 'Toggle', 'Checkbox', 'Radio', 'Slider', 'FAB'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'controls' },
  },
  {
    title: 'Cards & Containers',
    category: 'cards-containers',
    description: 'Content kept in neat paper sleeves: stacked, shuffled, flipped over and pulled out for a closer look.',
    items: ['Product card', 'Profile card', 'Pricing card', 'Content card', 'Widget', 'Card stack'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'cards' },
  },
  {
    title: 'Panels & Sections',
    category: 'panels-sections',
    description: 'The big folds of a page. Regions that open, slide out and tuck themselves away again.',
    items: ['Hero section', 'Sidebar panel', 'Drawer', 'Accordion', 'Expandable panel', 'Footer'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'panels' },
  },
  {
    title: 'Overlays & Popups',
    category: 'overlays-popups',
    description: 'Notes slipped on top of the page. They arrive, say their piece, and leave without a mess.',
    items: ['Modal', 'Dialog', 'Tooltip', 'Popover', 'Toast', 'Lightbox', 'Bottom sheet'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'overlays' },
  },
  {
    title: 'Forms & Inputs',
    category: 'forms-inputs',
    description: 'Blanks waiting to be filled in. Fields that guide the pen, catch mistakes kindly and confirm with care.',
    items: ['Text field', 'Search bar', 'Select', 'Date picker', 'Textarea', 'File upload'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'forms' },
  },
  {
    title: 'Typography & Media',
    category: 'typography-media',
    description: 'Words and pictures set on the page. Headlines that reveal themselves and images that develop like prints.',
    items: ['Heading', 'Paragraph', 'Text reveal', 'Image', 'Gallery', 'Video', 'Avatar', 'Icon'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'media' },
  },
  {
    title: 'Data & Feedback',
    category: 'data-feedback',
    description: 'Numbers with a pulse. Charts that grow, loaders that wait politely, and badges that tap you on the shoulder.',
    items: ['Charts', 'Tables', 'Progress bar', 'Loader', 'Skeleton', 'Badges', 'Notifications'],
    itemLinks: true,
    hint: 'Hover to hurry',
    effect: 'ui-specimen',
    effectOptions: { kind: 'data' },
  },
];
