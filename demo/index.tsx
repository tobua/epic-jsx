import { render, useState, useRef, useEffect } from 'react'
import logo from './logo.svg'
import { ContactForm } from './ContactForm'

const randomHexValue = () =>
  Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, '0')

function Counter() {
  const [count, setCount] = useState(1)
  const buttonRef = useRef<HTMLButtonElement>()
  useEffect(() => {
    buttonRef.current.style.backgroundColor = `#${randomHexValue()}${randomHexValue()}${randomHexValue()}`
    buttonRef.current.style.color = 'white'
  })
  return (
    <button ref={buttonRef} type="button" onClick={() => setCount(count + 1)}>
      Increment: {count}
    </button>
  )
}

function Form() {
  const [value, setValue] = useState('World!')
  return (
    <>
      {/* @ts-ignore */}
      <input placeholder="Hello?" value={value} onInput={(event) => setValue(event.target.value)} />
      <p>Uppercase Value: {value.toUpperCase()}</p>
    </>
  )
}

render(
  <div style={{ fontFamily: 'sans-serif', display: 'flex', gap: '10px', flexDirection: 'column' }}>
    <img
      src={logo}
      alt="epic-jsx Logo"
      style={{ width: '10vw', height: '10vw', alignSelf: 'center' }}
    />
    <h1>epic-jsx Demo</h1>
    <div>
      Hello <button>World</button>
    </div>
    <Form />
    <div aria-label="labelled">
      <button type="button" tabIndex={-1}>
        Attributes
      </button>
      <button type="button" onClick={() => alert('click')}>
        Event listeners
      </button>
      <Counter />
    </div>
    <section style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
      <ContactForm />
    </section>
    <aside
      style={{
        position: 'absolute',
        bottom: 20,
        right: 30,
        left: 40,
        display: 'flex',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>A better React.</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <span style={{ color: 'gray' }}>npmjs.com/</span>
          <span style={{ color: 'black' }}>epic-jsx</span>
        </div>
        <img src={logo} alt="epic-jsx Logo" style={{ width: 50, height: 50 }} />
      </div>
    </aside>
  </div>
)
