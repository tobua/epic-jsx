/// <reference types="@rsbuild/core/types" />
import { render, useEffect, useRef, useState } from 'react'
import logo from '../logo.svg'
import { Button, Heading, Input, Tabs } from './components'
import { ContactForm } from './contact-form'
import { Loader } from './icons'

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
    <Button ref={buttonRef} onClick={() => setCount(count + 1)}>
      Increment: {count}
    </Button>
  )
}

function Form() {
  const [value, setValue] = useState('World!')
  return (
    <>
      <Input placeholder="Hello?" value={value} onInput={(event) => setValue((event.target as HTMLInputElement).value)} />
      <p>Uppercase Value: {value.toUpperCase()}</p>
    </>
  )
}

function Basic() {
  return (
    <div>
      <Heading Tag="h3">HTML Tags</Heading>
      <div>
        Hello <button>World</button> Links <a href="https://google.com">are</a> showing up! 😊
      </div>
      <Heading Tag="h3">Attributes</Heading>
      <Button tabIndex={-1} aria-label="labelled">
        Can't focus me.
      </Button>
      <Button tabIndex={0}>Focus me instead.</Button>
      <Heading Tag="h3">Event listeners</Heading>
      <Button onClick={() => alert('click')}>Event listeners</Button>
    </div>
  )
}

function State() {
  return (
    <div>
      <Heading Tag="h3">useState (Legacy Hook Support)</Heading>
      <Form />
      <Heading Tag="h3">useState, useRef and useEffect</Heading>
      <Counter />
    </div>
  )
}

function Interactive() {
  return (
    <div>
      <Heading Tag="h3">Events</Heading>
    </div>
  )
}

function SVG() {
  return (
    <div>
      <Loader />
    </div>
  )
}

render(
  <div style={{ fontFamily: 'sans-serif', display: 'flex', gap: '10px', flexDirection: 'column' }}>
    <img src={logo} alt="epic-jsx Logo" style={{ width: '10vw', height: '10vw', alignSelf: 'center' }} />
    <Heading Tag="h1">epic-jsx Demo</Heading>
    <Heading Tag="h2">Features</Heading>
    <Tabs tabs={['Basic', 'Interactive', 'State', 'SVG']}>
      <Basic />
      <Interactive />
      <State />
      <SVG />
    </Tabs>
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
  </div>,
)
