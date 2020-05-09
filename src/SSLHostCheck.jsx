import React from 'react'

export default () => (
  <ul>
    <li>protocol:{document.location.protocol}</li>
    <li>location:{document.location.href}</li>
    <li>hostname:{document.location.hostname}</li>
  </ul>
)