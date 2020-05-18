# Interplanetary Git Service (IGiS)

This is a rewrite of [IGiS](//github.com/ipfs-shipyard/IGiS) to support the output of [git-remote-igis](//github.com/dhappy/git-remote-igis).

## Development

This system uses [Mailvelope](//mailvelope.com) for identity management. Mailvelope will only insert itself into a client page if it is served from an authorized domain over trusted HTTPS.
This means creating a root certificate authority, trusting it in your browser, and then signing a server certificate with it.

When you run `yarn start`, it will run on port `4443` with SSL. I've included [a root certificate](config/doh.pem) you can trust, or [a script](config/ca.sh) to generate your own.

You have to connect on port `443` for it to work. On many *nix systems the following will forward `443` to `4443` and vice-versa, so you don't have to run the server as root.

* `sudo iptables -t nat -I PREROUTING --src 0/0 --dst 127.0.0.1 -p tcp --dport 443 -j REDIRECT --to-ports 4443`
* `sudo iptables -t nat -I OUTPUT --src 0/0 --dst 127.0.0.1 -p tcp --dport 443 -j REDIRECT --to-ports 4443`

## Updates

This system uses IOTA's Masked Authentication Messaging (MAM) to publish updates about a repository.

So, when a commit is published, a new root is created with the current commit, which contains the old mam root. So when a `list` command is issued by `git` it checks those chains. 