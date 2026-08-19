// The rail is a bundle of three cords leaving the hero's outlet. Each section
// consumes one, so the bundle thins as you scroll.

export const CORDS = ['data', 'audio', 'matrix']

// Lane offsets inside the rail. Ordered so the cord consumed first sits nearest
// the content column: no cord ever has to cross a live one to reach its inlet.
export const LANE_X = { data: 64, audio: 39, matrix: 14 }

export const CORD_OF = { geometry: 'data', audio: 'audio', matrix: 'matrix' }

// Where a cord turns in to meet its object, measured from the section's top.
const INLET_Y = 52

/**
 * Vertical cord runs drawn down the rail beside a section. `carries` lists the
 * cords still in flight here; `terminates` is the one that turns in at this
 * section, so its run stops at the inlet instead of continuing down.
 */
export function CordRuns({ carries, terminates }) {
  return (
    <div aria-hidden className='pointer-events-none absolute inset-y-0 left-0 hidden w-rail md:block'>
      {carries.map((cord) => (
        <span
          key={cord}
          data-cord={cord}
          className='cord-run'
          style={{
            left: LANE_X[cord],
            ...(cord === terminates ? { bottom: 'auto', height: INLET_Y + 3 } : null),
          }}
        />
      ))}
    </div>
  )
}

/** The inlet: the cord turns right off the rail and lands on the object's edge. */
export function Inlet({ cord }) {
  return (
    <span aria-hidden className='pointer-events-none absolute left-0 top-0 hidden w-rail md:block' style={{ height: INLET_Y + 12 }}>
      <span
        data-cord={cord}
        className='cord-tick absolute'
        style={{ left: LANE_X[cord], right: 5, top: INLET_Y, transform: 'translateY(-50%)' }}
      />
      <span className='nub absolute' style={{ right: 0, top: INLET_Y, height: 15, width: 5, marginTop: -7.5 }} />
    </span>
  )
}

/** The hero's outlet: the bundle's origin, three nubs on the rail. */
export function Outlet() {
  return (
    <div aria-hidden className='relative hidden h-14 w-rail md:block'>
      {CORDS.map((cord) => (
        <span key={cord}>
          <span className='nub absolute top-0' style={{ left: LANE_X[cord] - 4 }} />
          <span data-cord={cord} className='cord-run' style={{ left: LANE_X[cord], top: 4 }} />
        </span>
      ))}
    </div>
  )
}

/** Mobile fallback: a stub of the section's own cord, keeping the taxonomy visible. */
export function CordStub({ cord }) {
  return <span aria-hidden data-cord={cord} className='cord-tick block w-12 md:hidden' />
}

/** The key: which cord means what. */
export function CordKey() {
  const legend = [
    { cord: 'data', label: 'geometry' },
    { cord: 'audio', label: 'audio signal' },
    { cord: 'matrix', label: 'video matrix' },
  ]
  return (
    <dl className='t-label flex flex-wrap items-center gap-x-7 gap-y-3 text-muted'>
      <dt className='sr-only'>Cord key</dt>
      {legend.map(({ cord, label }) => (
        <dd key={cord} className='flex items-center gap-2.5'>
          <span data-cord={cord} className='cord-tick block w-9' />
          <span>{label}</span>
        </dd>
      ))}
    </dl>
  )
}
