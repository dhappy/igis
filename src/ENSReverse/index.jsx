import React, { useState, useEffect } from 'react'
import Web3 from 'web3'
// To replace window.ethereum:
// import { initProvider } from '@metamask/inpage-provider'
// import * as LocalMessageDuplexStream from 'post-message-stream'
import MetamaskOnboarding from '@metamask/onboarding'
import './index.css'
import { Input, Button } from '@ant-design'

const { ethereum } = window
const web3 = new Web3(ethereum)

const logger = (css) => ((...args) => {
  args[0] = `%c ${args[0]} `
  args.splice(1, 0, css)
  console.log.apply(this, args)
})

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
  Rinkeby: {
    ens: '0xe7410170f87102df0055eb195163a03b7f2bff4a'
  },
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
  const onboarding = new MetamaskOnboarding()
  const [name, setName] = useState('dhappy') //useState("Are there /'s Allowed? 🐳")
  const [tld, setTLD] = useState('eth') // eth
  const [titles, setTitles] = useState({
    self: 'Your Address',
    net: 'Current Network',
    rev: 'Reverse Address',
    ens: 'ENS Address',
    reg: 'Registrar Address',
    revReg: 'Reverse Registrar Address',
    owner: () => ({ toString: () => `${name}.${tld} Owner` }),
    revOwn: `Reverse Lookup Owner`,
    resolve: 'Resolver Address',
    revLook: 'Reverse Lookup',
  })
  const [addrs, setAddrs] = useState({})
  const [tracts, setTracts] = useState({})

  const updateAddr = (key, val) => {
    setAddrs(as => ({ ...as, [key]: val }))
  }

  const netSet = () => {
    const net = (() => {
      switch(parseInt(ethereum.networkVersion)) {
        case 1: return 'mainnet'
        case 2: return 'Morden'
        case 3: return 'Ropsten'
        case 4: return 'Rinkeby'
        case 42: return 'Kovan'
        default: return `unknown (id:${ethereum.networkVersion})`
      }
    })()
    updateAddr('net', net)
    console.log(Object.assign({}, NET[net]))
    setAddrs(as => Object.assign({}, as, NET[net]))
  }
  ethereum.on('networkChanged', () => {
    setAddrs({}); setTracts({})
  })
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
        const log = logger('color: purple')
        log('Enabling Inpage Provider')
        const addr = (await window.ethereum.enable())[0]
        updateAddr('self', addr)
        log('Wallet Address', addr)
      },
      if: () => !addrs.self,
    },
    {
      name: 'Load Addresses',
      func: async () => {
        const log = logger('color: orange; background-color: purple')

        log('Setting addrs.net')
        netSet()

        log('Adding Reverse Address')
        updateAddr('rev', addrs.self.substr(2) + '.addr.reverse')
      },
      if: () => !!addrs.self && !addrs.net,
    },
    {
      name: 'Load Contracts',
      func: async () => {
        const log = logger('color: lightgray; background-color: black')

        const ens = new web3.eth.Contract(ensAbi, addrs.ens)

        log('Looking Up Owner of resolver.eth')
        const resolverEthAddress = await ens.methods.owner(namehash('resolver.eth')).call()
        updateAddr('resEth')
        log('Owner', resolverEthAddress)

        const publicResolver = new web3.eth.Contract(publicResolverAbi, resolverEthAddress)
        let name = await publicResolver.methods.name(namehash(addrs.rev)).call()
        log('name', name, addrs.rev)
        // updateAddr('revLook', name)

        // log(`Looking Up Owner of ${tld}`)
        // const registrarAddress = await ens.methods.owner(namehash(tld)).call()
        // updateAddr('reg', registrarAddress)
        // log('Owner', registrarAddress)
  
        // log('Creating ENS and Regisrtar Contracts')
        // const registrar = new web3.eth.Contract(registrarAbi, registrarAddress)
        // log('Contracts Completed', `ens:${ens}`, `reg:${registrar}`)
  
        // log(`Looking Up Owner of addr.reverse`)
        // const reverseRegistarAddr = await ens.methods.owner(namehash('addr.reverse')).call()
        // updateAddr('revReg', reverseRegistarAddr)
        // log('Owner', reverseRegistarAddr)
  
        // log(`Creating a Reverse Resolver (${addrs.rev})`)
        // const reverseResolverAddr = await ens.methods.resolver(namehash(addrs.rev)).call()
        // log(reverseResolverAddr) // null
        // const reverseResolver = new web3.eth.Contract(publicResolverAbi, reverseResolverAddr)
        // // let name = await reverseResolver.methods.name(namehash(addrs.rev)).call()
        // // updateAddr('revLook', name)
        // // console.log('Got Reverse Lookup', name)
  
        // log(`Looking Up Owner of ${addrs.rev}`)
        // let owner = await ens.methods.owner(namehash(addrs.rev)).call()
        // updateAddr('revOwn', owner)
        // log('Owner', owner)
  
        // log(`Looking Up Owner of ${name}.${tld}`)
        // owner = await ens.methods.owner(namehash(`${name}.${tld}`)).call()
        // updateAddr('owner', owner)
        // log('Owner', owner)
  
        // log('Creating ENS and Regisrtar Contracts')
        // const registrar = new web3.eth.Contract(registrarAbi, registrarAddress)
        // log('Contracts Completed', `ens:${ens}`, `reg:${registrar}`)

        // log(`Looking Up Owner of ${tld}`)
        // const registrarAddress = await ens.methods.owner(namehash(tld)).call()
        // updateAddr('reg', registrarAddress)
        // log('Owner', registrarAddress)

        // log('Creating ENS and Regisrtar Contracts')
        // const registrar = new web3.eth.Contract(registrarAbi, registrarAddress)
        // log('Contracts Completed', `ens:${ens}`, `reg:${registrar}`)

        // log(`Looking Up Owner of addr.reverse`)
        // const reverseRegistarAddr = await ens.methods.owner(namehash('addr.reverse')).call()
        // updateAddr('revReg', reverseRegistarAddr)
        // log('Owner', reverseRegistarAddr)

        // log(`Creating a Reverse Resolver (${addrs.rev})`)
        // const reverseResolverAddr = await ens.methods.resolver(namehash(addrs.rev)).call()
        // log(reverseResolverAddr) // null
        // const reverseResolver = new web3.eth.Contract(publicResolverAbi, reverseResolverAddr)
        // // let name = await reverseResolver.methods.name(namehash(addrs.rev)).call()
        // // updateAddr('revLook', name)
        // // console.log('Got Reverse Lookup', name)

        // log(`Looking Up Owner of ${addrs.rev}`)
        // let owner = await ens.methods.owner(namehash(addrs.rev)).call()
        // updateAddr('revOwn', owner)
        // log('Owner', owner)

        // log(`Looking Up Owner of ${name}.${tld}`)
        // owner = await ens.methods.owner(namehash(`${name}.${tld}`)).call()
        // updateAddr('owner', owner)
        // log('Owner', owner)

        // log('Caching Contracts')
        // const reverseRegistrar = new web3.eth.Contract(reverseRegistrarAbi, reverseRegistarAddr)
        // const tracts = { reg: registrar, ens: ens, revRes: reverseResolver, revReg: reverseRegistrar }
        // console.log(tracts)
        // setTracts(t => Object.assign({}, t, tracts))
        // log('Done')
      },
      if: () => !!addrs.net && !tracts.revRes,
    },
    {
      name: `Register: ${name}.${tld}`,
      func: async () => {
        if(addrs.owner != addrs.self) {
          await tracts.reg.methods.register(web3.utils.sha3(name), addrs.self).send({ from: addrs.self })
          let owner = await tracts.ens.methods.owner(namehash(`${name}.${tld}`)).call()
          updateAddr('owner', owner)
        }
      },
      if: () => addrs.owner != addrs.self,
    },
    {
      name: 'Set a Resolver for the New Domain',
      func: async () => {
        await tracts.ens.methods.setResolver(namehash(`${name}.${tld}`), addrs.resolve).send({ from: addrs.self })
      },
      if: () => !!tracts.ens && !!addrs.resolve,
    },
    {
      name: 'Claim the Reverse Address',
      func: async () => {
        console.log(tracts)
        if(addrs.revOwn !== addrs.self) {
          await tracts.revReg.methods.claim(addrs.self).send({ from: addrs.self })
          const owner = await tracts.ens.methods.owner(namehash(addrs.rev)).call()
          updateAddr('revOwn', owner)
        }
      },
      if: () => true || !!addrs.rev && !!tracts.revReg
    },
    {
      name: 'Set Resolver and Link Reverse Name',
      func: async () => {
        if(addrs.revLook !== `${name}.${tld}`) {
          const node = await tracts.revReg.methods.setName(`${name}.${tld}`).send({ from: addrs.self })
          const revLook = await tracts.revRes.methods.name(namehash(addrs.rev)).call()
          updateAddr('revLook', revLook)
        }
      },
      if: () => !!tracts.ens && !!tracts.revReg
    }
  ]

  return (
    <div id=''>
      <div id='config' style={{display: 'flex'}}>
        <Input value={name} onChange={evt => setName(evt.target.value)}/>
        <Input value={tld} onChange={evt => setTLD(evt.target.value)}/>
      </div>
      <div id='steps'>
        <ul id='data'>
          {Object.entries(titles).map(([key, title], i) => (
            <li key={i}><div>{title.call ? title.call(this) : title}</div><div>{addrs[key]}</div></li>
          ))}
        </ul>
        <div id='buttons' style={{display: 'flex', flexDirection: 'column'}}>
          {handlers.map((h, i) => (
            <button key={i} onClick={h.func} disabled={h.if ? !h.if() : false}>{h.name}</button>
          ))}
        </div>
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