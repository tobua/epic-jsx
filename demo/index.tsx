/// <reference types="@rsbuild/core/types" />
import { render } from 'react'
import logo from '../logo.svg'
import { Basic, Heading, Interactive, State, SVG, Tabs } from './components'
import { ContactForm } from './contact-form'

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
