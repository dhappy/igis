import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import all from 'it-all'
import toBuffer from 'it-to-buffer'
import { Table } from 'antd'
import { FileTwoTone, FolderTwoTone } from '@ant-design/icons'
import Markdown from 'react-markdown'
import IPFSContext from '../IPFSContext'
import './index.scss'

const logger = (css) => ((...args) => {
  args[0] = `%c ${args[0]} `
  args.splice(1, 0, css)
  console.log.apply(this, args)
})

export default () => {
  const [ipfs] = useContext(IPFSContext)
  const [cid, setCID] = useState(useParams()[0])
  const [list, setList] = useState([])
  const [readme, setReadMe] = useState()

  const updateList = async (newList) => {
    setList(newList)
    const readme = newList.find(file => {
      console.log(file.name, /readme(\..+)?/i.test(file.name))
      return /readme(\..+)?/i.test(file.name)
    })
    const chunks = []
    for await (const chunk of ipfs.cat(readme.cid)) {
      chunks.push(Buffer.from(chunk))
    }
    setReadMe(Buffer.concat(chunks).toString())
  }

  useEffect(() => {
    if (ipfs) {
      all(ipfs.ls(cid)).then(updateList)
    }
  }, [ipfs, cid])

  console.log(list)

  const columns = [
    { title: '', dataIndex: 'icon', key: 'name', width: 50 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
  ]
  const data = list.map((file) => ({
    name: file.name,
    icon: file.type === 'file' ? <FileTwoTone key={Math.random()}/> : <FolderTwoTone key={Math.random()}/>,
  }))

  return (
    <div id='repo'>
      {cid ? <h1>{cid}</h1> : ''}
      <Table size='large' dataSource={data} columns={columns}
        showHeader={false} pagination={false} onRow={(record, rowIndex) => {
          return {
            onClick: evt => logger('color: black')(record.name),
            onDoubleClick: evt => { window.location = `/r/`},
            onContextMenu: event => { }, // right button click row
            onMouseEnter: evt => logger('color: green')('event', evt),
            onMouseLeave: event => { }, // mouse leave row
          }
        }}
      />
      <div id='readme'>
        <Markdown source={readme} />
      </div>
    </div>
  )
}