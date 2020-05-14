import React, { useState, useEffect, useContext } from 'react'
import * as Diff from 'diff'
import toBuffer from 'it-to-buffer'
import IPFSContext from '../IPFSContext'
import Line from './Line'
import './index.scss'

export default () => {
  const [ipfs] = useContext(IPFSContext)
  const [lines, setLines] = useState([])
  const [name, setName] = useState()

  useEffect(() => {
    (async () => {
      if(ipfs) {
        const files = await Promise.all(
          [
            'QmcqGWdBJTHknDYHX7gsxk3rUsGsmFc5YCBg351pqvF2Pw',
            'QmZjJe338X4LqXKRrhTQTQhWUXQ8NZnNHRHn26XQmsLTXs',
          ]
          .map(async cid => {
            //console.log(await ipfs.cat)
            const chunks = []
            for await (const chunk of ipfs.cat(cid)) {
              chunks.push(Buffer.from(chunk))
            }
            return Buffer.concat(chunks).toString()
          })
        )
        const patch = Diff.createPatch('testing', files[0], files[1]).split("\n")

        let line
        do {
          line = patch.shift()
          console.info(line)
        }while(!/^={5,}$/.test(line))

        const lines = []
        let lCnt, rCnt, lName, rName, lQue = [], rQue = []
        patch.forEach(line => {
          if(line.startsWith('---')) {
            setName(line.substring(4))
          } else if(line.startsWith('+++')) {
            lName = line.substring(4)
          } else if(line.startsWith('@@')) {
            let match
            if(match = line.match(/@@ -(?<lno>\d+),(?<lct>\d+)\s+\+(?<rno>\d+),(?<rct>\d+) @@/)) {
              lCnt = match.groups.lno
              rCnt = match.groups.rno
              lines.push({ start: line })
            } else {
              console.error(`Unrecognized: ${line}`)
            }
          } else if(line.startsWith('+')) {
            rQue.push(line.substring(1))
          } else if(line.startsWith('-')) {
            lQue.push(line.substring(1))
          } else {
            while(lQue.length > 0 && rQue.length > 0) {
              let left = lQue.shift(), right = rQue.shift()
              const changes = Diff.diffWordsWithSpace(left, right)
              left = []
              right = []
              for(let part of changes) {
                if(part.added) {
                  right.push(<span className='added'>{part.value}</span>)
                } else if(part.removed) {
                  left.push(<span className='removed'>{part.value}</span>)
                } else {
                  const val = <span>{part.value}</span>
                  right.push(val)
                  left.push(val)
                }
              }
              lines.push({ type: 'replacement', left: left, right: right, lNum: lCnt++, rNum: rCnt++ })
            }
            while(lQue.length) {
              lines.push({ type: 'left', left: lQue.shift(), lNum: lCnt++ })
            }
            while(rQue.length > 0) {
              lines.push({ type: 'right', right: rQue.shift(), rNum: rCnt++ })
            }
            lines.push({ type: 'match', right: line, left: line, lNum: lCnt++, rNum: rCnt++ })
          }
        })
        setLines(lines)
      }
    })()
  }, [ipfs])
  
  return <div id='diff'>
    <h1>{name}</h1>
    <ol>
      {lines.map(({ start, right, left, rNum, lNum, type }) => {
        return (
          start
          ? <li className='start'>{start}</li>
          : <li className={type}>
            <Line num={lNum} text={left} type='left'/>
            <Line num={rNum} text={right} type='right'/>
          </li>
        )
      })}
    </ol>
  </div>
}