import './helper'
import { afterEach, expect, test } from 'bun:test'
import { type Component, unmountAll } from '../index'
import { render, run, serializeElement } from '../test'

afterEach(unmountAll)

test('Fragments are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function MyComponent(this: Component) {
    context = this

    if (stage === 4) {
      return null
    }

    if (stage === 3) {
      return (
        <>
          <i />
          <p />
        </>
      )
    }

    if (stage === 2) {
      return (
        <>
          <p />
        </>
      )
    }

    if (stage === 1) {
      return null
    }

    return (
      <>
        <i />
        <p />
      </>
    )
  }

  const { serialized } = render(<MyComponent />)

  expect(serialized).toEqual('<body><i></i><p></p></body>')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body></body>')

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p></p></body>')

  stage = 3
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><i></i><p></p></body>')

  stage = 4
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body></body>')
})

test('Fragments and other structures are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function MyComponent(this: Component) {
    context = this

    if (stage === 4) {
      return <div>stage four</div>
    }

    if (stage === 3) {
      return (
        <>
          <div id="second">second</div>
          <button type="button" class="third">
            third
          </button>
          <div id="first">first</div>
        </>
      )
    }

    if (stage === 2) {
      return <div>stage two</div>
    }

    if (stage === 1) {
      return (
        <>
          <div id="first">first</div>
          <div id="second">second</div>
          <button type="button" class="third">
            third
          </button>
        </>
      )
    }

    return <div>initial</div>
  }

  const { serialized } = render(<MyComponent />)

  expect(serialized).toEqual('<body><div>initial</div></body>')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><div id="first">first</div><div id="second">second</div><button type="button" class="third">third</button></body>',
  )

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><div>stage two</div></body>')
})

test('Fragments and other structures are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function MyComponent(this: Component) {
    context = this

    if (stage === 2) {
      return <div>after</div>
    }

    if (stage === 1) {
      return (
        <>
          <p>Nested Route: "Route!"</p>
          <a
            href="/"
            style={{
              textDecoration: 'none',
            }}
            onClick={(event) => {
              event.preventDefault()
            }}
          >
            Go to Homepage
          </a>
        </>
      )
    }

    return <div>initial</div>
  }

  const { serialized } = render(<MyComponent />)

  expect(serialized).toEqual('<body><div>initial</div></body>')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><p>Nested Route: "Route!"</p><a href="/" style="text-decoration: none;">Go to Homepage</a></body>',
  )

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><div>after</div></body>')
})

test('Various tags are properly cleaned up and rerendered.', () => {
  let context: Component
  let stage = 0

  function MyComponent(this: Component) {
    context = this

    if (stage === 4) {
      return (
        <section>
          <p>static</p>
          <svg viewBox="1">
            <title>Another one!</title>
            <path clipRule="evenodd" fillRule="evenodd" d="2" fill="white" />
          </svg>
        </section>
      )
    }

    if (stage === 3) {
      return (
        <section>
          <svg viewBox="0">
            <title>Loader</title>
            <path fillRule="evenodd" clipRule="evenodd" d="1" fill="black" />
            <g>
              <circle cx="41" cy="9" r="6.5" stroke="#EFEFEF" strokeWidth={6} />
            </g>
          </svg>
          <p>static</p>
        </section>
      )
    }

    if (stage === 2) {
      return (
        <section>
          <div id="second">
            <button>click 2</button>
          </div>
          <button>click3</button>
          <div id="first">
            <>
              <button>click 1</button>
            </>
          </div>
        </section>
      )
    }

    if (stage === 1) {
      return (
        <section>
          <>
            <div id="second">
              <button>click 2</button>
            </div>
          </>
          <div id="first">
            <button>click 1</button>
          </div>
        </section>
      )
    }

    return (
      <section>
        <>
          <div id="first">
            <>
              <button>click 1</button>
            </>
          </div>
          <div id="second">
            <button>click 2</button>
          </div>
        </>
      </section>
    )
  }

  const { serialized } = render(<MyComponent />)

  expect(serialized).toEqual(
    '<body><section><div id="first"><button>click 1</button></div><div id="second"><button>click 2</button></div></section></body>',
  )

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><section><div id="second"><button>click 2</button></div><div id="first"><button>click 1</button></div></section></body>',
  )

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><section><div id="second"><button>click 2</button></div><button>click3</button><div id="first"><button>click 1</button></div></section></body>',
  )

  stage = 3
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><section><svg viewBox="0"><title>Loader</title><path d="1" fill="black" fill-rule="evenodd" clip-rule="evenodd"/><g><circle cx="41" cy="9" r="6.5" stroke="#EFEFEF" stroke-width="6"/></g></svg><p>static</p></section></body>',
  )

  stage = 4
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><section><p>static</p><svg viewBox="1"><title>Another one!</title><path d="2" fill="white" clip-rule="evenodd" fill-rule="evenodd"/></svg></section></body>',
  )
})

