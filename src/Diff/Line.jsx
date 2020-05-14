import React from 'react'

export default ({ num, text, type }) => {
  return <a onClick={() => alert('hi')} title='💬'>
    <span className={`${type} number`}>{num}</span>
    <span className={type}>{text}</span>
  </a>
}