window.addEventListener('load', async () => {
  const web3 = new Web3(window.ethereum)
  const addr = await ethereum.enable()
  const name = 'this name is ok?'
  const tld = 'test' /* 'eth' */

  console.log(ethereum.send('readYourProfile', []))
  console.log('CoinBase', web3.version, ethereum)

  ethereum.send('readYourProfile', [])
  .then(result => {
    console.log('readYourProfile:', result, result.result.name)
  })
  .catch(error => {
    console.error(error)
  })


  const revAddr = web3.eth.coinbase.substr(2) + '.addr.reverse'

  console.log('ENC', Web3.fromUtf8("Hello from Toptal!"))


  console.log('ADDR', addr)

  // web3.personal.sign(
  //   web3.fromUtf8("Howdy-Ho!"),
  //   web3.eth.coinbase,
  //   (err, sig) => (err ? console.error(err) : console.log(sig))
  // )

  const sha3 = web3.utils ? web3.utils.sha3 : web3.sha3

  const namehash = (name) => {
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000'
    if(name !== '') {
      const labels = name.split(".")
      for(var i = labels.length - 1; i >= 0; i--) {
        node = sha3(node + sha3(labels[i]).slice(2), { encoding: 'hex' })
      }
    }
    return node.toString()
  }

  const ensAddr = '0x112234455c3a32fd11230c42e7bccd4a84e02010'
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

  const getContract = (abi, addr) => (
    web3.eth.Contract
    ? new web3.eth.Contract(abi, addr)
    : web3.eth.contract(abi).at(addr)
  )

  // https://github.com/ensdomains/ens/blob/master/contracts/ENSRegistry.sol
  const ens = getContract(ensAbi, ensAddr)

  const registrarAbi = [
    {name: "ens", constant: true, inputs: [],outputs:[{name:"",type:"address"}],payable:false,type:"function"},
    {name: "expiryTimes", constant: true, inputs: [{name:"",type:"bytes32"}],outputs:[{name:"",type:"uint256"}],payable:false,type:"function"},
    {name: "register", constant:false,inputs:[{name:"subnode",type:"bytes32"},{name:"owner",type:"address"}],outputs:[],payable:false,type:"function"},
    {name: "rootNode",constant: true, inputs:[], outputs:[{name:"",type:"bytes32"}],payable:false,type:"function"},
    {type: "constructor", inputs:[{name:"ensAddr",type:"address"},{name:"node",type:"bytes32"}]}
  ]
  // https://github.com/ensdomains/ens/blob/master/contracts/TestRegistrar.sol
  const nh = namehash(tld)
  console.log('NameHash', nh)
  const registrarAddress = await (
    ens.methods
    ? ens.methods.owner(nh).call()
    : new Promise((resolve, reject) => { ens.owner(nh, (err, addr) => { if(err) { reject(err) } else { resolve(addr) } }) })
  )
  console.log('.test TLD owner', registrarAddress)
  const registrar = getContract(registrarAbi, registrarAddress)

  //Buy domain (free on ropsten - valid for 28 days)
  // web3v3: await registrar.methods.register(web3.utils.sha3("sterlu"), yourAccount).send({from: yourAccount})
  registrar.register(
    sha3(name), web3.eth.coinbase,
    (err, addr) => { if(err) { throw err } console.log(`TX:${name}:: ${addr}`) }
  )

  // Set resolver for our domain. Resolver can have different records & metadata for domain.
  await new Promise((res, rej) => (
    ens.setResolver(
      namehash(`${name}.${tld}`), '0x4c641fb9bad9b60ef180c31f56051ce826d21a9a',
      err => { if(err) { console.error(err); rej(err) } else { res() } }
    )
  ))
  ens.resolver(namehash(`${name}.${tld}`), (err, addr) => console.log(`${name}.${tld}`, addr))

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
  // https://github.com/ensdomains/ens/blob/master/contracts/PublicResolver.sol
  const publicResolver = getContract(publicResolverAbi, '0x4c641fb9bad9b60ef180c31f56051ce826d21a9a');

  // get address of reverseRegistrar
  const reverseRegistarAddr = await new Promise((res, rej) => ens.owner(namehash('addr.reverse'), (err, addr) => res(addr)))
  const reverseRegistrarAbi = [
    {"name":"claimWithResolver","constant":false,"inputs":[{"name":"owner","type":"address"},{"name":"resolver","type":"address"}],"outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},
    {"name":"claim","constant":false,"inputs":[{"name":"owner","type":"address"}],"outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},
    {"name":"ens","constant":true,"inputs":[],"outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},
    {"name":"defaultResolver","constant":true,"inputs":[],"outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},
    {"name":"node","constant":true,"inputs":[{"name":"addr","type":"address"}],"outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"type":"function"},
    {"name":"setName","constant":false,"inputs":[{"name":"name","type":"string"}],"outputs":[{"name":"node","type":"bytes32"}],"payable":false,"type":"function"},
    {"type":"constructor","inputs":[{"name":"ensAddr","type":"address"},{"name":"resolverAddr","type":"address"}],"payable":false}
  ]
  // https://github.com/ensdomains/ens/blob/master/contracts/ReverseRegistrar.sol
  const reverseRegistrar = getContract(reverseRegistrarAbi, reverseRegistarAddr)

  reverseRegistrar.claim(web3.eth.coinbase, (err, name) => console.log('NM', name))
  ens.owner(namehash(revAddr), (err, owner) => console.log('REV OWN', owner))

  // set resolver & call setName on resolver
  const node = await new Promise((res, rej) => reverseRegistrar.setName(`${name}.${tld}`, (err, ret) => res(ret)))
  console.log('node', node)

  const reverseResolverAddr = await new Promise((res, rej) => (
    ens.resolver(namehash(revAddr), (err, addr) => res(addr))
  ))
  const reverseResolver = getContract(publicResolverAbi, reverseResolverAddr)
  const myName = await new Promise((res, rej) => (
    reverseResolver.methods.name(namehash(revAddr), (err, addr) => res(addr))
  ))
  console.log("I'm", myName)

  // ABIs from https://github.com/ensdomains/ens-manager/blob/master/src/api/ens.js
})