test('Unchanged elements do not get replaced.', () => {
  const context: { layout?: Component; app?: Component } = {}
  let stage = 0

  function Layout(this: Component, { children }) {
    context.layout = this
    return (
      <div id="wrapper">
        <header id="header">head</header>
        {children}
      </div>
    )
  }

  function App(this: Component) {
    context.app = this

    if (stage === 2) {
      return (
        <Layout>
          <div>stage two</div>
        </Layout>
      )
    }

    if (stage === 1) {
      return (
        <Layout>
          <>
            <div id="first">first</div>
            <div id="second">second</div>
          </>
        </Layout>
      )
    }

    return (
      <Layout>
        <div>initial</div>
      </Layout>
    )
  }

  const { serialized, tree } = render(<App />)

  expect(serialized).toEqual('<body><div id="wrapper"><header id="header">head</header><div>initial</div></div></body>')

  const wrapper = tree.children[0].children[0].children[0].getElement() as HTMLDivElement
  const header = tree.children[0].children[0].children[0].children[0].getElement() as HTMLHeadElement

  // When rerendered these would get overridden.
  wrapper.id = 'wrapper changed'
  header.id = 'header_changed'

  stage = 1
  context.app.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><div id="wrapper changed"><header id="header_changed">head</header><div id="first">first</div><div id="second">second</div></div></body>',
  )

  stage = 2
  context.app.rerender()
  context.layout.rerender()
  run()

  wrapper.id = 'wrapper'
  header.id = 'header'

  expect(serializeElement()).toEqual('<body><div id="wrapper"><header id="header">head</header><div>stage two</div></div></body>')
})

test('Only the necessary elements are deleted.', () => {
  let context: Component
  let stage = 0

  function App(this: Component) {
    if (stage === 1) {
      return (
        <section id="section">
          <span>hey</span>
        </section>
      )
    }

    return (
      <section id="section">
        <p>hey</p>
      </section>
    )
  }

  function AnoterWrapper({ children }) {
    return children
  }

  function Wrapper() {
    context = this

    return (
      <AnoterWrapper>
        <article id="article">
          <App />
        </article>
      </AnoterWrapper>
    )
  }

  const { serialized } = render(<Wrapper />)

  expect(serialized).toEqual('<body><article id="article"><section id="section"><p>hey</p></section></article></body>')

  document.getElementById('section').setAttribute('aria-label', 'still-here')
  expect(document.getElementById('section').getAttribute('aria-label')).toEqual('still-here')
  document.getElementById('article').setAttribute('aria-label', 'still-here')
  expect(document.getElementById('article').getAttribute('aria-label')).toEqual('still-here')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><article id="article" aria-label="still-here"><section id="section" aria-label="still-here"><span>hey</span></section></article></body>',
  )
})

test('Plugins can render custom JSX based on global state.', () => {
  let context: Component
  const state = {
    loading: true,
    error: false as boolean | string,
  }

  const loading = (value: boolean) => value && <p>Loading...</p>
  const error = (value: boolean | string) => value && <p>{value}</p>

  function App(this: Component) {
    context = this
    this.plugin([loading(state.loading), error(state.error)])
    return <p>Ready</p>
  }

  const { serialized } = render(<App />)

  expect(serialized).toEqual('<body><p>Loading...</p></body>')

  state.loading = false
  state.error = 'Failed to load data'
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p>Failed to load data</p></body>')

  state.error = false
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p>Ready</p></body>')
})

test('Children of wrapping fibers are properly reassigned when rerendering.', () => {
  const context = {} as { first: Component; wrapper: Component }
  let stage = 0

  function First(this: Component) {
    context.first = this

    if (stage === 2) {
      return <p id="second">Second</p>
    }

    if (stage === 1) {
      return <span id="result">Result</span>
    }

    return <p id="loading">Loading...</p>
  }

  function Wrapper(this: Component) {
    context.wrapper = this
    return <First />
  }

  const { serialized } = render(<Wrapper />)

  expect(serialized).toEqual('<body><p id="loading">Loading...</p></body>')

  stage = 1
  context.first.rerender()
  run()

  expect(serializeElement()).toEqual('<body><span id="result">Result</span></body>')

  stage = 2
  context.wrapper.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p id="second">Second</p></body>')
})

