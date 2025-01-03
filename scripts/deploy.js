// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const { items } = require("../src/items.json")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [deployer1, deployer] = await ethers.getSigners()

  // Deploy CropTradingSystem
  const CropTradingSystem = await hre.ethers.getContractFactory("CropTradingSystem")
  const cropTradingSystem = await CropTradingSystem.deploy(deployer.address)
  await cropTradingSystem.deployed()

  console.log(cropTradingSystem.address)
  console.log(await cropTradingSystem.owner())
  console.log(deployer.address)

  console.log(`Deployed CropTradingSystem Contract at: ${cropTradingSystem.address}\n`)

  // Listing items...
  for (let i = 0; i < items.length; i++) {
    const transaction = await cropTradingSystem.connect(deployer).list(
      items[i].id,
      items[i].name,
      items[i].category,
      items[i].image,
      tokens(items[i].price),
      items[i].rating,
      items[i].stock,
      items[i].description
    )

    await transaction.wait()

    console.log(`Listed item ${items[i].id}: ${items[i].name}`)
    console.log(items[i].description)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
