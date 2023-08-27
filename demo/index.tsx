import { render } from 'react'

render(
  <>
    <div>
      Hello <button>World</button>
    </div>
    <input placeholder="emtpy" value="enter text" />
    <div aria-label="labelled">
      <button type="button" tabIndex={-1}>
        Attributes
      </button>
    </div>
  </>
)
