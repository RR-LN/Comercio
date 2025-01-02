import * as Sentry from '@sentry/nextjs'
import { useState } from 'react'

export default function SentryTest() {
  const [message, setMessage] = useState('')

  const testErrors = {
    unhandledError: () => {
      throw new Error('Unhandled Error Test')
    },
    
    handledError: () => {
      try {
        throw new Error('Handled Error Test')
      } catch (error) {
        Sentry.captureException(error)
        setMessage('Handled error sent to Sentry')
      }
    },

    promiseRejection: async () => {
      try {
        await Promise.reject(new Error('Promise Rejection Test'))
      } catch (error) {
        Sentry.captureException(error)
        setMessage('Promise rejection sent to Sentry')
      }
    },

    customMessage: () => {
      Sentry.captureMessage('Custom Message Test')
      setMessage('Custom message sent to Sentry')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Sentry Test Page</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => testErrors.handledError()}
          style={{
            padding: '10px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Handled Error
        </button>
        
        <button
          onClick={() => testErrors.promiseRejection()}
          style={{
            padding: '10px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Promise Rejection
        </button>
        
        <button
          onClick={() => testErrors.customMessage()}
          style={{
            padding: '10px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send Custom Message
        </button>
        
        <button
          onClick={() => testErrors.unhandledError()}
          style={{
            padding: '10px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Unhandled Error
        </button>
      </div>
      
      {message && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  )
}
