// why are you writing code here? explain from step 1 to end.
// node js server to create signature data from private key as a ticket for nft minting from joining total supply and user address. code in web3.js

const bodyParser = require('body-parser' )
const express = require('express')
const cors = require('cors')
const Web3 = require('web3')
require('dotenv').config()
const web3 = new Web3()
const app = express()
app.use(cors())
const port = 4000
app.use(express.json())
app.use(bodyParser.json())
app.use(express.json({ limit: '2mb' }))

// Set the private key of the user who wants to mint the NFT
// const publicKey = '0x8a46c73584e4569b25da0fd674f9df1fac99d700'
const privateKey =
    '151c223d280d48ec10d377a83f2510c09176755385f6f586a0b74a846f434a80' // replace with actual private key

// Load the whitelist from the Node.js server
const whitelist = [
    '0x8a46c73584e4569b25da0fd674f9df1fac99d700',
    '0x7242Ca848aB6e8a52942E189b0Afd5B7410Ef5f9',
    '0x...',
].map((a) => a.toLowerCase()) // replace with actual whitelist

app.get('/', (req, res) => {
    res.send('Hi')
})
app.get('/wl', (req, res) => {
    res.json({ whitelist })
})

// Define the API endpoint for NFT minting
app.post('/mint-nft', (req, res) => {
    // Get the user's address and signed data from the request body
    const userAddress = ('' + req.body.userAddress).toLowerCase()
    const message = req.body.message
    const signedData = req.body.signedData

    // Check if the user's address is included in the whitelist
    if (whitelist.includes(userAddress)) {
        console.log(`${userAddress} is whitelisted!`)

        // const { v, r, s } = web3.eth.accounts.recover(message, signedData)
        const signerAddress = web3.eth.accounts
            .recover(message, signedData.result)
            .toLowerCase()

        // Check if the recovered signer is the same as the user's address
        if (signerAddress === userAddress.toLowerCase()) {
            console.log(
                `Signer ${signerAddress} is the same as user ${userAddress}!`
            )

            // Proceed with NFT minting
            // Sign the message with the user's private key
            const message = web3.utils.soliditySha3(userAddress + Math.floor(Date.now() / 1000));
            const signature = web3.eth.accounts.sign(message, privateKey)

            // Return the signature data as a JSON response
            res.json({
                message: signature.messageHash,
                signature: signature.signature,
            })
        } else {
            console.log(
                `Signer ${signerAddress} is not the same as user ${userAddress}!`
            )

            // Abort NFT minting
            // Return an error message as a JSON response
            res.status(401).json({
                error: 'User address does not match signed data!',
            })
        }
    } else {
        console.log(`${userAddress} is not whitelisted!`)

        // Abort NFT minting
        // Return an error message as a JSON response
        res.status(401).json({
            error: 'User address is not whitelisted!',
        })
    }
})

// Start the server
app.listen(process.env.PORT || port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
