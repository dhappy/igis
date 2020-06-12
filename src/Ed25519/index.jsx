/* global BigInt */

import React, { useEffect, useState }from 'react'
import { genSeed } from '../util'

export default () => {
  const [log, setLog] = useState([])

  const logger = (msg) => {
    if(typeof msg === 'object') {
      msg = JSON.stringify(msg, null, 2)
    }
    setLog(l => [...l, msg])
  }

  useEffect(() => {(async () => {
    const jsigs = require('jsonld-signatures')
    const {Ed25519KeyPair} = require('crypto-ld')

    const keyPair = await Ed25519KeyPair.generate()
    logger(keyPair)

    const bs58 = require('bs58')

    const pubKey = bs58.decode(keyPair.publicKey)
    const varIntED = [0xED, 0x01]
    const multicodec = bs58.encode(Buffer.from([...varIntED, ...pubKey]))
    const multiformat = 'z' + multicodec

    keyPair.id = `did:key:${multiformat}`
    const keyExport = await keyPair.export()
    logger(keyExport)

    const TRYTE_ALPHABET = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const bytes = bs58.decode(multicodec)
    let hex = []
    bytes.forEach((byte) => {
      var h = byte.toString(16);
      if(h.length % 2) { h = '0' + h }
      hex.push(h)
    })
    hex = hex.join('')
    logger(hex)
    logger(`hex.length: ${hex.length}`)
    
    const key = BigInt('0x' + hex)
    logger(key.toString())
    logger(`binary.length: ${key.toString(2).length}`)
    let address = key.toString(27).split('').map(d => TRYTE_ALPHABET[parseInt(d, 27)]).join('')
    logger(address)
    logger(`tryte.length: ${address.length}`) // 58

    address = `IPFS9MAM9CHANNEL9VA99${address}`
    address = `${'9'.repeat(81 - address.length)}${address}`
    logger(address)

    // specify the public key object
    const publicKey = {
      '@context': jsigs.SECURITY_CONTEXT_URL,
      type: 'Ed25519VerificationKey2018',
      id: `${keyExport.id}`, //adding a # to the key id causes a signature verification error
      controller: `${keyExport.id}#controller`,
      publicKeyBase58: keyExport.publicKeyBase58,
    }

    // specify the public key controller object
    const controller = {
      '@context': jsigs.SECURITY_CONTEXT_URL,
      id: publicKey.controller,
      publicKey: [publicKey],
      authentication: [publicKey.id],
    }

    logger(controller)

    // create the JSON-LD document that should be signed
    const doc = {
      '@context': {
        schema: 'http://schema.org/',
        action: 'schema:action',
        agent: 'schema:name',
        publisher: 'schema:url',
        channel: 'schema:url',
        published_at: 'schema:datetime',
      },
      action: 'RepositoryUpdate',
      publisher: publicKey.controller,
      channel: `git:ipfs+mam://${genSeed()}`,
      agent: 'git-remote-ipfs+mam',
      published_at: new Date(),
    }

    logger(doc)

    // sign the document for the purpose of authentication
    const {Ed25519Signature2018} = jsigs.suites
    const {AuthenticationProofPurpose} = jsigs.purposes
    const {documentLoaders} = require('jsonld')
    // we will need the documentLoader to verify the controller
    const {node: documentLoader} = documentLoaders

    try {
      const signed = await jsigs.sign(doc, {
        suite: new Ed25519Signature2018({
          verificationMethod: publicKey.id,
          key: keyPair,
        }),
        purpose: new AuthenticationProofPurpose({
          challenge: '',
          domain: 'git-remote-ipfs+mam'
        })
      })

      logger(signed)

      // verify the signed document
      const result = await jsigs.verify(signed, {
        documentLoader,
        suite: new Ed25519Signature2018({
          key: keyPair,
        }),
        purpose: new AuthenticationProofPurpose({
          controller,
          challenge: signed['https://w3id.org/security#proof']['@graph']['https://w3id.org/security#challenge'],
          domain: signed['https://w3id.org/security#proof']['@graph']['https://w3id.org/security#domain'],
        })
      });
      if(result.verified) {
        logger('Signature verified.');
      } else {
        logger(`Signature verification error: ${result.error}`);
      }
    } catch(err) {
      logger(`Error: ${err.message}`)
    }
  })()}, [])

  return (
    <div>
      <h1>Signing Test</h1>
      <ol>
        {log.map((l, i) => <li key={i} style={{whiteSpace: 'pre'}}>{l}</li>)}
      </ol>
    </div>
  )
}