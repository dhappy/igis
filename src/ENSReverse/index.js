import React, { useState, useEffect } from 'react'
import { initProvider } from '@metamask/inpage-provider'
import Web3 from 'web3'
import * as LocalMessageDuplexStream from 'post-message-stream'
import { Button } from 'antd'
import MetamaskOnboarding from '@metamask/onboarding'
import './index.css'

const { ethereum } = window
const web3 = new Web3(ethereum)

const namehash = (name) => {
  let node = '0x0000000000000000000000000000000000000000000000000000000000000000'
  if(name !== '') {
    const labels = name.split(".")
    for(let i = labels.length - 1; i >= 0; i--) {
      node = web3.utils.sha3(node + web3.utils.sha3(labels[i]).slice(2), { encoding: 'hex' })
    }
  }
  return node.toString()
}

const NET = {
  Ropsten: {
    ens: '0x112234455c3a32fd11230c42e7bccd4a84e02010',
    resolve: '0x4c641fb9bad9b60ef180c31f56051ce826d21a9a',
  },
  mainnet: {
    ens: '0x314159265dd8dbb310642f98f50c066173c1259b',
    resolve: '0xe7410170f87102df0055eb195163a03b7f2bff4a',
  },
//  Rinkeby: {
//    ens: '0xe7410170f87102df0055eb195163a03b7f2bff4a'
//  },
}

