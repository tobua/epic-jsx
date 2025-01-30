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

export function Button({ inactive = false, ...props }: { inactive?: boolean } & React.ComponentProps<'button'>) {
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
      }}
      {...props}
    />
  )
}
