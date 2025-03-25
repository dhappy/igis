import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Input, InputLabel, FormControl, Select, MenuItem } from '@material-ui/core'
import IPFSContext from '../IPFSContext'
import './index.scss'

export default () => {
  const [ipfs] = useContext(IPFSContext)
  const [cid, setCID] = useState(useParams()[0])
  const [refs, setRefs] = useState({})
  const [from, setFrom] = useState()
  const [to, setTo] = useState()

  useEffect(() => {
    if(ipfs && cid && cid !== '') {
      ipfs.dag.get(`${cid}/.git`)
      .then(res => res.value)
      .then(git => {
        const refs = {}
        const serialize = (obj, path) => {
          if(obj.codec === 'dag-cbor') {
            refs[path] = obj
          } else {
            for(const name of Object.keys(obj)) {
              serialize(obj[name], `${path}/${name}`)
            }
          }
        }
        serialize(git.refs, 'refs')
        console.debug(refs)
        setRefs(refs)
      })
      .catch(console.error)
    }
  }, [ipfs, cid])

  // const menu = (
  //   <Menu>
  //     {Object.keys(refs).map((r, i) => (
  //       <Menu.Item key={i}>{r}</Menu.Item>
  //     ))}
  //   </Menu>
  // )

  return (
    <div id='commits'>
      <Input className='cid' onChange={(evt) => setCID(evt.target.value)} />
      <FormControl className='branch'>
        <InputLabel>To Branch</InputLabel>
        <Select value={to} onChange={evt => setTo(evt.target.value)}>
          {Object.keys(refs).map((r, i) => (
            <MenuItem key={i} value={r}>{r}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Input className='cid' onChange={(evt) => setCID(evt.target.value)} />
      <FormControl className='branch'>
        <InputLabel>From Branch</InputLabel>
        <Select value={from} onChange={evt => setFrom(evt.target.value)}>
          {Object.keys(refs).map((r, i) => (
            <MenuItem key={i} value={r}>{r}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}