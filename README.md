# @cvkline/use-media-set

> Custom hook to make components responsive to media query changes

[![NPM](https://img.shields.io/npm/v/@cvkline/use-media-set.svg)](https://www.npmjs.com/package/@cvkline/use-media-set) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @cvkline/use-media-set
```

## Usage

```jsx
import React, { Component } from 'react'

import { useMyHook } from '@cvkline/use-media-set'

const Example = () => {
  const example = useMyHook()
  return (
    <div>{example}</div>
  )
}
```

## License

MIT © [cvkline](https://github.com/cvkline)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
