import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import CropTradingSystem from './abis/CropTradingSystem.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [cropTradingSystem, setCropTradingSystem] = useState(null)

  const [account, setAccount] = useState(null)

  const [grains, setGrains] = useState(null)
  const [pulses, setPulses] = useState(null)
  const [vegetables, setVegetables] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    console.log(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const cropTradingSystem = new ethers.Contract(config[network.chainId].cropTradingSystem.address, CropTradingSystem, provider)
    setCropTradingSystem(cropTradingSystem)

    const items = []

    for (var i = 0; i < 18; i++) {
      const item = await cropTradingSystem.items(i + 1)
      items.push(item)
      console.log('[+] Fetched Item: ', i);
    }

    const grains = items.filter((item) => item.category === 'Grains')
    const pulses = items.filter((item) => item.category === 'Pulses')
    const vegetables = items.filter((item) => item.category === 'Vegetables')

    console.log(grains)
    console.log(pulses)
    console.log(vegetables)

    setGrains(grains)
    setPulses(pulses)
    setVegetables(vegetables)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>CTS Best Sellers</h2>

      {grains && pulses && vegetables && (
        <>
          <Section title={"Grains"} items={grains} togglePop={togglePop} />
          <Section title={"Pulses"} items={pulses} togglePop={togglePop} />
          <Section title={"Vegetables"} items={vegetables} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} cropTradingSystem={cropTradingSystem} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
