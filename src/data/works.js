import { audioReactiveP5Overlay, bassGatedScenes, cameraFeedbackKaleid } from './liveCoding'

// Every piece on the site, grouped by the kind of signal its cord carries.
// `bleed` marks a thumbnail that fills its own frame (a screen); everything
// else is a cut-out that sits straight on the page (an object).

export const geometry = [
  {
    slug: 'lintulahdenaukio',
    title: 'Goose sculpture',
    meta: 'Lintulahdenaukio, Helsinki',
    image: '/images/lintulahdenaukio.png',
    route: '/three/lintulahdenaukio',
    blurb: 'Seven bronze geese on a slab of pavement, photographed from all sides.',
  },
  {
    slug: 'trash',
    title: 'Public bin',
    meta: 'Helsinki',
    image: '/images/trash.png',
    route: '/three/trash',
    blurb: 'A street litter bin, scanned with the pavement and fence around it.',
  },
  {
    slug: 'snowman',
    title: 'Snowman',
    meta: "Karhupuisto, Helsinki",
    image: '/images/snowman.png',
    route: '/three/snowman',
    blurb: 'Made by someone in the park over New Year, scanned before it melted.',
  },
  {
    slug: 'afx',
    title: 'Selected Ambient Works Vol. II',
    meta: 'Record shelf',
    image: '/images/afx.png',
    route: '/three/afx',
    blurb: 'The vinyl box set, scanned at home on a desk.',
  },
  {
    slug: 'erzbrau',
    title: 'Erz Bräu label',
    meta: 'Gaming, Austria',
    image: '/images/erzbrau.png',
    route: '/three/erzbrau',
    blurb: 'A beer label taken off a bottle and flattened out.',
  },
  {
    slug: 'puzzle',
    title: 'Puzzle cube',
    meta: 'Live editor',
    tag: 'Built by hand',
    image: '/images/puzzle.png',
    route: '/three/puzzle',
    bleed: true,
    blurb: 'Interlocking pieces built from unit cubes. The source is editable in the page.',
  },
]

export const audio = [
  {
    slug: 'mouse-theremin',
    title: 'Mouse theremin',
    meta: 'Pointer → pitch',
    image: '/images/audiovisualizer.png',
    route: 'https://alejandro-p5-rnbo.vercel.app/sketches/mouse-theremin',
    external: true,
    bleed: true,
    blurb: 'Move the pointer to change the pitch. The circle shows the amplitude.',
  },
  {
    slug: 'ambient-generator',
    title: 'Ambient generator',
    meta: 'Eight knobs, no presets',
    image: '/images/ambient-generator.png',
    route: 'https://alejandro-p5-rnbo.vercel.app/sketches/ambient-generator',
    external: true,
    blurb: 'A self-playing patch with pitch, filter and delay controls.',
  },
  {
    slug: 'piano-sketch',
    title: 'Piano sketch',
    meta: 'Keyboard → notes',
    image: '/images/piano.png',
    route: 'https://alejandro-p5-rnbo.vercel.app/sketches/piano-sketch',
    external: true,
    blurb: 'A playable keyboard running on a sampler exported from Max.',
  },
]

export const matrix = [
  {
    slug: 'camera-feedback',
    title: 'Camera feedback, kaleid',
    meta: 'Wants a camera',
    image: '/images/hydra.png',
    route: cameraFeedbackKaleid,
    external: true,
    bleed: true,
    blurb: 'The camera and the screen modulate each other through kaleid and voronoi.',
  },
  {
    slug: 'p5-overlay',
    title: 'Audio-reactive p5 overlay',
    meta: 'Wants a camera and a mic',
    image: '/images/hydra2.png',
    route: audioReactiveP5Overlay,
    external: true,
    bleed: true,
    blurb: 'Typed phrases and drawings over an FFT-modulated camera feed.',
  },
  {
    slug: 'bass-gated-scenes',
    title: 'Bass-gated scenes',
    meta: 'Wants a camera and a mic',
    image: '/images/hydra3.png',
    route: bassGatedScenes,
    external: true,
    bleed: true,
    blurb:
      'A black field with at most three elements: a blob, a line that steps on the beat, and a bass-gated strobe. Change SCENE from A to E and re-run to switch.',
  },
]

// The three sections, in the order the cords leave the hero.
export const sections = [
  {
    id: 'geometry',
    cord: 'data',
    cordLabel: 'geometry',
    title: 'Objects',
    count: `${geometry.length} captures`,
    lead: 'Objects photographed and rebuilt as meshes in RealityScan, shown in a three.js viewport you can drag. The files are large and unoptimised — the biggest take about a minute to load.',
    items: geometry,
  },
  {
    id: 'audio',
    cord: 'audio',
    cordLabel: 'audio signal',
    title: 'Patches on the web',
    count: `${audio.length} sketches`,
    lead: 'Max/MSP patches exported with RNBO and wired to p5.js sketches. They run in the browser and start silent, so each one needs a click before it makes sound.',
    items: audio,
    link: { href: 'https://alejandro-p5-rnbo.vercel.app/', label: 'All p5 + RNBO sketches' },
  },
  {
    id: 'matrix',
    cord: 'matrix',
    cordLabel: 'video matrix',
    title: 'Live coding',
    count: `${matrix.length} scripts`,
    lead: 'Hydra scripts shared as their own source. Opening one loads the code into hydra.ojack.xyz, already running, so you can edit it there.',
    items: matrix,
  },
]
