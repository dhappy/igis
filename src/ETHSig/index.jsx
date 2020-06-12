import React, { useState, useEffect } from 'react'
import * as sigUtil from 'eth-sig-util'
import Web3 from 'web3'
const { ethereum } = window
const web3 = new Web3(ethereum)

export default () => {
  const [msg, setMsg] = useState('Awaiting Signature…')
  const msgParams = [
    {
      type: 'string',      // Any valid solidity type
      name: 'Message',     // Any string label you want
      value: 'Hi, Alice!'  // The value to sign
    },
    {   
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  const signMsg = async (msgParams, from) => {
    const msg = web3.utils.utf8ToHex('This is a test…')
    const sig = await web3.eth.personal.sign(msg, from)
    const signer = await web3.eth.personal.ecRecover(msg, sig)
    setMsg(`Signer: ${signer}`)
  }

  useEffect(() => {
    ethereum.enable()
    web3.eth.getAccounts(function (err, accounts) {
      if (!accounts) return
      signMsg(msgParams, accounts[0])
    })
  }, [])

  return <p>{msg}</p>
}