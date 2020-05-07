import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import all from 'it-all'
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
  const cid = useParams()[0]
  const [list, setList] = useState([])

  useEffect(() => {
    console.log('Called', ipfs, cid)
    if(ipfs) {
      all(ipfs.ls(cid)).then(setList)
    }
  }, [ipfs, cid])

  console.log(list)

  const columns = [
    {
      title: '', dataIndex: 'icon', key: 'name', width: 50,
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
  ]
  const data = list.map((file) => ({
    name: file.name,
    icon: file.type === 'file' ? <FileTwoTone/> : <FolderTwoTone/>,
  }))

  return (
    <div id='repo'>
      <Table size='large' dataSource={data} columns={columns}
        showHeader={false} pagination={false} onRow={(record, rowIndex) => {
          return {
          onClick: event => logger('color: black'), // click row
          onDoubleClick: event => {}, // double click row
          onContextMenu: event => {}, // right button click row
          onMouseEnter: event => {}, // mouse enter row
          onMouseLeave: event => {}, // mouse leave row
        };
      }}/>
      <div id='readme'>
        <Markdown source='This is a test…'/>
      </div>
    </div>
  )
}