import './helper'
import { afterEach, expect, test } from 'bun:test'
import { type Component, unmountAll } from '../index'
import { render, run, serializeElement } from '../test'

afterEach(unmountAll)

test('Fragments are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function Component(this: Component) {
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

  const { serialized } = render(<Component />)

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

  function Component(this: Component) {
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

  const { serialized } = render(<Component />)

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

  function Component(this: Component) {
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

  const { serialized } = render(<Component />)

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

  function Component(this: Component) {
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

  const { serialized } = render(<Component />)

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
        <section id="section"><span>hey</span></section>
      )
    }

    return (
      <section id="section"><p>hey</p></section>
    )
  }

  function AnoterWrapper({ children }) {
    return children
  }

  function Wrapper() {
    context = this

    return <AnoterWrapper><article id="article"><App /></article></AnoterWrapper>
  }

  const { serialized } = render(<Wrapper />)

  expect(serialized).toEqual(
    '<body><article id="article"><section id="section"><p>hey</p></section></article></body>',
  )

  document.getElementById('section').setAttribute('aria-label', 'still-here')
  expect(document.getElementById('section').getAttribute('aria-label')).toEqual('still-here')
  document.getElementById('article').setAttribute('aria-label', 'still-here')
  expect(document.getElementById('article').getAttribute('aria-label')).toEqual('still-here')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><article id="article" aria-label=\"still-here\"><section id="section" aria-label=\"still-here\"><span>hey</span></section></article></body>',
  )
})

test('Lifecycle methods are called at the appropriate time.', () => {
  let context: Component
  let events = []

  function App(this: Component) {
    events.push('start')
    context = this
    this.once(() => events.push('once'))
    this.after(() => events.push('after'))
    this.each(() => events.push('each'))
    
    const markup = <div>Lifecycle</div>
    events.push('end')
    return markup
  }

  const { serialized } = render(<App />)

  expect(serialized).toEqual(
    '<body><div>Lifecycle</div></body>',
  )

  expect(events).toEqual(['start', 'end', 'once', 'after', 'each'])

  context.rerender()
  run()

  expect(events).toEqual(['start', 'end', 'once', 'after', 'each', 'start', 'end', 'each'])
})