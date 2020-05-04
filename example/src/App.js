import React, { useState } from 'react';
import { useMediaSet } from 'use-media-set';
import { bool } from 'prop-types';

let renders = 0;

const divStyle = {
  width: '50%',
  margin: '20px',
  padding: '20px',
  border: '2px solid blue',
};

function Header({ isSmall, isMedium, isLarge }) {
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

Header.propTypes = {
  isSmall: bool.isRequired,
  isMedium: bool.isRequired,
  isLarge: bool.isRequired,
};

function App() {
  const [bpoints, setBpoints] = useState(undefined);
  const mediaStates = useMediaSet(bpoints);

  function newBreaks() {
    setBpoints({
      small: { width: '..768' },
      medium: { width: '640..960' },
      large: { width: '800..' },
      bigScreen: [
        { type: 'screen', color: true, deviceWidth: '1920..' },
        { type: 'tv' },
      ],
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

export default App;
