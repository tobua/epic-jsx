import { render } from 'react'
import logo from './logo.svg'

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
    <input placeholder="emtpy" value="enter text" />
    <div aria-label="labelled">
      <button type="button" tabIndex={-1}>
        Attributes
      </button>
      <button type="button" onClick={() => alert('click')}>
        Event listeners
      </button>
    </div>
  </div>
)
