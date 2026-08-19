import { audioReactiveP5Overlay, bassGatedScenes, cameraFeedbackKaleid } from './liveCoding'

// Every piece on the site, grouped by the kind of signal its cord carries.
// `bleed` marks a thumbnail that fills its own frame (a screen); everything else
// is a cut-out that floats straight on the page (an object).

export const geometry = [
  {
    slug: 'lintulahdenaukio',
    title: 'Goose sculpture',
    meta: 'Lintulahdenaukio, Helsinki',
    image: '/images/lintulahdenaukio.png',
    route: '/three/lintulahdenaukio',
    blurb: 'Seven bronze geese on a patch of pavement, photographed from every angle a person can stand at.',
  },
  {
    slug: 'trash',
    title: 'Public bin',
    meta: 'Helsinki',
    image: '/images/trash.png',
    route: '/three/trash',
    blurb: 'A city litter bin. Nobody has ever asked for a 3D model of one, which is most of the appeal.',
  },
  {
    slug: 'snowman',
    title: 'Snowman',
    meta: "Karhupuisto, Helsinki",
    image: '/images/snowman.png',
    route: '/three/snowman',
    blurb: 'Built by strangers, scanned before it melted. The capture outlived the snow by a few days.',
  },
  {
    slug: 'afx',
    title: 'Selected Ambient Works Vol. II',
    meta: 'Record shelf',
    image: '/images/afx.png',
    route: '/three/afx',
    blurb: 'The vinyl box set, scanned at home. Matte board and a debossed logo — a hard surface for photogrammetry.',
  },
  {
    slug: 'erzbrau',
    title: 'Erz Bräu label',
    meta: 'Gaming, Austria',
    image: '/images/erzbrau.png',
    route: '/three/erzbrau',
    blurb: 'A beer label peeled off a bottle and flattened out. Thin, creased, and barely there as geometry.',
  },
  {
    slug: 'puzzle',
    title: 'Puzzle cube',
    meta: 'Live editor',
    tag: 'Built by hand',
    image: '/images/puzzle.png',
    route: '/three/puzzle',
    bleed: true,
    blurb: 'Interlocking pieces assembled from unit cubes. The source is editable in the page and rebuilds as you type.',
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
    blurb: 'Move the pointer, bend the tone. The circle is the amplitude.',
  },
  {
    slug: 'ambient-generator',
    title: 'Ambient generator',
    meta: 'Eight knobs, no presets',
    image: '/images/ambient-generator.png',
    route: 'https://alejandro-p5-rnbo.vercel.app/sketches/ambient-generator',
    external: true,
    blurb: 'A self-playing patch with pitch, filter and delay left out on the surface.',
  },
  {
    slug: 'piano-sketch',
    title: 'Piano sketch',
    meta: 'Keyboard → notes',
    image: '/images/piano.png',
    route: 'https://alejandro-p5-rnbo.vercel.app/sketches/piano-sketch',
    external: true,
    blurb: 'Keys you can actually play, running on a sampler exported from Max.',
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
    blurb: 'The camera and the screen modulate each other until the feedback finds a shape.',
  },
  {
    slug: 'p5-overlay',
    title: 'Audio-reactive p5 overlay',
    meta: 'Wants a camera and a mic',
    image: '/images/hydra2.png',
    route: audioReactiveP5Overlay,
    external: true,
    bleed: true,
    blurb: 'Typed phrases and slow doodles thrown over an FFT-modulated camera feed.',
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
      'A near-black field that never holds more than three things at once: a blob breathing on the low end, a hairline stepping on the beat, a strobe the bass opens. Switch SCENE from A to E and re-run to move through the set.',
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
    lead: 'Things photographed on the street or on a shelf, rebuilt as meshes in RealityScan, and hung in a three.js viewport you can spin. The meshes are big and unoptimised, so the largest take the better part of a minute to arrive.',
    items: geometry,
  },
  {
    id: 'audio',
    cord: 'audio',
    cordLabel: 'audio signal',
    title: 'Patches on the web',
    count: `${audio.length} sketches`,
    lead: 'Max/MSP patches exported through RNBO and wired into p5.js sketches. They run in the browser and start silent — every one waits for a click before it makes a sound.',
    items: audio,
    link: { href: 'https://alejandro-p5-rnbo.vercel.app/', label: 'All p5 + RNBO sketches' },
  },
  {
    id: 'matrix',
    cord: 'matrix',
    cordLabel: 'video matrix',
    title: 'Live coding',
    count: `${matrix.length} scripts`,
    lead: 'Hydra scripts, shared as their own source. Opening one loads the code into hydra.ojack.xyz, already running, where you can rewrite it line by line.',
    items: matrix,
  },
]
