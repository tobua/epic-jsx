# epic-jsx

<img align="right" src="https://github.com/tobua/epic-jsx/raw/main/logo.svg" width="30%" alt="JSX Logo" />

React-compatible React rearchitecture based on [Didact](https://github.com/pomber/didact) by Rodrigo Pombo.

- ⚙️ Extensible components
- 🔄 Lifecycle access
- 🌳 Navigatable tree
- 💯 Optimizable Virtual DOM
- 🏙️ ES Modules
- 🎓 TypeScript source and built-in types
- 🧪 Built-in testing framework

# Usage

```jsx
import { render, useState } from 'epic-jsx'

function App() {
  const [count, setCount] = useState(1)
  return <button onClick={() => setCount(count + 1)}>Increment</button>
}

render(<App />)
```
