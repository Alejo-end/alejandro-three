import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
  ...nextCoreWebVitals,
  prettier,
  {
    rules: {
      // react-three-fiber renders three.js objects as JSX, so props like
      // `position`, `args` and `intensity` are not DOM attributes.
      'react/no-unknown-property': 'off',
    },
  },
  {
    // The canvas components drive three.js imperatively. `useFrame` runs on
    // every animation frame, outside React's render, and its whole job is to
    // mutate materials and geometry in place. The React Compiler rules model a
    // pure render and read that as illegal mutation, so they are off here and
    // stay on everywhere else.
    files: ['src/components/canvas/**'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
    },
  },
]