const ensAbi = [
  {name: 'resolver', constant: true, inputs: [{name: 'node', type: 'bytes32'}], outputs: [{name: '', type: 'address'}], payable: false, type: 'function'},
  {name: 'owner', constant: true, inputs: [{name: 'node', type: 'bytes32'}], outputs:[{name: '', type: 'address'}], payable: false, type: 'function'},
  {name: 'setSubnodeOwner', constant: false,inputs: [{name: 'node', type: 'bytes32'}, {name: "label",type: "bytes32"}, {name: "owner",type: "address"}], outputs: [], payable: false, type: "function"},
  {name: "setTTL", constant: false, inputs:[{name: "node",type: "bytes32"}, {name:"ttl","type":"uint64"}], outputs:[], payable: false, "type":"function"},
  {name: "ttl", constant: true,inputs: [{"name":"node","type":"bytes32"}],outputs: [{"name":"","type":"uint64"}],payable: false,type:"function"},
  {name: "setResolver", constant:false,inputs:[{"name":"node","type":"bytes32"},{name:"resolver","type":"address"}],"outputs":[],"payable":false,"type":"function"},
  {name: "setOwner", constant:false,inputs:[{"name":"node","type":"bytes32"},{name:"owner","type":"address"}],"outputs":[],"payable":false,"type":"function"},
  {name: "Transfer",type:"event",anonymous:false,"inputs":[{"indexed":true,"name":"node",type:"bytes32"},{"indexed":false,"name":"owner","type":"address"}]},
  {name: "NewOwner",type:"event", anonymous:false,inputs: [{"indexed":true,"name":"node",type:"bytes32"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":false,name:"owner","type":"address"}]},
  {name: "NewResolver", type:"event", anonymous:false,inputs:[{"indexed":true,"name":"node",type:"bytes32"},{"indexed":false,"name":"resolver","type":"address"}]},
  {name: "NewTTL",type: "event", anonymous: false,"inputs":[{"indexed":true,"name":"node",type:"bytes32"},{"indexed":false,"name":"ttl","type":"uint64"}]}
]

const registrarAbi = [
  {name: "ens", constant: true, inputs: [],outputs:[{name:"",type:"address"}],payable:false,type:"function"},
  {name: "expiryTimes", constant: true, inputs: [{name:"",type:"bytes32"}],outputs:[{name:"",type:"uint256"}],payable:false,type:"function"},
  {name: "register", constant:false,inputs:[{name:"subnode",type:"bytes32"},{name:"owner",type:"address"}],outputs:[],payable:false,type:"function"},
  {name: "rootNode",constant: true, inputs:[], outputs:[{name:"",type:"bytes32"}],payable:false,type:"function"},
  {type: "constructor", inputs:[{name:"ensAddr",type:"address"},{name:"node",type:"bytes32"}]}
]

const publicResolverAbi = [
  {"name":"supportsInterface","constant":true,"inputs":[{"name":"interfaceID","type":"bytes4"}],"outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},
  {"name":"ABI","constant":true,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentTypes","type":"uint256"}],"outputs":[{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"payable":false,"type":"function"},
  {"name":"setPubkey","constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"outputs":[],"payable":false,"type":"function"},
  {"name":"content","constant":true,"inputs":[{"name":"node","type":"bytes32"}],"outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},
  {"name":"addr","constant":true,"inputs":[{"name":"node","type":"bytes32"}],"outputs":[{"name":"ret","type":"address"}],"payable":false,"type":"function"},
  {"name":"setABI","constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"contentType","type":"uint256"},{"name":"data","type":"bytes"}],"outputs":[],"payable":false,"type":"function"},
  {"name":"name","constant":true,"inputs":[{"name":"node","type":"bytes32"}],"outputs":[{"name":"ret","type":"string"}],"payable":false,"type":"function"},
  {"name":"setName","constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"name","type":"string"}],"outputs":[],"payable":false,"type":"function"},
  {"name":"setContent","constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"hash","type":"bytes32"}],"outputs":[],"payable":false,"type":"function"},
  {"name":"pubkey","constant":true,"inputs":[{"name":"node","type":"bytes32"}],"outputs":[{"name":"x","type":"bytes32"},{"name":"y","type":"bytes32"}],"payable":false,"type":"function"},
  {"name":"setAddr","constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"addr","type":"address"}],"outputs":[],"payable":false,"type":"function"},
  {"type":"constructor","inputs":[{"name":"ensAddr","type":"address"}],"payable":false},
  {"name":"AddrChanged","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"a","type":"address"}]},
  {"name":"ContentChanged","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"hash","type":"bytes32"}]},
  {"name":"NameChanged","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"name","type":"string"}]},
  {"name":"ABIChanged","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"contentType","type":"uint256"}]},
  {"name":"PubkeyChanged","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"x","type":"bytes32"},{"indexed":false,"name":"y","type":"bytes32"}]}
]

const reverseRegistrarAbi = [
  {"name":"claimWithResolver","constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"resolver","type":"address"}],"outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},
  {"name":"claim","constant":false,"inputs":[{"name":"owner","type":"address"}],"outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},
  {"name":"ens","constant":true,"inputs":[],"outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},
  {"name":"defaultResolver","constant":true,"inputs":[],"outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},
  {"name":"node","constant":true,"inputs":[{"name":"addr","type":"address"}],"outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},
  {"name":"setName","constant":false,"inputs":[{"name":"name","type":"string"}],"outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},
  {"type":"constructor","inputs":[{"name":"ensAddr","type":"address"},{"name":"resolverAddr","type":"address"}],"payable":false}
]

export default () => {
  // const metamaskStream = new LocalMessageDuplexStream({
  //   name: 'inpage', target: 'contentscript',
  // })
  // const ethereum = initProvider({ connectionStream: metamaskStream })
  //const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
  const onboarding = new MetamaskOnboarding()
  const [name, setName] = useState('dhappy') //useState("Are there /'s Allowed? 🐳")
  const [tld, setTLD] = useState('eth') // test
  const [addrs, setAddrs] = useState({
    self: { title: 'Your Address' },
    net: { title: 'Current Network' },
    rev: { title: 'Reverse Address' },
    ens: { title: 'ENS Address' },
    reg: { title: 'Registrar Address' },
    revReg: { title: 'Reverse Registrar Address' },
    owner: { title: `${name}.${tld} Owner` },
    resolve: { title: 'Resolver Address' },
    revLook: { title: 'Reverse Lookup' },
  })
  const [tracts, setTracts] = useState({})
  const [pos, setPos] = useState(0)

  const updateAddr = (key, val) => {
    setAddrs(s => ({ ...s, [key]: { title: (s[key] || {}).title, val: val }}))
  }

  useEffect(() => {
    if(addrs.net.val) {
      Object.entries(NET[addrs.net.val]).forEach(([key, val]) => updateAddr(key, val))
    }
  }, [addrs.net.val])

  const netSet = () => (
    updateAddr(
      'net',
      (() => {
        switch(parseInt(ethereum.networkVersion)) {
          case 1: return 'mainnet'
          case 2: return 'Morden'
          case 3: return 'Ropsten'
          case 4: return 'Rinkeby'
          case 42: return 'Kovan'
          default: return `unknown (id:${ethereum.networkVersion})`
        }
      })()
    )
  )
  ethereum.on('networkChanged', netSet)
  ethereum.on('accountsChanged', (accts) => updateAddr('self', accts[0]))

  const handlers = [
    {
      name: 'Install MetaMask',
      func: () => onboarding.startOnboarding(),
      if: () => !MetamaskOnboarding.isMetaMaskInstalled(),
    },
    {
      name: 'Stop Onboarding',
      func: () => { try { onboarding.stopOnboarding() } catch(err) { /*console.warn(err)*/ } },
      if: () => !MetamaskOnboarding.isMetaMaskInstalled(),
    },
    {
      name: 'Enable Ethereum on this Site',
      func: async () => {
        console.info('%cEnabling Inpage Provider', 'color: purple')
        const addr = (await window.ethereum.enable())[0]
        updateAddr('self', addr)
        console.info('%cADDR', 'color: purple', addr)
      },
      if: () => !addrs.self.val,
    },
    {
      name: 'Load Network-Appropriate Settings',
      func: () => {
        netSet()
        const revAddr = addrs.self.val.substr(2) + '.addr.reverse'
        updateAddr('rev', revAddr)
      },
      if: () => !!addrs.self.val && !addrs.net.val,
    },
    {
      name: 'Get Addresses & Create Registrar',
      func: async () => {
        const ens = new web3.eth.Contract(ensAbi, addrs.ens.val)
        const registrarAddress = await ens.methods.owner(namehash(tld)).call()
        updateAddr('reg', registrarAddress)
        const registrar = new web3.eth.Contract(registrarAbi, registrarAddress)
        setTracts(t => ({ ...t, reg: registrar, ens: ens }))
        //updateAddr('regCon', registrar)
      },
      if: () => !!addrs.ens.val && !addrs.reg.val
    },
    {
      name: 'Register A .test Name (28-day Expiry)',
      func: async () => {
        const cert = await tracts.reg.methods.register(web3.utils.sha3(name), addrs.self.val).send({ from: addrs.self.val })
      },
      if: () => !!tracts.reg,
    },
    {
      name: 'Set a Resolver for the New Domain',
      func: async () => {
        const ret = await tracts.ens.methods.setResolver(namehash(`${name}.${tld}`), addrs.resolve.val).send({ from: addrs.self.val })
      },
      if: () => !!tracts.ens && !!addrs.resolve.val,
    },
    {
      name: 'Create the Reverse Registrar',
      func: async () => {
        let owner = await tracts.ens.methods.owner(namehash(addrs.rev.val)).call()
        const reverseRegistarAddr = await tracts.ens.methods.owner(namehash('addr.reverse')).call()
        updateAddr('revReg', reverseRegistarAddr)
        const reverseRegistrar = new web3.eth.Contract(reverseRegistrarAbi, reverseRegistarAddr)
        setTracts(t => ({ ...t, revReg: reverseRegistrar }))
        if(owner !== addrs.self.val) {
          const publicResolver = new web3.eth.Contract(publicResolverAbi, addrs.resolve.val);
          await reverseRegistrar.methods.claim(addrs.self.val).send({ from: addrs.self.val })
          owner = await tracts.ens.methods.owner(namehash(addrs.rev.val)).call()
        }
        updateAddr('owner', owner)
      },
      if: () => !!addrs.resolve.val && !tracts.revReg
    },
    {
      name: 'Set Resolver and Link Reverse Name',
      func: async () => {
        const addr = await tracts.ens.methods.resolver(namehash(addrs.rev.val)).call()
        const reverseResolver = new web3.eth.Contract(publicResolverAbi, addr)
        let myName = await reverseResolver.methods.name(namehash(addrs.rev.val)).call()

        if(myName !== `${name}.${tld}`) {
          const node = await tracts.revReg.methods.setName(`${name}.${tld}`).send({ from: addrs.self.val })
          myName = await reverseResolver.methods.name(namehash(addrs.rev.val)).call()
        }
        updateAddr('revLook', myName)
      },
      if: () => !!tracts.ens && !!tracts.revReg
    }
  ]

  const incHandler = (d) => () => {
    setPos((pos) => {
      const nxt = pos + d
      if(handlers[nxt - 1]) handlers[nxt - 1].call()
      return nxt
    })
  }

  return (
    <div id='steps'>
      <ul id='data'>
        {Object.values(addrs).map(({ title, val }, i) => (
          <li key={i}><div>{title}</div><div>{val}</div></li>
        ))}
      </ul>
      <div id='buttons' style={{display: 'flex', flexDirection: 'column'}}>
        {handlers.map((h, i) => (
          <button key={i} onClick={h.func} disabled={h.if ? !h.if() : false}>{h.name}</button>
        ))}
      </div>
    </div>
  )
  // // web3.personal.sign(
  // //   web3.fromUtf8("Howdy-Ho!"),
  // //   web3.eth.coinbase,
  // //   (err, sig) => (err ? console.error(err) : console.log(sig))
  // // )

  // // ABIs from https://github.com/ensdomains/ens-manager/blob/master/src/api/ens.js
}