const { expect } = require("chai")
const { ethers } = require("hardhat")

describe.only("BasedOFT: ", function () {
    const baseChainId = 1
    const otherChainId = 2
    const name = "OmnichainFungibleToken"
    const symbol = "OFT"
    const globalSupply = ethers.utils.parseUnits("1000000", 18)

    let owner, lzEndpointBase, lzEndpointOther, baseOFT, otherOFT

    before(async function () {
        owner = (await ethers.getSigners())[0]
    })

    beforeEach(async function () {
        const LZEndpointMock = await ethers.getContractFactory("LZEndpointMock")
        const BasedOFT = await ethers.getContractFactory("BasedOFT")
        const OFT = await ethers.getContractFactory("OFT")

        lzEndpointBase = await LZEndpointMock.deploy(baseChainId)
        lzEndpointOther = await LZEndpointMock.deploy(otherChainId)

        expect(await lzEndpointBase.getChainId()).to.equal(baseChainId)
        expect(await lzEndpointOther.getChainId()).to.equal(otherChainId)

        //------  deploy: base & other chain  -------------------------------------------------------
        // create two BasedOFT instances. both tokens have the same name and symbol on each chain
        // 1. base chain
        // 2. other chain
        baseOFT = await BasedOFT.deploy(name, symbol, lzEndpointBase.address, globalSupply)
        otherOFT = await OFT.deploy(name, symbol, lzEndpointOther.address, globalSupply)

        // internal bookkeeping for endpoints (not part of a real deploy, just for this test)
        lzEndpointBase.setDestLzEndpoint(otherOFT.address, lzEndpointOther.address)
        lzEndpointOther.setDestLzEndpoint(baseOFT.address, lzEndpointBase.address)

        //------  setTrustedRemote(s) -------------------------------------------------------
        // for each OFT, setTrustedRemote to allow it to receive from the remote OFT contract.
        // Note: This is sometimes referred to as the "wire-up" process.
        await baseOFT.setTrustedRemote(otherChainId, otherOFT.address)
        await otherOFT.setTrustedRemote(baseChainId, baseOFT.address)

        // ... the deployed OFTs are ready now!
    })

    it("send() - tokens from main to other chain", async function () {
        // ensure they're both allocated initial amounts
        expect(await baseOFT.balanceOf(owner.address)).to.equal(globalSupply)
        expect(await otherOFT.balanceOf(owner.address)).to.equal(0)

        const amount = ethers.utils.parseUnits("100", 18)
        const messageFee = ethers.utils.parseEther("0.01") // conversion to units of wei

        await baseOFT.send(
            otherChainId, // destination chainId
            owner.address, // destination address to send tokens to
            amount, // quantity of tokens to send (in units of wei)
            owner.address, // LayerZero refund address (if too much fee is sent gets refunded)
            ethers.constants.AddressZero, // future parameter
            "0x", // adapterParameters empty bytes specifies default settings
            { value: messageFee } // pass a msg.value to pay the LayerZero message fee
        )

        // verify tokens burned on source chain and minted on destination chain
        expect(await baseOFT.balanceOf(owner.address)).to.be.equal(globalSupply.sub(amount))
        expect(await otherOFT.balanceOf(owner.address)).to.be.equal(amount)
    })
})
