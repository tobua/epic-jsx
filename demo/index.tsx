import { render, useState, useRef, useEffect } from 'react'
import logo from './logo.svg'

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
      <input
        placeholder="Hello?"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <p>Uppercase Value: {value.toUpperCase()} (currently only updates on blur...)</p>
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
  </div>
)
