import React, { useState } from 'react';
import { useMediaSet } from 'use-media-set';

let renders = 0;

const divStyle = {
  width: '50%',
  margin: '20px',
  padding: '20px',
  border: '2px solid blue'
};

function Header({isSmall, isMedium, isLarge}) {
  renders += 1;
  return (
    <>
      <p>Media states currently matching:</p>
      <ul>
        {isSmall && <li>Small</li>}
        {isMedium && <li>Medium</li>}
        {isLarge && <li>Large</li>}
      </ul>
      <p>Header re-render count: {renders}.</p>
    </>
  );
}

function App() {
  const [ bpoints, setBpoints ] = useState(undefined);
  const mediaStates = useMediaSet(bpoints);

  function newBreaks() {
    setBpoints({
      small: '(max-width: 768px)',
      medium: '(min-width: 640px) and (max-width: 960px)',
      large: '(min-width: 800px)'
    });
  }

  return (
    <div style={divStyle}>
      <Header
        isSmall={mediaStates.has('small')}
        isMedium={mediaStates.has('medium')}
        isLarge={mediaStates.has('large')}
      />
      <button onClick={newBreaks}>Install new breakpoints</button>
    </div>
  );
}

export default App