test('Children of wrapping fibers are properly reassigned when rerendering (Separate function).', () => {
  const context = {} as { first: Component; wrapper: Component }
  let stage = 0

  function Second() {
    return <p id="second">Second</p>
  }

  function First(this: Component) {
    context.first = this

    if (stage === 1) {
      return <span id="result">Result</span>
    }

    return <p id="loading">Loading...</p>
  }

  function Wrapper(this: Component) {
    context.wrapper = this

    if (stage === 2) {
      return <Second />
    }

    return <First />
  }

  const { serialized } = render(<Wrapper />)

  expect(serialized).toEqual('<body><p id="loading">Loading...</p></body>')

  stage = 1
  context.first.rerender()
  run()

  expect(serializeElement()).toEqual('<body><span id="result">Result</span></body>')

  stage = 2
  context.wrapper.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p id="second">Second</p></body>')
})

test('Existing components are only rerendered when props change.', () => {
  const context = {} as { app: Component; first: Component; second: Component }
  const renderCounts = { app: 0, first: 0, second: 0 }
  let state = 0

  function First(this: Component, { count }: { count: number }) {
    context.first = this
    renderCounts.first += 1
    return <p id="first">First {count}</p>
  }

  function Second(this: Component, { count }: { count: number }) {
    context.second = this
    renderCounts.second += 1
    return <p id="second">Second {count}</p>
  }

  function App(this: Component) {
    context.app = this
    renderCounts.app += 1
    // TODO in an array all elements will be rerendered.
    // TODO test deep props
    return (
      <>
        <First count={state} />
        <Second count={state + 1} />
      </>
    )
  }

  const { serialized } = render(<App />)

  expect(serialized).toEqual('<body><p id="first">First 0</p><p id="second">Second 1</p></body>')
  expect(renderCounts).toEqual({ app: 1, first: 1, second: 1 })

  context.app.rerender()
  run()

  expect(renderCounts).toEqual({ app: 2, first: 1, second: 1 })
  expect(serializeElement()).toEqual('<body><p id="first">First 0</p><p id="second">Second 1</p></body>')

  state = 1
  context.app.rerender()
  run()

  expect(renderCounts).toEqual({ app: 3, first: 2, second: 2 })
  // TODO rendering bug
  expect(serializeElement()).toEqual(
    '<body><p id="first">First 0</p><p id="second">Second 1</p><p id="first">First 1</p><p id="second">Second 2</p></body>',
  )
})

test('Existing components are only rerendered when props change children are still updated.', () => {
  const context = {} as { app: Component; first: Component; second: Component }
  const renderCounts = { app: 0, first: 0, second: 0 }
  let state = 0
  let childrenState = 1

  function First(this: Component, { count, children }: { count: number; children: React.ReactNode }) {
    context.first = this
    renderCounts.first += 1
    return (
      <p id="first">
        First {count} - {children}
      </p>
    )
  }

  function Second(this: Component, { count, children }: { count: number; children: React.ReactNode }) {
    context.second = this
    renderCounts.second += 1
    return (
      <p id="second">
        Second {count} - {children}
      </p>
    )
  }

  function App(this: Component) {
    context.app = this
    renderCounts.app += 1
    return (
      <>
        <First count={state}>
          <p>{childrenState}</p>
        </First>
        <Second count={state + 1}>
          <p>{childrenState + 1}</p>
        </Second>
      </>
    )
  }

  const { serialized } = render(<App />)

  expect(serialized).toEqual('<body><p id="first">First 0 - <p>1</p></p><p id="second">Second 1 - <p>2</p></p></body>')
  expect(renderCounts).toEqual({ app: 1, first: 1, second: 1 })

  childrenState = 2
  context.app.rerender()
  run()

  expect(renderCounts).toEqual({ app: 2, first: 2, second: 2 })
  expect(serializeElement()).toEqual('<body><p id="first">First 0 - <p>2</p></p><p id="second">Second 1 - <p>3</p></p></body>')

  state = 1
  context.app.rerender()
  run()

  expect(renderCounts).toEqual({ app: 3, first: 3, second: 3 })
  expect(serializeElement()).toEqual('<body><p id="first">First 1 - <p>2</p></p><p id="second">Second 2 - <p>3</p></p></body>')
})
