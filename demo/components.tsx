import { useState } from 'react'

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

export function Button({ inactive = false, style, ...props }: { inactive?: boolean } & React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      style={{
        outline: 'none',
        background: inactive ? 'gray' : 'black',
        border: 'none',
        color: 'white',
        borderRadius: 10,
        display: 'flex',
        flex: 1,
        padding: '10px 20px',
        cursor: inactive ? 'auto' : 'pointer',
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

export function Tabs({ tabs, children }: { tabs: string[]; children: React.ReactNode }) {
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
