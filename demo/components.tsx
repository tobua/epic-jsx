import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Branch, Loader } from './icons'

export const Heading = ({ Tag = 'h1', children }: { Tag: 'h1' | 'h2' | 'h3'; children: string }) => (
  <Tag style={{ margin: 0 }}>{children}</Tag>
)

export function Input(props: React.ComponentProps<'input'>) {
  return (
    <input
      style={{
        background: 'lightgray',
        border: 'none',
        outline: 'none',
        padding: 10,
        borderRadius: 10,
        resize: 'none',
        alignSelf: 'normal', // Stretch
      }}
      {...props}
    />
  )
}

export function Button({ inactive = false, style, onFocus, onBlur, ...props }: { inactive?: boolean } & React.ComponentProps<'button'>) {
  const [focused, setFocused] = useState(false)

  return (
    <button
      type="button"
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={{
        outline: 'none',
        background: 'black',
        border: 'none',
        color: 'white',
        borderRadius: 10,
        display: 'flex',
        flex: 1,
        padding: '10px 20px',
        cursor: inactive ? 'auto' : 'pointer',
        ...(focused && { background: 'gray', color: 'black' }),
        ...(inactive && { background: 'gray' }),
        ...style,
      }}
      {...props}
    />
  )
}

const tabStyles: React.CSSProperties = {
  display: 'flex',
  gap: 5,
}

const tabButtonStyles: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  padding: 10,
  borderBottom: '2px solid black',
  background: 'none',
}

const tabButtonActiveStyles: React.CSSProperties = {
  background: '#EFEFEF',
}

const contentStyles: React.CSSProperties = {
  paddingTop: 20,
}

export function Tabs({ tabs, children }: { tabs: string[]; children: React.ReactNode[] }) {
  const [tabIndex, setTabIndex] = useState(0)
  return (
    <div>
      <header style={tabStyles}>
        {tabs.map((tab, index) => (
          <button
            type="button"
            onClick={() => setTabIndex(index)}
            style={{ ...tabButtonStyles, ...(index === tabIndex && tabButtonActiveStyles) }}
          >
            {tab}
          </button>
        ))}
      </header>
      <main style={contentStyles}>{children[tabIndex]}</main>
    </div>
  )
}

const HexRadix = 16
const ByteValueCount = 256
const HexDigitLength = 2

const randomHexValue = () =>
  Math.floor(Math.random() * ByteValueCount)
    .toString(HexRadix)
    .padStart(HexDigitLength, '0')

export function Counter() {
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

export function Form() {
  const [value, setValue] = useState('World!')
  return (
    <>
      <Input placeholder="Hello?" value={value} onInput={(event) => setValue((event.target as HTMLInputElement).value)} />
      <p>Uppercase Value: {value.toUpperCase()}</p>
    </>
  )
}

export function Basic() {
  return (
    <div>
      <Heading Tag="h3">HTML Tags</Heading>
      <div>
        Hello <button type="button">World</button> Links <a href="https://google.com">are</a> showing up! 😊
      </div>
      <Heading Tag="h3">Attributes</Heading>
      <Button tabIndex={-1} aria-label="labelled">
        Can't focus me.
      </Button>
      <Button tabIndex={0}>Focus me instead.</Button>
    </div>
  )
}

export function State() {
  return (
    <div>
      <Heading Tag="h3">useState (Legacy Hook Support)</Heading>
      <Form />
      <Heading Tag="h3">useState, useRef and useEffect</Heading>
      <Counter />
    </div>
  )
}

export function Interactive() {
  const [hovered, setHovered] = useState(false)
  return (
    <div>
      <Heading Tag="h3">Events</Heading>
      {/** biome-ignore lint/suspicious/noAlert: Demo application. */}
      <Button onClick={() => alert('click')}>Click me</Button>
      <Button
        style={hovered ? { background: 'blue' } : { background: 'green' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Hover me
      </Button>
    </div>
  )
}

export function SVG() {
  return (
    <div>
      <Loader />
      <Branch size={40} />
    </div>
  )
}
