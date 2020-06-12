import React, { useState, useEffect } from 'react'
import { Input } from 'antd'
import './index.scss'

export default () => {
  const [mailvelope, setMailvelope] = useState()
  const [keyring, setKeyring] = useState()

  useEffect(() => {
    if(window.mailvelope !== undefined) {
      setMailvelope(window.mailvelope)
    } else {
      window.addEventListener('mailvelope', () => { console.log('HK'); setMailvelope(window.mailvelope) }, false)
    }
  }, [])

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
      mailvelope.getKeyring('IGiS')
      .then(setKeyring)
      .catch(async (err) => { // Doesn't exist. Create.
        try {
          const keyring = await mailvelope.createKeyring('IGiS')
          keyring.setLogo(await toDataURL('logo.png'), 1)
          setKeyring(keyring)
        } catch(err) {
          console.error(err)// KEYRING_ALREADY_EXISTS
        }
      })
    }
  }, [mailvelope])

  useEffect(() => {
    if(mailvelope && keyring) {
      // mailvelope.createSettingsContainer('#settings', keyring, {email: 'dys@dhappy.org', fullName: 'John Smith'})
      // .then(function(result) {
      //   console.log('mailvelope.createSettingsContainer() success', result);
      // })
      // .catch(function(error) {
      //   console.log('mailvelope.createSettingsContainer() error', error);
      // })
      keyring.createKeyGenContainer('#keygen', {})
      .then(console.log)

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
    { mailvelope ? 'OK' : <h1><a href='//mailvelope.com'>Install Mailvelope</a> or add this site to trusted hosts</h1>}
    <div id='settings'></div>
    <div id='keygen'></div>
    <div id='editor'></div>
    <div id='form'></div>
  </div>
}