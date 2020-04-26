import React from 'react'
import { useMyHook } from '@cvkline/use-media-set'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App