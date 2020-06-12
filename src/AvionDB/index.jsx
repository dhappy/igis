import React, { useEffect, useContext, useState } from 'react'
import AvionDB from 'aviondb'
import IPFSContext from '../IPFSContext'
import { useParams } from 'react-router-dom'
import { composeAPI } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'

export default () => {
  const [ipfs] = useContext(IPFSContext)
  const [iota] = useState(composeAPI({ provider: 'https://nodes.thetangle.org:443' }))
  const repoAnnounceAddr = useParams()[0]
  const [repos, setRepos] = useState([])

  useEffect(() => {(async () => {
    if(ipfs) {
      const aviondb = await AvionDB.init('igis', ipfs)

      console.info(await AvionDB.listDatabases())

      const collection = await aviondb.initCollection('repos')

      for(let transaction of await iota.findTransactionObjects({ addresses: [repoAnnounceAddr] })) {
        const message = transaction.signatureMessageFragment.replace(/9*$/, '') // how do I know it won't end in 9?
        const cid = trytesToAscii(message)
        let name = <em>Untitled</em>
        try {
          name = (await ipfs.dag.get(`${cid}/.git/name`)).value
        } catch(err) { /* DNE */ }
        await collection.insertOne({
          _id: cid, cid: cid, name: name
        })
      }

      // We also support multi-insert using collection.insert()
      // See https://github.com/dappkit/aviondb/blob/master/API.md

      // const employee = await collection.find({
      //   ssn: "562-48-5384",
      // });

      // We also support find(), findById()
      // See https://github.com/dappkit/aviondb/blob/master/API.md
      console.info(await collection.find())

      setRepos(await collection.find())

      // Returns the matching document
      // console.log(employee);
      // Prints the above added JSON document

      // Update a document
      // const updatedEmployee = await collection.update(
      //   { ssn: "562-48-5384" },
      //   { $set: { hourly_pay: "$100" } }
      // )

      // We also support updateMany(), findOneAndUpdate()
      // See https://github.com/dappkit/aviondb/blob/master/API.md

      // Returns the updated document
      // console.log(updatedEmployee);
      // Prints the updated JSON document
    }
  })()}, [ipfs, iota])
    // await collection.close(); // Collection will be closed.
    // await aviondb.drop(); // Drops the database
    // await aviondb.close(); // Closes all collections and binding database.
    // await ipfs.stop();
  return <ol>
    {repos.map((r, i) => <li key={i}>{r.name}</li>)}
  </ol>
}