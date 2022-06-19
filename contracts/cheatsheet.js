migrate --reset
FreeMarket.gasMultiplier = 10
fmp = await FreeMarket.deployed()
fmp.createUserProxy()
upa = await fmp.getProxy()
uwr = await WorkflowRunner.at(upa)


uwr.send(web3.utils.toWei('1', 'ether'))

weth = await Weth.at(WETH_ADDRESS)
usdt = await IERC20.at(USDT_ADDRESS)

12345678901234567890
10000000000000000


uwr.executeWorkflow([
  '10000000000000000',  // starting amount (of whatever input currency to first step is)
  0,                    // ethToWeth stepId
  1,                    // curve triCrypto stepId
  2,                    //   from index:  WETH
  0,                    //   to index:  USDT
  2,                    // curve 3pool stepid
  2,                    //   from index:  USDT
  1,                    //   to index: USDC
])


uwr.executeWorkflow(['10000000000000000', 0, ])
uwr.executeWorkflow(['10000000000000000', 0, 1, 2, 0, ])
uwr.executeWorkflow(['10000000000000000', 0, 1, 2, 0, 2, 2, 1])

    const tx = await uwr.executeWorkflow(['10000000000000000', 0, 1, 2, 0, 5, 0, ],  { gasLimit: 30_000_000 })
