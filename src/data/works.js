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
    blurb: 'Interlocking pieces built from small cubes. You can edit the code on the page.',
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
    blurb: 'A playable keyboard running on sampled notes.',
  },
]

export const matrix = [
  {
    slug: 'camera-feedback',
    title: 'Camera feedback',
    meta: 'Wants a camera',
    image: '/images/hydra.png',
    route: cameraFeedbackKaleid,
    external: true,
    bleed: true,
    blurb: 'The camera and the screen feed back into each other, tiled and pulled out of shape.',
  },
  {
    slug: 'p5-overlay',
    title: 'Audio-reactive p5 overlay',
    meta: 'Wants a camera and a mic',
    image: '/images/hydra2.png',
    route: audioReactiveP5Overlay,
    external: true,
    bleed: true,
    blurb: 'Typed phrases and drawings over a camera feed that moves with the sound.',
  },
  {
    slug: 'bass-gated-scenes',
    title: 'Scenes that follow the bass',
    meta: 'Wants a camera and a mic',
    image: '/images/hydra3.png',
    route: bassGatedScenes,
    external: true,
    bleed: true,
    blurb:
      'A black field with at most three things in it: a blob, a line that steps on the beat, and a strobe that fires on the low end. Change SCENE from A to E and run it again to switch.',
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
    lead: 'Things I photographed from every side, then rebuilt as models you can turn around. Point at one and its surface breaks apart under the cursor.',
    items: geometry,
  },
  {
    id: 'audio',
    cord: 'audio',
    cordLabel: 'audio signal',
    title: 'Patches on the web',
    count: `${audio.length} sketches`,
    lead: 'Small instruments that run in the page and make sound as you move or type. Each one starts silent, so click before you expect to hear anything.',
    items: audio,
    link: { href: 'https://alejandro-p5-rnbo.vercel.app/', label: 'All the sketches' },
  },
  {
    id: 'matrix',
    cord: 'matrix',
    cordLabel: 'video matrix',
    title: 'Live coding',
    count: `${matrix.length} scripts`,
    lead: 'Moving images written as a few lines of code. Opening one drops you into an editor with it already running, so you can change it and watch what happens.',
    items: matrix,
  },
]
