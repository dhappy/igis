import React, { useState, useEffect } from 'react'
import { channelRoot, createChannel, createMessage, parseMessage, mamAttach, mamFetch, mamFetchAll } from '@iota/mam.js'
import { composeAPI } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { Button, Input } from 'antd'
import { scryRenderedDOMComponentsWithTag } from 'react-dom/test-utils'

const genSeed = (length = 81) => {
  var chars        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'; // The allowed characters in the seed.
  var randomValues = new Uint32Array(length);       // An empty array to store the random values.
  var result       = new Array(length);             // An empty array to store the seed characters.

  window.crypto.getRandomValues(randomValues);      // Generate random values and store them to array.

  var cursor = 0;                                   // A cursor is introduced to remove modulus bias.
  for (var i = 0; i < randomValues.length; i++) {   // Loop through each of the 81 random values.
      cursor += randomValues[i];                    // Add them to the cursor.
      result[i] = chars[cursor % chars.length];     // Assign a new character to the seed based on cursor mod 81.
  }

  return result.join('');                           // Merge the array into a single string and return it.
}

export default () => {
  const [seed] = useState(genSeed())
  const [tag, setTag] = useState('IGIS9TESTING')
  const [root, setRoot] = useState()
  const mode = 'public'
  const [channelState, setChannelState] = useState(createChannel(seed, 2, mode))
  //const [api] = useState(composeAPI({ provider: 'https://altnodes.devnet.iota.org:443' }))
  const [api] = useState(composeAPI({ provider: 'https://nodes.thetangle.org:443' }))

  const createMAM = async () => {
    console.debug({...channelState})

    // Create a MAM message using the channel state.
    // The returned mamMessage will contain address, root, nextRoot and payload.
    // The channel state is also updated, so you should persist it if you want
    // to add further messages in the same channel.
    // The payload should be attached to the tangle.
    const mamMessage = createMessage(channelState, 'MY9MESSAGE');
    setChannelState(channelState)

    if(!root) {
      setRoot(mamMessage.root)
    }
    console.debug(mamMessage)
    console.debug({...channelState})

    // // Decode the message using the root and sideKey.
    // // The decodedMessage will contain nextRoot and message.
    // const decodedMessage = parseMessage(mamMessage.payload, mamMessage.root, sideKey);

    // And then attach the message, tagging it if required.
    // Attaching will return the actual transactions attached to the tangle if you need them.
    const depth = 3
    const mvw = 14 /* mainnet */ // 9 /* devnet */
    const transactions = await mamAttach(api, mamMessage, depth, mvw, tag);

    console.info(transactions)
  }

  const fetchMAM = async () => {
    // // We can also fetch a message given its root and channel details.
    // // The fetched data will contain the nextRoot and the message.
    const fetched = await mamFetch(api, root, mode)
    console.log(fetched)

    // // If you want to fetch multiple messages from a channel
    // // you need either its initial root (or start from another root).
    // const channelState = createChannel(seed, 2, mode, sideKey);
    // const chunkSize = 4;
    // const chunk = await mamFetchAll(api, channelState.initialRoot, mode, sideKey, chunkSize);
  }

  return [
    <Input key='in' value={tag} onChange={evt => setTag(evt.target.value)}/>,
    <Button key='put' onClick={createMAM}>Create</Button>,
    <Button key='get' onClick={fetchMAM}>Fetch</Button>
  ]
}