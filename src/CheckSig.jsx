import React, { useState } from 'react'
import { Input } from 'antd'

export default () => {
  const [scripts, setScripts] = useState([])
  const [mvlp, setMailvelope] = useState()

  const onMailvelope = () => {
    if(mvlp === undefined) {
      setMailvelope(window.mailvelope)
    }
  }

  if(window.mailvelope !== undefined) {
    onMailvelope()
  } else {
    window.addEventListener('mailvelope', onMailvelope, false)
  }

  // mvelo.storage = new LocalStorageStub();
  // setWatchList([{
  //   'active': true,
  //   'site': 'Mailvelope Test',
  //   'https_only': false,
  //   'frames': [
  //     {
  //       'scan': true,
  //       'frame': 'localhost',
  //       'api': true
  //     }
  //   ]
  // }]);
  // initController();
  
  // /* global mailvelope */
  // describe('Mailvelope Client API', () => {
  //   beforeEach(async () => {
  //     mvelo.storage = new LocalStorageStub();
  //     initKeyring();
  //   });
  
  //   describe('Handling keyrings', function() {
  //     this.timeout(10000);
  //     it('can create a keyring', () =>
  //       expect(mailvelope.createKeyring('email@test.example')).to.eventually.be.ok);
  
  //     it('rejects getting keyring if there is none', async () =>
  //       expect(mailvelope.getKeyring('email@test.example')).to.be.rejected);
  
  //     it('rejects creating duplicate keyring', async () => {
  //       await mailvelope.createKeyring('existing@test.example');
  //       return expect(mailvelope.createKeyring('existing@test.example')).to.eventually.be.rejected;
  //     });
  
  //     it('can get a keyring', async () => {
  //       const existing_keyring = await mailvelope.createKeyring('existing@test.example');
  //       return expect(mailvelope.getKeyring('existing@test.example')).to.become(existing_keyring);
  //     });
  
  //     it('rejects getting keyring with wrong handle', async () => {
  //       await mailvelope.createKeyring('existing@test.example');
  //       return expect(mailvelope.getKeyring('email@test.example')).to.be.rejected;
  //     });
  //   });
  
  //   describe('Processing autocrypt', () => {
  //     let keyring;
  //     prefs.keyserver = {
  //       autocrypt_lookup: true
  //     };
  
  //     beforeEach(async () => {
  //       keyring = await mailvelope.createKeyring('email@test.example');
  //     });
  
  //     // it('processes Autocrypt header, stores key, and makes it available', async () => {
  //     //   const addr = testAutocryptHeaders.from;
  //     //   await keyring.processAutocryptHeader(testAutocryptHeaders);
  //     //   const result = await keyring.validKeyForAddress([addr]);
  //     //   const {keys: [{source}]} = result[addr];
  //     //   expect(source).to.eql('AC');
  //     // });
  //   });
  // });
  
  return <div>
    { mvlp ? 'OK' : <h1><a href='//mailvelope.com'>Install Mailvelope</a></h1>}
  </div>
}