import React from 'react'
import { Link } from 'react-router-dom'

export default () => {
  return (
    <ul>
      <li><Link to='ENSReverse'>Configure an <acronym title=''></acronym>ENS reverse address</Link></li>
      <li><Link to='Mailvelope'>Check Mailvelope characteristics</Link></li>
      <li><Link to='SSLHostCheck'>Display SSL characteristics</Link></li>
      <li><Link to='Diff'>View a commentable diff of two trees</Link></li>
      <li><Link to='MAM'>Send a message to an IOTA MAM channel</Link></li>
      <li><Link to='ETHSig'>Create an Ethereum signature</Link></li>
      <li><Link to='Ed25519'>Generate Ed25519 signed <acronym title='Javascript Object Notation Linked Data'>JSON-LD</acronym></Link></li>
      <li><Link to='AvionDB/'>Basic AvionDB functionality</Link></li>
      <li><Link to='r/QmZQRtwXA7qLYgUxF4R2TCAzXNnrpddgHGoTCe2fjxNah2'>Sample repository view</Link></li>
    </ul>
  )
}