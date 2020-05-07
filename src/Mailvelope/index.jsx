import React, { useState, useEffect } from 'react'
import { Input } from 'antd'
import './index.scss'

export default () => {
  const [mailvelope, setMailvelope] = useState()
  const [keyring, setKeyring] = useState()

  const onMailvelope = () => {
    if(mailvelope === undefined) {
      setMailvelope(window.mailvelope)
    }
  }

  if(window.mailvelope !== undefined) {
    onMailvelope()
  } else {
    window.addEventListener('mailvelope', onMailvelope, false)
  }

  //https://stackoverflow.com/a/20285053/264008
  const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    return reader.readAsDataURL(blob)
  }))

  useEffect(() => {
    if(mailvelope) {
      (async () => {
        try {
          mailvelope.getKeyring('IGiS').then(setKeyring)
        } catch(err) { // Doesn't exist. Create.
          try {
            const keyring = await mailvelope.createKeyring('IGiS')
            keyring.setLogo(await toDataURL('logo.png'), 1)
            setKeyring(keyring)
          } catch(err) {
            console.error(err)// KEYRING_ALREADY_EXISTS
          }
        }
      })()
    }
  }, [mailvelope])

  //keyring.hasPrivateKey(fingerprint)
  const callbacks = {}

  const randHash = () => {
    let result = ''
    const buf = new Uint16Array(6)
    window.crypto.getRandomValues(buf)
    for(let i = 0; i < buf.length; i++) {
      result += buf[i].toString(16)
    }
    return result
  }

  const send = (event, data) => {
    return new Promise((resolve, reject) => {
      const message = {...data, event, mvelo_client: true, _reply: randHash()}
      callbacks[message._reply] = (err, data) => err ? reject(err) : resolve(data)
      console.log(callbacks)
      window.postMessage(message, window.location.origin)
    })
  }

  const receive = (msg) => {
    if (msg.origin !== window.location.origin || msg.data.mvelo_client || !msg.data.mvelo_extension) {
      return;
    }
    switch (msg.data.event) {
      case 'sync-event':
        //handleSyncEvent(msg.data);
        break;
      case '_reply': {
        let error;
        if(msg.data.error) {
          //error = mapError(msg.data.error)
          if(!callbacks[msg.data._reply]) {
            throw error;
          }
        }
        console.log(callbacks)
        if(callbacks[msg.data._reply]) callbacks[msg.data._reply](error, msg.data.result)
        delete callbacks[msg.data._reply]
        break
      }
      default:
        console.warn('mailvelope-client-api unknown event', msg.data.event)
    }
  }


  useEffect(() => {
    //window.addEventListener('message', receive)
  }, [])

  useEffect(() => {
    if(mailvelope && keyring) {
      // mailvelope.createSettingsContainer('#settings', keyring, {email: 'dys@dhappy.org', fullName: 'John Smith'})
      // .then(function(result) {
      //   console.log('mailvelope.createSettingsContainer() success', result);
      // })
      // .catch(function(error) {
      //   console.log('mailvelope.createSettingsContainer() error', error);
      // })

      mailvelope.createEditorContainer('#editor', keyring, {predefinedText: 'Testing'})
      .then((editor) => {
        console.log('mailvelope.createEditorContainer() success', editor)
        editor.encrypt(['dys@dhappy.org']).then(console.log)
      })
      .catch(function(error) {
        console.log('mailvelope.createEditorContainer() error', error);
      })

      // mailvelope.createEncryptedFormContainer('#form', '<h1>Test</h1')
      // .then(function(result) {
      //   console.log('mailvelope.createEncryptedFormContainer() success', result);
      // })
      // .catch(function(error) {
      //   console.log('mailvelope.createEncryptedFormContainer() error', error);
      // })
    }
  }, [mailvelope, keyring])

  return <div>
    { mailvelope ? 'OK' : <h1><a href='//mailvelope.com'>Install Mailvelope</a></h1>}
    <div id='settings'></div>
    <div id='editor'></div>
    <div id='form'></div>
  </div>
}