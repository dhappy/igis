import React, { useState, useContext } from 'react'
import { Tabs, Input, Button } from 'antd'
import ReactMarkdown from 'react-markdown'
import IPFSContext from '../IPFSContext'
const { TabPane } = Tabs
const { TextArea } = Input

export default ({ num, text, type, filename }) => {
  const [ipfs] = useContext(IPFSContext)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState()

  const writeComment = async () => {
    //const pr = (await ipfs.dag.get(pr))
    const pr = {}
    const holder = ['comments', type].reduce((obj, step) => (
      obj[step] = obj[step] || {}
    ), pr)
    holder[num] = holder[num] || []
    holder[num].push(comment)
  }

  return <div className={`line ${type}`} key={`${type}-${num || Math.random()}`}>
    <a onClick={text ? () => setShowComment(s => !s) : null} title='💬'>
      <span className='number'>{num}</span>
      <span className='text'>{text}</span>
    </a>
    {showComment && <div className='comment'>
      <Tabs defaultActiveKey="write">
        <TabPane tab="Write" key="write">
          <TextArea
            placeholder="Leave a markdown-formatted comment…"
            value={comment}
            onChange={evt => setComment(evt.target.value)}
            autoSize={{ minRows: 5 }}
          />
        </TabPane>
        <TabPane tab="Preview" key="preview">
          <div className='preview'>
            <ReactMarkdown source={comment}/>
          </div>
        </TabPane>
      </Tabs>
      <Button className='submit' type='primary' onClick={writeComment}>Comment</Button>
      <Button onClick={() => setShowComment(false)}>Cancel</Button>
    </div>}
  </div>
}