const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Global constants for listing an item...
const ID = 1
const NAME = "Chana"
const CATEGORY = "Pulses"
const IMAGE = "https://5.imimg.com/data5/QQ/AU/MY-17256771/gram-1000x1000.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5
const DESCRIPTION = "some description"

describe("CropTradingSystem", () => {
  let cropTradingSystem
  let deployer, buyer

  beforeEach(async () => {
    // Setup accounts
    [deployer, buyer] = await ethers.getSigners()

    // Deploy contract
    const CropTradingSystem = await ethers.getContractFactory("CropTradingSystem")
    cropTradingSystem = await CropTradingSystem.deploy(deployer.address)
  })

  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await cropTradingSystem.owner()).to.equal(deployer.address)
    })
  })

  describe("Listing", () => {
    let transaction

    beforeEach(async () => {
      // List a item
      transaction = await cropTradingSystem.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK, DESCRIPTION)
      await transaction.wait()
    })

    it("Returns item attributes", async () => {
      const item = await cropTradingSystem.items(ID)

      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
      expect(item.description).to.equal(DESCRIPTION)
    })

    it("Emits List event", () => {
      expect(transaction).to.emit(cropTradingSystem, "List")
    })
  })

  describe("Buying", () => {
    let transaction

    beforeEach(async () => {
      // List a item
      transaction = await cropTradingSystem.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK, DESCRIPTION)
      await transaction.wait()

      // Buy a item
      console.log(ID)
      console.log(typeof ID)
      transaction = await cropTradingSystem.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()
    })


    it("Updates buyer's order count", async () => {
      const result = await cropTradingSystem.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it("Adds the order", async () => {
      const order = await cropTradingSystem.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(cropTradingSystem.address)
      expect(result).to.equal(COST)
    })

    it("Emits Buy event", () => {
      expect(transaction).to.emit(cropTradingSystem, "Buy")
    })
  })

  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await cropTradingSystem.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK, DESCRIPTION)
      await transaction.wait()

      // Buy a item
      transaction = await cropTradingSystem.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Withdraw
      transaction = await cropTradingSystem.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(cropTradingSystem.address)
      expect(result).to.equal(0)
    })
  })
})
