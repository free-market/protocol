1. Start hardhat node, from engine/runner: pnpm exec hardhat node

2. In a separate terminal window, from engine/runner:  pnpm console --network local

3. Get the FrontDoor address:  


    fd = await deployments.get('FrontDoor')
    fd.address

4.  Create the runner instance:

     wrf = await ethers.getContractFactory('WorkflowRunner')
     wr = await wrf.attach(fd.address)


