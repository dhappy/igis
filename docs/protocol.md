# IGiS Protocols

## Pushing a Repository

The goal is to provide a mechanism for a user to retrieve the latest version of a repository.

When a repository is pushed, a UnixFS Protobuf filesystem of the branch that was pushed is generated in IPFS. That filesystem includes a `.git/` CBOR-DAG. That DAG has the following structure:

```javascript
{
   // The branch which contains the tree used to build the root filesystem
  HEAD: 'refs/heads/master',

  // The references available in the repository: the branches and tags
  // The names link to CBOR-DAGs representing commits or tags
  refs: { heads: { master: *CID* } },

  // An Ed25519 signing key
  publisher: 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
}
```

The cyptocurrency IOTA generates random addresses from a seed. A masked authentication message (MAM) channel is formed by publishing to successive address, each time including in the message the next address that will be published to.

A signed message is posted to a MAM channel with the new version of the repository.

Additionally, signed a message is sent to an address representing the multicodec of the CID of the repository with the next root of the MAM channel.

## Creating a Pull Request

A pull request is created using two repositories