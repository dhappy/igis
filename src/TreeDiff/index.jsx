import React, { useContext, useState, useEffect } from 'react'
import all from 'it-all'
import Diff from '../Diff'
import IPFSContext from '../IPFSContext'

export default () => {
  const [ipfs] = useContext(IPFSContext)
  const [commit, setCommit] = useState()
  const [parent, setParent] = useState()
  const [files, setFiles] = useState()
  const ref = 'QmddX9QvKJz2YGrQrk4P5ykAZvSUc3jaSjZEDFAfwSqcoF/.git/refs/heads/master'

  useEffect(() => {(async () => {
    if(ipfs) {
      setCommit((await ipfs.dag.get(ref)).value)
      setParent((await ipfs.dag.get(commit.parents[0])).value)
    }
  })()}, [ipfs])
  
  useEffect(() => {(async () => {
    if(commit && parent) {
      const [pTree, cTree] = await Promise.all([
        all(ipfs.ls(parent.tree)), all(ipfs.ls(commit.tree))
      ])
      const diffs = []
      for(let { type, name, cid } of cTree) {
        const pEntry = pTree.find(e => e.name === name)
        if(!pEntry) { // added
          diffs.push(<Diff filename={name} to={cid}/>)
        } else if(type !== 'dir' && pEntry.cid.toString() !== cid.toString()) { // changed
          diffs.push(<Diff filename={name} from={pEntry.cid} to={cid}/>)
        }
      }
      setFiles(diffs)
    }
  })()}, [commit, parent])

  return (
    files
    ? files
    : <p>Loading…</p>
  )
}