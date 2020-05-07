import React, { useState, useEffect } from 'react'
import pgp from 'openpgp'
import { Input } from 'antd'

export default () => {
  useEffect(() => {(async () => {
    console.log(pgp)

    const key = await pgp.generateKey({
      curve: 'curve25519',  userIds: [{ name: 'Test', email: 'test@test.com' }]
    })

    console.log(key)
  })()}, [])
  return <div>
    <Input />
  </div>
}