import type React from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { Button, Input } from './components'
import { Globe } from './globe'

function TextArea(props: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      style={{
        background: 'lightgray',
        border: 'none',
        outline: 'none',
        padding: 10,
        borderRadius: 10,
        resize: 'none',
        alignSelf: 'normal', // Stretch
        fontFamily: 'sans-serif',
      }}
      {...props}
    />
  )
}

export function ContactForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timer, setTimer] = useState(10)

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    function handleClick(event) {
      event.preventDefault()
      if (confirming) {
        setSubmitted(true)
        setTimer(10)
        setConfirming(false)
        setName('')
        setMessage('')
        return
      }
      setSubmitted(false)
      setVerifying(true)
      setTimer(timer - 1)

      let current = timer - 1

      const intervalId = setInterval(() => {
        setTimer(--current)

        if (current === 0) {
          clearInterval(intervalId)
          setVerifying(false)
          setConfirming(true)
        }
      }, 1000)
    },
    [timer, confirming],
  )

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'normal',
        boxShadow: '2px 2px 5px 1px lightgray',
        padding: 20,
        gap: 20,
        width: 300,
      }}
    >
      <style>{`@keyframes pulsate {
    0% { 
        opacity: 0.5;
    }
    50% { 
        opacity: 1.0;
    }
    100% { 
        opacity: 0.5;
    }
}`}</style>
      <h2 style={{ margin: 0 }}>Contact Us</h2>
      <Input placeholder="Your name" value={name} onInput={(event) => setName((event.target as HTMLInputElement).value)} />
      <TextArea
        placeholder="Please enter your message"
        rows={4}
        value={message}
        onInput={(event) => setMessage((event.target as HTMLTextAreaElement).value)}
      />
      <Button type="submit" onClick={handleSubmit} inactive={verifying}>
        {verifying ? 'Please wait...' : confirming ? 'Confirm' : 'Submit'}
      </Button>
      {verifying && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <p
            style={{
              animation: 'pulsate 3s ease-out',
              animationIterationCount: 'infinite',
              opacity: 0.5,
              margin: 0,
            }}
          >
            Checking connection: <span style={{ fontWeight: 'bold', background: 'gray', padding: 10, borderRadius: 10 }}>{timer}</span>
          </p>
          <Globe />
        </div>
      )}
      {submitted && <p style={{ margin: 0 }}>Message submitted!</p>}
    </form>
  )
}
