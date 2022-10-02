import React, { useState } from 'react'
import { m } from 'framer-motion'
import { Mainnet, DAppProvider, useEthers, Config, Goerli } from '@usedapp/core'
import { getDefaultProvider } from 'ethers'

export type WorfklowStage =
  | 'collecting-evm-signature'
  | 'collected-evm-signature'
  | 'collecting-solana-signature'
  | 'collected-solana-signature'
  | 'prepared'
  | 'committing-evm'
  | 'evm-locked'
  | 'waiting-for-validator'
  | 'validator-ready'
  | 'waiting-for-relayer'
  | 'relayer-ready'
  | 'relaying'
  | 'relayed'
  | 'committing-solana'

const stagesInOrder = [
  'collecting-evm-signature',
  'collected-evm-signature',
  'collecting-solana-signature',
  'collected-solana-signature',
  'prepared',
  'committing-evm',
  'evm-locked',
  'waiting-for-validator',
  'validator-ready',
  'waiting-for-relayer',
  'relayer-ready',
  'relayed',
  'committing-solana',
]

export const ExampleWorkflow = (props: {
  showButtons: boolean
  showStageName: boolean
  initialStageNumber: number
  children: React.ReactNode
}): JSX.Element => {
  const { activateBrowserWallet, account, library } = useEthers()
  const [stageNumber, setStageNumber] = useState(props.initialStageNumber)
  const metaMaskConnected = Boolean(account)
  const withdrawingFromMangoMarkets = false
  const stage = stagesInOrder[stageNumber]
  const vaaCommitted = stageNumber >= stagesInOrder.indexOf('relayed')
  const validatorReady =
    stageNumber > stagesInOrder.indexOf('waiting-for-validator')
  const relayerReady =
    stageNumber > stagesInOrder.indexOf('waiting-for-relayer')
  const evmLocked = stageNumber >= stagesInOrder.indexOf('evm-locked')

  const signEVM = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const signer = library!.getSigner()
    const signature = await signer.signMessage('some stuff')
    setStageNumber(stageNumber + 1)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStageNumber(stageNumber + 2)
  }

  const signSolana = async () => {
    alert(
      'imagine you are using phantom wallet and signing a transaction. thank you',
    )
    setStageNumber(stageNumber + 1)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setStageNumber(stageNumber + 2)
  }

  const next = async () => {
    setStageNumber(stageNumber + 1)
  }

  const runWorkflow = next

  const enableMetaMask = activateBrowserWallet

  const committingEvmArrow = (
    <>
      <path
        fill="none"
        stroke="#000"
        strokeMiterlimit="10"
        d="M157 260v-50h176.63"
        pointerEvents="stroke"
      ></path>
      <path
        stroke="#000"
        strokeMiterlimit="10"
        d="M338.88 210l-7 3.5 1.75-3.5-1.75-3.5z"
        pointerEvents="all"
      ></path>
      <switch transform="translate(-.5 -.5)">
        <foreignObject
          width="100%"
          height="100%"
          overflow="visible"
          pointerEvents="none"
          requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
          style={{ textAlign: 'left' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'unsafe center',
              justifyContent: 'unsafe center',
              width: 1,
              height: 1,
              paddingTop: 211,
              marginLeft: 238,
            }}
          >
            <div
              style={{
                boxSizing: 'border-box',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  lineHeight: '1.2',
                  backgroundColor: 'rgb(255, 255, 255)',
                  whiteSpace: 'nowrap',
                  color: '#000',
                  display: 'inline-block',
                  fontFamily: 'Helvetica',
                  fontSize: '11',
                  pointerEvents: 'all',
                }}
              >
                COMMIT(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </div>
            </div>
          </div>
        </foreignObject>
      </switch>
      <path
        fill="#d5e8d4"
        stroke="#82b366"
        d="M240 206H280V216H240z"
        pointerEvents="all"
      ></path>
    </>
  )

  const committingSolanaArrow = (
    <>
      <path
        fill="none"
        stroke="#000"
        strokeMiterlimit="10"
        d="M157 320v100h260.5v93.63"
        pointerEvents="stroke"
      ></path>
      <path
        stroke="#000"
        strokeMiterlimit="10"
        d="M417.5 518.88l-3.5-7 3.5 1.75 3.5-1.75z"
        pointerEvents="all"
      ></path>
      <switch transform="translate(-.5 -.5)">
        <foreignObject
          width="100%"
          height="100%"
          overflow="visible"
          pointerEvents="none"
          requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
          style={{ textAlign: 'left' }}
        >
          <div
            style={{
              display: 'flex',

              alignItems: 'unsafe center',

              justifyContent: 'unsafe center',
              width: 1,
              height: 1,
              paddingTop: 420,
              marginLeft: 287,
            }}
          >
            <g
              data-drawio-colors="color: rgb(0, 0, 0); background-color: #FFFFFF;"
              style={{
                boxSizing: 'border-box',

                textAlign: 'center',
              }}
              fontSize="0"
            >
              <g
                style={{
                  lineHeight: '1.2',
                  backgroundColor: 'rgb(255, 255, 255)',
                  whiteSpace: 'nowrap',
                }}
                color="#000"
                display="inline-block"
                fontFamily="Helvetica"
                fontSize="11"
                pointerEvents="all"
              >
                COMMIT(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </g>
            </g>
          </div>
        </foreignObject>
      </switch>
    </>
  )
  const solTx = (
    <switch transform="translate(-.5 -.5)">
      <foreignObject
        width="100%"
        height="100%"
        overflow="visible"
        pointerEvents="none"
        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
        style={{ textAlign: 'left' }}
      >
        <div
          style={{
            display: 'flex',

            alignItems: 'unsafe center',

            justifyContent: 'unsafe center',
            width: 38,
            ...(stage === 'committing-solana'
              ? {
                  paddingTop: 420,
                  marginLeft: 290,
                }
              : {
                  paddingTop: 315,
                  marginLeft: 201,
                }),
            height: 1,
          }}
        >
          <g
            data-drawio-colors="color: rgb(0, 0, 0);"
            style={{
              boxSizing: 'border-box',

              textAlign: 'center',
            }}
            fontSize="0"
          >
            <g
              style={{
                lineHeight: '1.2',
                whiteSpace: 'normal',
                overflowWrap: 'normal',
              }}
              color="#000"
              display="inline-block"
              fontFamily="Helvetica"
              fontSize="12"
              pointerEvents="all"
            >
              sol-tx
            </g>
          </g>
        </div>
      </foreignObject>
    </switch>
  )

  const ethTx = (
    <switch transform="translate(-.5 -.5)">
      <foreignObject
        width="100%"
        height="100%"
        overflow="visible"
        pointerEvents="none"
        requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
        style={{ textAlign: 'left' }}
      >
        <div
          style={{
            display: 'flex',

            alignItems: 'unsafe center',

            justifyContent: 'unsafe center',
            width: 38,
            height: 1,
            ...(evmLocked
              ? {
                  paddingTop: 125,
                  marginLeft: 341,
                }
              : stage === 'committing-evm'
              ? {
                  paddingTop: 211,
                  marginLeft: 241,
                }
              : {
                  paddingTop: 265,
                  marginLeft: 201,
                }),
          }}
        >
          <g
            data-drawio-colors="color: rgb(0, 0, 0);"
            style={{
              boxSizing: 'border-box',

              textAlign: 'center',
            }}
            fontSize="0"
          >
            <g
              style={{
                lineHeight: '1.2',
                whiteSpace: 'normal',
                overflowWrap: 'normal',
              }}
              color="#000"
              display="inline-block"
              fontFamily="Helvetica"
              fontSize="12"
              pointerEvents="all"
            >
              eth-tx
            </g>
          </g>
        </div>
      </foreignObject>
    </switch>
  )

  const buttons = props.showButtons && (
    <>
      {stage === 'collecting-evm-signature' && metaMaskConnected && (
        <button onClick={signEVM}>(sign evm transaction)</button>
      )}
      {stage === 'collecting-solana-signature' && (
        <button onClick={signSolana}>(sign solana transaction)</button>
      )}
      {stage === 'prepared' && (
        <button onClick={runWorkflow}>(run workflow)</button>
      )}
      {['committing-evm'].includes(stage) && (
        <button onClick={next}>(next)</button>
      )}
      {!metaMaskConnected && (
        <button onClick={enableMetaMask}>(Connect to MetaMask)</button>
      )}
    </>
  )

  return (
    <>
      <p>Stage: {stage}</p>
      <svg
        width="851"
        height="801"
        viewBox="-0.5 -0.5 851 801"
        style={{ fontSize: '0.8rem' }}
      >
        <path
          fill="none"
          stroke="#000"
          d="M0 0H850V800H0z"
          pointerEvents="all"
        ></path>
        <path
          fill="#fff2cc"
          fillOpacity="0.5"
          stroke="#d6b656"
          d="M300 470H810V790H300z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe flex-start',

                justifyContent: 'unsafe flex-start',
                width: 482,
                height: 1,
                paddingTop: 490,
                marginLeft: 315,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'left',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Solana
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#dae8fc"
          fillOpacity="0.5"
          stroke="#6c8ebf"
          d="M320 20H830V280H320z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe flex-start',

                justifyContent: 'unsafe flex-start',
                width: 482,
                height: 1,
                paddingTop: 40,
                marginLeft: 335,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'left',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Ethereum
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#ffe6cc"
          fillOpacity="0.5"
          stroke="#d79b00"
          d="M510 180H840V610H510z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe flex-start',

                justifyContent: 'unsafe flex-start',
                width: 302,
                height: 1,
                paddingTop: 200,
                marginLeft: 525,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'left',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Wormhole
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M340 180H470V240H340z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 128,
                height: 1,
                paddingTop: 210,
                marginLeft: 341,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  FreeMarket contract
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M67 260H187V320H67z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 290,
                marginLeft: 68,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  FreeMarket SDK
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M615 200H735V260H615z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 230,
                marginLeft: 616,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Wormhole bridge contract
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M530 340H650V400H530z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 370,
                marginLeft: 531,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Wormhole validator
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M680 60H800V120H680z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 90,
                marginLeft: 681,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Curve
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M17 120H157V180H17z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 138,
                height: 1,
                paddingTop: 150,
                marginLeft: 18,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  User Ethereum Wallet
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M17 390H137V450H17z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 420,
                marginLeft: 18,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  User Solana Wallet
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M700 340H820V400H700z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 370,
                marginLeft: 701,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Wormhole relayer
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M590 520H710V580H590z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 550,
                marginLeft: 591,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Wormhole bridge contract
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M350 520H485V580H350z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 133,
                height: 1,
                paddingTop: 550,
                marginLeft: 351,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  FreeMarket contract
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M640 700H760V760H640z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 730,
                marginLeft: 641,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Mango Markets
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M495 700H615V760H495z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 118,
                height: 1,
                paddingTop: 730,
                marginLeft: 496,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  Marinade Finance
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M510 60H640V120H510z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 128,
                height: 1,
                paddingTop: 90,
                marginLeft: 511,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  User Wallet Balance
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        <path
          fill="#FFF"
          stroke="#000"
          d="M340 700H470V760H340z"
          pointerEvents="all"
        ></path>
        <switch transform="translate(-.5 -.5)">
          <foreignObject
            width="100%"
            height="100%"
            overflow="visible"
            pointerEvents="none"
            requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',

                alignItems: 'unsafe center',

                justifyContent: 'unsafe center',
                width: 128,
                height: 1,
                paddingTop: 730,
                marginLeft: 341,
              }}
            >
              <g
                data-drawio-colors="color: rgb(0, 0, 0);"
                style={{
                  boxSizing: 'border-box',

                  textAlign: 'center',
                }}
                fontSize="0"
              >
                <g
                  style={{
                    lineHeight: '1.2',
                    whiteSpace: 'normal',
                    overflowWrap: 'normal',
                  }}
                  color="#000"
                  display="inline-block"
                  fontFamily="Helvetica"
                  fontSize="12"
                  pointerEvents="all"
                >
                  User Wallet Balance
                </g>
              </g>
            </div>
          </foreignObject>
        </switch>
        {['collecting-evm-signature', 'collected-evm-signature'].includes(
          stage,
        ) && (
          <>
            <path
              fill="none"
              stroke="#000"
              strokeMiterlimit="10"
              d="M97 260l-9.21-73.68"
              pointerEvents="stroke"
            ></path>
            <path
              stroke="#000"
              strokeMiterlimit="10"
              d="M87.14 181.11l4.34 6.51-3.69-1.3-3.26 2.17z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 1,
                    height: 1,
                    paddingTop: 220,
                    marginLeft: 92,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        backgroundColor: 'rgb(255, 255, 255)',
                        whiteSpace: 'nowrap',
                      }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="11"
                      pointerEvents="all"
                    >
                      SIGN
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {['collecting-solana-signature', 'collected-solana-signature'].includes(
          stage,
        ) && (
          <>
            <path
              fill="none"
              stroke="#000"
              strokeMiterlimit="10"
              d="M97 320l-18.25 63.88"
              pointerEvents="stroke"
            ></path>
            <path
              stroke="#000"
              strokeMiterlimit="10"
              d="M77.31 388.93l-1.45-7.7 2.89 2.65 3.85-.72z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 1,
                    height: 1,
                    paddingTop: 354,
                    marginLeft: 89,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        backgroundColor: 'rgb(255, 255, 255)',
                        whiteSpace: 'nowrap',
                      }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="11"
                      pointerEvents="all"
                    >
                      SIGN
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {evmLocked && (
          <>
            <path
              fill="#1ba1e2"
              stroke="#006eaf"
              d="M740 200H820V210H740z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 78,
                    height: 1,
                    paddingTop: 205,
                    marginLeft: 741,
                  }}
                >
                  <g
                    data-drawio-colors="color: #ffffff;"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        whiteSpace: 'normal',
                        overflowWrap: 'normal',
                        color: 'white',
                      }}
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      USDC: 1000
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {evmLocked && (
          <>
            <path
              fill="#d5e8d4"
              stroke="#82b366"
              d="M340 120H380V130H340z"
              pointerEvents="all"
            ></path>
            <path
              fill="none"
              d="M377.5 110H457.5V140H377.5z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 1,
                    height: 1,
                    paddingTop: 125,
                    marginLeft: 418,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{ lineHeight: '1.2', whiteSpace: 'nowrap' }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      (committed)
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {validatorReady && (
          <>
            <path
              fill="#f8cecc"
              stroke="#b85450"
              d="M530 410H570V420H530z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 38,
                    height: 1,
                    paddingTop: 415,
                    marginLeft: 531,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        whiteSpace: 'normal',
                        overflowWrap: 'normal',
                      }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      vaa-tx
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {vaaCommitted && (
          <>
            <path
              fill="#f8cecc"
              stroke="#b85450"
              d="M530 490H570V500H530z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 38,
                    height: 1,
                    paddingTop: 495,
                    marginLeft: 531,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        whiteSpace: 'normal',
                        overflowWrap: 'normal',
                      }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      vaa-tx
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 1,
                    height: 1,
                    paddingTop: 495,
                    marginLeft: 605,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{ lineHeight: '1.2', whiteSpace: 'nowrap' }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      (committed)
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {withdrawingFromMangoMarkets && (
          <>
            <path
              fill="#1ba1e2"
              stroke="#006eaf"
              d="M640 770H740V780H640z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 98,
                    height: 1,
                    paddingTop: 775,
                    marginLeft: 641,
                  }}
                >
                  <g
                    data-drawio-colors="color: #ffffff;"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        whiteSpace: 'normal',
                        overflowWrap: 'normal',
                        color: 'white',
                      }}
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      SOL: 28
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {withdrawingFromMangoMarkets && (
          <>
            <path
              fill="none"
              stroke="#000"
              strokeMiterlimit="10"
              d="M451.25 580l213.17 116.94"
              pointerEvents="stroke"
            ></path>
            <path
              stroke="#000"
              strokeMiterlimit="10"
              d="M669.02 699.46l-7.82-.3 3.22-2.22.15-3.91z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 1,
                    height: 1,
                    paddingTop: 651,
                    marginLeft: 572,
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        backgroundColor: 'rgb(255, 255, 255)',
                        whiteSpace: 'nowrap',
                      }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="11"
                      pointerEvents="all"
                    >
                      WITHDRAW
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {withdrawingFromMangoMarkets && (
          <>
            <path
              fill="#1ba1e2"
              stroke="#006eaf"
              d="M340 770H440V780H340z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    display: 'flex',

                    alignItems: 'unsafe center',

                    justifyContent: 'unsafe center',
                    width: 98,
                    height: 1,
                    paddingTop: 775,
                    marginLeft: 341,
                  }}
                >
                  <g
                    data-drawio-colors="color: #ffffff;"
                    style={{
                      boxSizing: 'border-box',

                      textAlign: 'center',
                    }}
                    fontSize="0"
                  >
                    <g
                      style={{
                        lineHeight: '1.2',
                        whiteSpace: 'normal',
                        overflowWrap: 'normal',
                        color: 'white',
                      }}
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="12"
                      pointerEvents="all"
                    >
                      mSOL: 28
                    </g>
                  </g>
                </div>
              </foreignObject>
            </switch>
          </>
        )}
        {stage === 'waiting-for-validator' && (
          <>
            <path
              fill="none"
              stroke="#000"
              strokeMiterlimit="10"
              d="M590 340v-40h85v-33.63"
              pointerEvents="stroke"
            ></path>
            <path
              stroke="#000"
              strokeMiterlimit="10"
              d="M675 261.12l3.5 7-3.5-1.75-3.5 1.75z"
              pointerEvents="all"
            ></path>
            <switch transform="translate(-.5 -.5)">
              <foreignObject
                width="100%"
                height="100%"
                overflow="visible"
                pointerEvents="none"
                requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                style={{ textAlign: 'left' }}
              >
                <div
                  style={{
                    alignItems: 'unsafe center',
                    justifyContent: 'unsafe center',
                    width: 1,
                    height: 1,
                    paddingTop: 300,
                    marginLeft: 633,
                    display: 'flex',
                  }}
                >
                  <g
                    data-drawio-colors="color: rgb(0, 0, 0);"
                    style={{
                      boxSizing: 'border-box',
                      textAlign: 'center',
                    }}
                  >
                    <g
                      style={{ lineHeight: '1.2', whiteSpace: 'nowrap' }}
                      color="#000"
                      display="inline-block"
                      fontFamily="Helvetica"
                      fontSize="11"
                      pointerEvents="all"
                    >
                      <span style={{ backgroundColor: 'white' }}>WATCH</span>
                    </g>
                  </g>
                </div>
              </foreignObject>
              <text
                x="633"
                y="303"
                fontFamily="Helvetica"
                fontSize="11"
                textAnchor="middle"
              >
                WATCH
              </text>
            </switch>
          </>
        )}
        {stage === 'committing-evm' && committingEvmArrow}
        {stage === 'committing-solana' && committingSolanaArrow}
        {stage === 'committing-solana' ? (
          <path
            fill="#d5e8d4"
            stroke="#82b366"
            d="M289 415H329V425H289z"
            pointerEvents="all"
          ></path>
        ) : (
          ![
            'collecting-evm-signature',
            'collecting-solana-signature',
            'collected-evm-signature',
          ].includes(stage) && (
            <path
              fill="#d5e8d4"
              stroke="#82b366"
              d="M200 310H240V320H200z"
              pointerEvents="all"
            ></path>
          )
        )}
        {!['committing-evm', 'collecting-evm-signature'].includes(stage) &&
          !evmLocked && (
            <path
              fill="#d5e8d4"
              stroke="#82b366"
              d="M200 260H240V270H200z"
              pointerEvents="all"
            ></path>
          )}
        {![
          'collecting-evm-signature',
          'collected-evm-signature',
          'collecting-solana-signature',
        ].includes(stage) && solTx}
        {stage !== 'collecting-evm-signature' && ethTx}
      </svg>
      {buttons}
      {props.children}
    </>
  )
}
