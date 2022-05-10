import * as React from 'react'
import cx from 'classnames'
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  useAnimation
} from 'framer-motion'
import { PlusIcon, XIcon, ChevronDownIcon } from '@heroicons/react/outline'
import { PencilIcon } from '@heroicons/react/solid'
import produce from 'immer'
import { Form, Field } from 'react-final-form'

const StageIndicator = ({
  stage /*: 'forecast' | 'deposit' | 'harvest' */
}) => {
  const line = (
    <motion.div
      className='absolute left-0 right-0 bottom-0 -bottom-1 mx-auto w-5 rounded border-t-2 border-stone-700'
      layout
      layoutId='stage-indicator'
    />
  )
  return (
    <div className='w-full text-stone-500'>
      <span
        className={cx('inline-block relative transition-all transition-1000', {
          'text-stone-700': stage === 'forecast'
        })}
      >
        {stage === 'forecast' && line}
        Forecast
      </span>{' '}
      &rarr;{' '}
      <span
        className={cx('inline-block relative transition-all transition-1000', {
          'text-stone-700': stage === 'deposit'
        })}
      >
        Deposit
        {stage === 'deposit' && line}
      </span>
      <span /> &rarr;{' '}
      <span
        className={cx('inline-block relative transition-all transition-1000', {
          'text-stone-700': stage === 'harvest'
        })}
      >
        Harvest
        {stage === 'harvest' && line}
      </span>
      <span />
    </div>
  )
}

const item = {
  visible: { opacity: 1, y: 0 },
  arriving: { opacity: 0, y: 10, transition: { duration: 0.1 } },
  departed: { opacity: 0, y: -10, transition: { duration: 0.1, stiffness: 0 } }
}

const card = {
  visible: {
    opacity: 1
  },
  departed: {
    opacity: 0,
    transition: {
      when: 'afterChildren'
    }
  }
}

const Card = (props) => {
  const className = cx(
    'rounded-2xl lg:max-w-lg border border-stone-400 text-stone-200 overflow-hidden relative',
    {
      'hover:border-stone-500 hover:text-stone-500 hover:bg-stone-100/75':
        props.clickable ?? false,
      'mt-5': props.stepCount > 0
    }
  )
  return (
    <motion.div
      layout
      onClick={props.onClick ?? (() => {})}
      variants={card}
      animate='visible'
      exit='departed'
      className={className}
    >
      <AnimatePresence initial={false} exitBeforeEnter>
        {props.children}
      </AnimatePresence>
    </motion.div>
  )
}

const NewStepButton = (props) => {
  const { stepCount = 0, stage } = props
  return (
    <Card
      key={`${stage}-final-step`}
      clickable
      onClick={props.onClick}
      stepCount={stepCount}
    >
      <motion.div
        key={`${stage}-plus-button`}
        layout
        layoutId={`${stage}-plus-button`}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.1, duration: 0.1 }}
        className='flex flex-col justify-center items-center text-stone-400 hover:text-stone-500 cursor-pointer py-4 gap-2 lg:max-w-lg mx-auto active:border-stone-600 active:text-stone-600 active:bg-stone-50 min-h-[6rem]'
      >
        <motion.div
          layout
          variants={item}
          initial='arriving'
          exit='departed'
          animate='visible'
          className='inline-block h-16 w-16 mx-auto flex items-center justify-center'
        >
          <PlusIcon className='h-12 w-12' strokeWidth={1} />
        </motion.div>
      </motion.div>
    </Card>
  )
}

const usdcAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='USDC'
          srcSet='https://res.cloudinary.com/sushi-cdn/image/fetch/w_32,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg 1x, https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg 2x'
          src='https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>USDC</div>
  </div>
)

const snusdcAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='USDC'
          srcSet='https://res.cloudinary.com/sushi-cdn/image/fetch/w_32,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg 1x, https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg 2x'
          src='https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>SN-USDC</div>
  </div>
)

const curveAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='3CRV'
          src='https://curve.fi/logo.png'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>3CRV</div>
  </div>
)

const portalAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='PW-USDC'
          src='https://cdn.githubraw.com/certusone/wormhole/dev.v2/explorer/static/logo-gradient.png'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>PW-USDC</div>
  </div>
)

const pw3crvAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='PW-3CRV'
          src='https://cdn.githubraw.com/certusone/wormhole/dev.v2/explorer/static/logo-gradient.png'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>PW-3CRV</div>
  </div>
)

const convexAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='CVXCRV'
          src='https://miro.medium.com/fit/c/176/176/1*nX_bXiLksV94D1ANXXs-tg.jpeg'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>CVXCRV</div>
  </div>
)

const pwcvxcrvAssetPill = (
  <div className='inline-block bg-stone-400/25 flex items-center gap-2 px-2 py-1 rounded-full text-high-emphesis'>
    <div className='rounded-full' style={{ width: 20, height: 20 }}>
      <div
        className='overflow-hidden rounded'
        style={{ width: 20, height: 20 }}
      >
        <img
          alt='PW-CVXCRV'
          src='https://cdn.githubraw.com/certusone/wormhole/dev.v2/explorer/static/logo-gradient.png'
          decoding='async'
          data-nimg='fixed'
          className='rounded-full !rounded-full overflow-hidden'
        />
      </div>
    </div>
    <div className='text-stone-200 text-sm leading-5 font-bold'>PW-CVXCRV</div>
  </div>
)

const pillTable = {
  USDC: usdcAssetPill,
  'SN-USDC': snusdcAssetPill,
  '3CRV': curveAssetPill,
  'PW-USDC': portalAssetPill,
  'PW-3CRV': pw3crvAssetPill,
  CVXCRV: convexAssetPill,
  'PW-CVXCRV': pwcvxcrvAssetPill
}

const RouteChoice = ({
  route,
  index,
  steps,
  harvestSteps,
  onNewStep,
  stage
}) => {
  const controls = useAnimation()
  return (
    <>
      {index > 0 && (
        <div className='py-6'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.3 + (index - 1) * 0.2 }
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: { delay: 0.2 + (index - 1) * 0.2 },
              stiffness: 0
            }}
            className='w-full relative px-4'
          >
            <div className='border-t border-stone-400 w-full' />
            <div className='absolute top-0 left-0 right-0 z-10'>
              <div className='mx-auto w-10 flex justify-center -mt-3 bg-stone-100 top-0 z-10 text-stone-400'>
                or
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className='flex justify-center'>
        <motion.div
          layout
          layoutId={`${stage}-step-${
            { stake: steps, harvest: harvestSteps }[stage].length
          }-${route.name}`}
          onClick={async () => {
            await controls.start({
              opacity: 0,
              transition: { duration: 0.1 }
            })

            onNewStep(route.name)
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: index > 0 ? 0.2 + index * 0.2 : 0.2 }
          }}
          exit={{
            opacity: 0,
            y: -10,
            transition: {
              delay: index > 0 ? 0.2 + (index - 1) * 0.2 : 0.1,
              stiffness: 0
            }
          }}
          className='rounded-2xl bg-stone-600 shadow cursor-pointer hover:bg-stone-500 active:bg-stone-600/75'
        >
          <motion.div animate={controls} className='px-4 py-3'>
            <motion.div className='pb-3 font-medium text-sm'>
              {route.action}
            </motion.div>
            <motion.div className='flex items-center'>
              {pillTable[route.before]}
              &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;{' '}
              {pillTable[route.after]}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

const usdcOfferings = {
  possibleStakingRoutes: ['usdcTo3crv', 'usdcToPortal'],
  rewards: []
}

const routesByName = {
  usdcTo3crv: {
    name: 'usdcTo3crv',
    before: 'USDC',
    after: '3CRV',
    action: 'Acquire Curve LP',
    possibleStakingRoutes: ['3crvToPortal', '3crvToCvxcrv'],
    rewards: ['3crvToUsdc']
  },
  '3crvToCvxcrv': {
    name: '3crvToCvxcrv',
    before: '3CRV',
    after: 'CVXCRV',
    action: 'Acquire Convex LP',
    possibleStakingRoutes: ['cvxcrvToPortal'],
    rewards: ['3crvToUsdc', 'cvxcrvToUsdc']
  },
  '3crvToPortal': {
    name: '3crvToPortal',
    before: '3CRV',
    after: 'PW-3CRV',
    action: 'Bridge with Wormhole Portal',
    possibleStakingRoutes: ['pw3crvToSolend', 'pw3crvTo3crv'],
    rewards: []
  },
  cvxcrvToPortal: {
    name: 'cvxcrvToPortal',
    before: 'CVXCRV',
    after: 'PW-CVXCRV',
    action: 'Bridge with Wormhole Portal',
    possibleStakingRoutes: ['pwcvxcrvToSolend'],
    rewards: []
  },
  pw3crvToSolend: {
    name: 'pw3crvToSolend',
    before: 'PW-3CRV',
    after: 'PW-3CRV',
    action: 'Lend with Solend',
    possibleStakingRoutes: [],
    rewards: ['pw3crvTo3crv']
  },
  pwcvxcrvToSolend: {
    name: 'pwcvxcrvToSolend',
    before: 'PW-CVXCRV',
    after: 'PW-CVXCRV',
    action: 'Lend with Solend',
    possibleStakingRoutes: [],
    rewards: ['pwcvxcrvToCvxcrv']
  },
  pw3crvTo3crv: {
    name: 'pw3crvTo3crv',
    before: 'PW-3CRV',
    after: '3CRV',
    action: 'Bridge with Wormhole Portal',
    possibleStakingRoutes: [],
    rewards: ['3crvToUsdc']
  },
  pwcvxcrvToCvxcrv: {
    name: 'pwcvxcrvToCvxcrv',
    before: 'PW-CVXCRV',
    after: 'CVXCRV',
    action: 'Bridge with Wormhole Portal',
    possibleStakingRoutes: [],
    rewards: ['cvxcrvToUsdc']
  },
  cvxcrvToUsdc: {
    name: 'cvxcrvToUsdc',
    before: 'CVXCRV',
    after: 'USDC',
    action: 'Swap with Uniswap',
    possibleStakingRoutes: [],
    rewards: []
  },
  usdcToPortal: {
    name: 'usdcToPortal',
    before: 'USDC',
    after: 'PW-USDC',
    action: 'Bridge with Wormhole Portal',
    possibleStakingRoutes: ['pwusdcToSnusdc'],
    rewards: []
  },
  portalToUsdc: {
    name: 'portalToUsdc',
    before: 'PW-USDC',
    after: 'USDC',
    action: 'Bridge with Wormhole Portal',
    possibleStakingRoutes: [],
    rewards: []
  },
  pwusdcToSnusdc: {
    name: 'pwusdcToSnusdc',
    before: 'PW-USDC',
    after: 'SN-USDC',
    action: 'Swap with Saber',
    possibleStakingRoutes: ['snusdcToSolend'],
    rewards: []
  },
  snusdcToPwusdc: {
    name: 'snusdcToPwusdc',
    before: 'SN-USDC',
    after: 'PW-USDC',
    action: 'Swap with Saber',
    possibleStakingRoutes: [],
    rewards: ['portalToUsdc']
  },
  snusdcToSolend: {
    name: 'snusdcToSolend',
    before: 'SN-USDC',
    after: 'SN-USDC',
    action: 'Lend with Solend',
    possibleStakingRoutes: [],
    rewards: ['snusdcToPwusdc']
  },
  '3crvToUsdc': {
    name: '3crvToUsdc',
    before: '3CRV',
    after: 'USDC',
    action: 'Withdraw with Curve',
    rewards: []
  }
}

const getCurrentRoutes = ({ steps, harvestSteps }) => ({
  stake: steps.reduce(
    (possibleRoutes, step) => routesByName[step.id].possibleStakingRoutes,
    usdcOfferings.possibleStakingRoutes
  ),
  harvest: [...harvestSteps, ...steps].reduce(
    (possibleRoutes, step) => [
      ...new Set([
        ...routesByName[step.id].rewards,
        ...possibleRoutes
      ]).values()
    ],
    usdcOfferings.rewards
  )
})

const StepCreator = (props) => {
  const { steps, harvestSteps, stage } = props

  const currentRouteNames = getCurrentRoutes({ steps, harvestSteps })[
    stage
  ].filter((step) => !harvestSteps.some(({ id }) => id === step))
  const choices = currentRouteNames.map((routeName, index) => {
    const route = routesByName[routeName]

    if (route == null) {
      throw new Error(`${routeName} not defined`)
    }

    return (
      <RouteChoice
        stage={stage}
        route={route}
        index={index}
        key={index}
        steps={steps}
        harvestSteps={harvestSteps}
        onNewStep={props.onNewStep}
      />
    )
  })

  return (
    <Card key={`${stage}-final-step`} stepCount={steps.length}>
      <motion.div
        className='min-h-[6rem]'
        layout
        initial={{ height: 0 }}
        animate={{ height: 'auto' }}
        exit={{ height: 0, transition: { delay: 0.5 } }}
        transition={{ stiffness: 0, duration: 0.25, when: 'beforeChildren' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.5 }}
          animate={{ opacity: 1, transition: { delay: 0.1 }, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          key='step-close-button'
          layoutId={`${stage}-step-close-button`}
          className='absolute top-0 left-0 rounded-br-2xl border-b border-r border-stone-400 text-stone-400 cursor-pointer hover:bg-stone-300/25 active:bg-stone-400/25'
          onClick={props.onClose}
        >
          <div className='px-4'>close</div>
        </motion.div>
        <motion.div className='py-6'>{choices}</motion.div>
      </motion.div>
    </Card>
  )
}

export const Steps = ({ steps, harvestSteps, dispatch, stage, amount }) => {
  const [creatingNewStep, setCreatingNewStep] = React.useState(false)

  const stepCreator = StepCreator({
    stage,
    steps,
    harvestSteps,
    onClose: () => {
      setCreatingNewStep(false)
    },
    onNewStep: async (id) => {
      setCreatingNewStep(false)
      dispatch({ name: 'StepCreated', step: { id } })
      await new Promise((resolve) => {
        setTimeout(resolve, 300)
      })
      dispatch({ name: 'StepAnimated', step: { id } })
    }
  })

  const startCreatingNewStepButton = NewStepButton({
    stage,
    stepCount: { stake: steps, harvest: harvestSteps }[stage].length,
    onClick: () => {
      if (steps.every((step) => !step.fresh)) {
        setCreatingNewStep(true)
      }
    }
  })

  const stepCards = { stake: steps, harvest: harvestSteps }[stage].map(
    (step, index) => (
      <StepCard
        amount={amount}
        key={index}
        index={index}
        step={step}
        steps={steps}
        harvestSteps={harvestSteps}
        dispatch={dispatch}
        stage={stage}
      />
    )
  )

  const lastStep = {
    stake: steps[steps.length - 1],
    harvest: harvestSteps[harvestSteps.length - 1]
  }[stage]

  const possibleRoutes = {
    stake: lastStep && routesByName[lastStep.id].possibleStakingRoutes,
    harvest: [
      ...(lastStep ? routesByName[lastStep.id].rewards : []),
      ...getCurrentRoutes({ steps, harvestSteps }).harvest
    ].filter((step) => !harvestSteps.some(({ id }) => id === step))
  }[stage]

  return (
    <LayoutGroup>
      {stepCards.length > 0 && <div>{stepCards}</div>}

      <AnimatePresence initial={false} exitBeforeEnter>
        {creatingNewStep
          ? stepCreator
          : lastStep
            ? possibleRoutes.length > 0 && startCreatingNewStepButton
            : startCreatingNewStepButton}
      </AnimatePresence>
    </LayoutGroup>
  )
}

const StepCard = (props) => {
  const [showDescription, setShowDescription] = React.useState(false)
  const { index, step, dispatch, stage, amount } = props

  const baseDelay = {
    stake: 0,
    harvest: 0.25
  }[stage]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseDelay + index * 0.1 }}
        className='flex items-start group'
      >
        <motion.div
          onClick={() => {
            if (!step.fresh) {
              setShowDescription((b) => !b)
            }
          }}
          layout
          layoutId={`${stage}-step-${index}-${step.id}`}
          className={cx(
            'relative mr-16 inline-block lg:max-w-lg w-full bg-stone-600 shadow cursor-pointer hover:bg-stone-500 active:bg-stone-600/75 text-stone-200',
            {
              '!transform-none': !step.fresh,
              'border-t border-stone-500': index > 0,
              'rounded-t-2xl': index === 0,
              'rounded-b-2xl':
                index ===
                { stake: props.steps, harvest: props.harvestSteps }[stage]
                  .length -
                  1
            }
          )}
        >
          <motion.div
            layout={false}
            className={cx(
              'transition-opacity px-4 py-2 flex flex-col md:flex-row justify-between items-center opacity-0 space-y-2 md:space-y-0',
              step.fresh ? 'opacity-0' : 'opacity-100'
            )}
          >
            <motion.div className='text-sm font-medium self-start md:self-center'>
              {routesByName[step.id].action}
            </motion.div>
            <motion.div className='flex items-center text-stone-400 font-medium font-monospace self-end md:self-center'>
              {stage === 'stake' && <span className='mr-3'>{amount}</span>}
              {stage === 'harvest' && (
                <>
                  {pillTable[routesByName[step.id].before]}
                  &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;{' '}
                </>
              )}
              {pillTable[routesByName[step.id].after]}
              <ChevronDownIcon className='ml-4 text-stone-300 h-6 w-6' />
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {showDescription && (
              <motion.div className='lg:max-w-lg overflow-hidden w-full mx-auto px-4 text-stone-300 flex'>
                <p className='pb-3 flex-grow'>
                  Nisi deserunt dolorem aut aliquid. Ipsam et est vero quo ut
                  dicta. Quibusdam accusamus omnis ut. Ullam nostrum nobis quos
                  ducimus voluptatem itaque. Dolorem alias qui accusantium
                  dolores.
                </p>
                <div class='w-6'>
                  <XIcon className='ml-4 text-stone-300 h-6 w-6 invisible' />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className='absolute right-0 -mr-16 top-0 invisible group-hover:visible cursor-pointer text-stone-400 hover:text-stone-500'
            onClick={(event) => {
              event.preventDefault()
              dispatch({ name: 'StepRemoved', step: { id: step.id } })
            }}
          >
            <XIcon className='m-3 h-8 h-8' />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const stepsReducer = produce((steps, action) => {
  switch (action.name) {
    case 'StepCreated':
      steps.push({ ...action.step, fresh: true })
      break
    case 'StepAnimated': {
      const step = steps.find(({ id }) => action.step.id === id)
      step.fresh = false
      break
    }
    case 'StepRemoved': {
      const index = steps.findIndex(({ id }) => action.step.id === id)
      steps.splice(index)
      break
    }
    default:
      break
  }
})

export const WorkflowForm = ({
  generated,
  onSubmit,
  amount,
  steps,
  harvestSteps,
  onUndoForecast
}) => {
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ amount, steps, harvestSteps }} // {id: 'usdcTo3crv', fresh: false}] }}
      render={({ handleSubmit, submitting, form }) => {
        const amount = form.getFieldState('amount')?.value
        const empty = amount == null || Number(amount) === 0
        const usdEstimate =
          empty || isNaN(parseFloat(amount))
            ? '0.00'
            : parseFloat(amount).toFixed(2)

        const handleFormClick = () => {
          if (generated) {
            onUndoForecast()
          }
        }

        const feeBreakdown = generated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            exit={{ opacity: 0, y: -20 }}
            className='text-stone-500/75 py-3 space-y-1'
          >
            <div className='px-4 md:px-2 flex justify-between'>
              <span>Subtotal</span>
              <span>{amount}</span>
            </div>
            <div className='px-4 md:px-2 flex justify-between'>
              <span>Fee (2%)</span>
              <span>{amount * 0.02}</span>
            </div>
            <div className='px-4 md:px-2 flex justify-between !mt-3 text-stone-700/75'>
              <span className='text-lg'>Total</span>
              <span>{Number(amount) + amount * 0.02}</span>
            </div>

            <div className='px-4 md:px-2'>
              <motion.button
                disabled
                className={cx(
                  'w-full text-stone-200 font-bold bg-sky-600 rounded-2xl p-3 text-xl active:bg-sky-700 flex justify-center items-center overflow-hidden !mt-5',
                  {
                    'cursor-not-allowed': submitting || empty,
                    'opacity-50': true
                  }
                )}
              >
                <div className='h-8'>
                  <div
                    className='transition-all h-8'
                    style={{
                      marginTop: 2,
                      height: 'max-content'
                    }}
                  >
                    <div className='flex items-center'>Deposit</div>
                  </div>
                  <div className='transition-all h-8 mt-12'>
                    <span
                      className='border-2 border-transparent animate-spin inline-block w-8 h-8 border-4 rounded-full'
                      style={{ borderLeftColor: 'rgb(231 229 228)' }}
                    />
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )

        const amountForm = (
          <form
            onClick={handleFormClick}
            onSubmit={handleSubmit}
            className={cx(
              'lg:max-w-lg mx-auto self-start flex flex-col gap-3 p-2 md:p-4 rounded-2xl bg-stone-600 shadow transition-opacity transition-200 group',
              {
                'opacity-75': submitting,
                'hover:bg-stone-500 cursor-pointer': generated
              }
            )}
          >
            <div className='flex flex-col gap-2 md:gap-4'>
              <div className='rounded-2xl flex flex-col gap-4'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center'>{usdcAssetPill}</div>
                  <div>
                    <PencilIcon
                      className={cx('h-8 w-8 invisible text-stone-400/50', {
                        ' group-hover:visible': generated
                      })}
                    />
                  </div>
                </div>
                <Field
                  name='amount'
                  render={({ input }) => (
                    <div className='flex gap-1 justify-between items-baseline'>
                      <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-baseline flex-grow gap-3 overflow-hidden'>
                        <input
                          disabled={submitting || generated}
                          inputMode='decimal'
                          step='0.0001'
                          title='Token Amount'
                          autoComplete='off'
                          autoCorrect='off'
                          type='text'
                          pattern='^\d*(\.\d{0,2})?$'
                          placeholder='0.00'
                          min='0'
                          minLength='1'
                          maxLength='79'
                          spellCheck={false}
                          className={cx(
                            'max-w-md relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 mr-10',
                            generated
                              ? 'cursor-pointer'
                              : 'hover:bg-stone-500/50'
                          )}
                          {...input}
                          onBlur={(event) => {
                            const value = parseFloat(event.target.value)
                            if (!isNaN(value)) {
                              form.change('amount', value.toFixed(2))
                            }
                            input.onBlur(event)
                          }}
                        />
                        <span className='text-xs leading-4 font-medium text-stone-400 absolute bottom-4 pointer-events-none text-right w-full'>
                          ~${usdEstimate}{' '}
                        </span>
                        <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex flex-row items-baseline'>
                          <span className='opacity-0 absolute pointer-events-none tracking-[0]'>
                            0.00
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              {generated && <div className='-mb-5 lg:-mb-8' />}

              <div
                className={cx('overflow-hidden w-full', {
                  '-mt-2 md:-mt-4': generated && !submitting
                })}
              >
                <AnimatePresence initial={false}>
                  {!generated && (
                    <motion.button
                      layout
                      initial={{ marginTop: -50, scale: 1 }}
                      animate={{
                        marginTop: 0,
                        scale: 1,
                        transition: { duration: 0.1 }
                      }}
                      exit={{ marginTop: -50, scale: 0 }}
                      transition={{ stiffness: 100 }}
                      disabled={submitting || empty}
                      className={cx(
                        'w-full text-stone-200 font-bold bg-sky-600 rounded-2xl p-3 text-xl active:bg-sky-700 flex justify-center items-center overflow-hidden',
                        {
                          'cursor-not-allowed': submitting || empty,
                          'opacity-50': empty
                        }
                      )}
                    >
                      <div className='h-8'>
                        <div
                          className='transition-all h-8'
                          style={{
                            marginTop: submitting ? -77 : 2,
                            height: 'max-content'
                          }}
                        >
                          <div className='flex items-center'>Forecast</div>
                        </div>
                        <div className='transition-all h-8 mt-12'>
                          <span
                            className='border-2 border-transparent animate-spin inline-block w-8 h-8 border-4 rounded-full'
                            style={{ borderLeftColor: 'rgb(231 229 228)' }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/*
                <button className="text-stone-400 hover:bg-gradient-to-b hover:from-black/20 focus:to-black/20 focus:bg-gradient-to-b focus:from-black/20 hover:to-black/20 active:bg-gradient-to-b active:from-black/40 active:to-black/40 disabled:pointer-events-none disabled:opacity-40 bg-blue border-blue rounded px-4 h-[52px] w-full font-bold flex items-center justify-center gap-1 rounded-2xl md:rounded !border-none">Connect to a wallet</button>
          */}
            </div>
          </form>
        )

        const stepsEl = (
          <motion.div
            key='steps'
            className=''
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className='mb-1 font-medium text-stone-600/75'>
              Stake Workflow
            </div>
            <Steps
              amount={amount}
              key='stake'
              stage='stake'
              steps={form.getState().values.steps}
              harvestSteps={form.getState().values.harvestSteps}
              dispatch={(action) => {
                const { steps } = form.getState().values
                form.change('steps', stepsReducer(steps, action))
              }}
            />

            {getCurrentRoutes({
              steps: form.getState().values.steps,
              harvestSteps: form.getState().values.harvestSteps
            }).harvest.length > 0 && (
              <>
                <motion.div
                  layout
                  className='mb-1 mt-5 font-medium text-stone-600/75'
                >
                  Harvest Workflow
                </motion.div>
                <Steps
                  amount={amount}
                  key='harvest'
                  stage='harvest'
                  steps={form.getState().values.steps}
                  harvestSteps={form.getState().values.harvestSteps}
                  dispatch={(action) => {
                    const { harvestSteps } = form.getState().values
                    form.change(
                      'harvestSteps',
                      stepsReducer(harvestSteps, action)
                    )
                  }}
                />
              </>
            )}
          </motion.div>
        )

        const startingPoint = (
          <motion.div
            key='start'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
          <div
            className='h-full p-2 md:p-4 border-l-2 border-stone-600 space-y-5 text-stone-600 font-medium'
          >
            <p className='max-w-lg'>
              Welcome to the app! Please enter an amount to get started.
            </p>
            <p className='max-w-lg'>
              Aliquid consequatur libero ut aspernatur cumque rem vero. Et et
              nihil sunt dolore sapiente aut corporis voluptatem. Inventore ut
              tenetur non illum eveniet odit rerum ad. Tenetur laborum cum
              voluptatibus qui molestias. Sit debitis est et magni in.
            </p>
          </div>
          </motion.div>
        )

        return (
          <>
            <div className='space-y-12'>
              <div className='flex space-x-10 items-center'>
                <svg
                  className='w-10 h-10 text-stone-600'
                  viewBox='0 0 750 1200'
                >
                  <g id='layer1' transform='translate(0,147.63784)'>
                    <path
                      style={{
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 220,
                        strokeLinecap: 'butt',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4
                      }}
                      d='M 118.93994,944.93135 C 408.3018,941.88962 361.81792,708.72632 359.17669,454.84232'
                      id='path4467'
                    />
                    <path
                      id='path4469'
                      d='m 112.56614,415.69241 527.59454,4e-5'
                      style={{
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 220,
                        strokeLinecap: 'butt',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4
                      }}
                    />
                    <path
                      id='path4471'
                      d='m 638.86492,-33.109346 c -258.86492,0 -277.82254,152.733086 -277.82254,259.020506 0,1.46169 -0.048,22.72491 -0.0478,24.20899'
                      style={{
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: 220,
                        strokeLinecap: 'butt',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4
                      }}
                    />
                  </g>
                </svg>

                <StageIndicator stage={generated ? 'deposit' : 'forecast'} />
              </div>

              <div className='grid grid-cols-10'>
                <div className='mb-5 lg:mb-0 col-span-10 lg:col-span-3'>
                  <div className='mb-1 font-medium text-stone-600/75'>
                    Amount
                  </div>
                  {amountForm}
                  <AnimatePresence initial={false}>
                    {feeBreakdown}
                  </AnimatePresence>
                </div>
                <div className='col-span-10 lg:col-end-11 lg:col-span-6'>
                  <AnimatePresence exitBeforeEnter initial={false}>
                    {generated ? stepsEl : startingPoint}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        )
      }}
    />
  )
}

export const Workflow = () => {
  const [amount, setAmount] = React.useState(null)
  const [generated, setGenerated] = React.useState(false)
  const [steps, setSteps] = React.useState([])
  const [harvestSteps, setHarvestSteps] = React.useState([])

  return (
    <WorkflowForm
      generated={generated}
      amount={amount}
      steps={steps}
      harvestSteps={harvestSteps}
      onSubmit={async (values) => {
        setAmount(values.amount)
        setSteps([
          {
            id: 'usdcToPortal',
            fresh: false
          },
          {
            id: 'pwusdcToSnusdc',
            fresh: false
          },
          {
            id: 'snusdcToSolend',
            fresh: false
          }
        ])
        setHarvestSteps([
          {
            id: 'snusdcToPwusdc',
            fresh: false
          },
          {
            id: 'portalToUsdc',
            fresh: false
          }
        ])
        await new Promise((resolve) =>
          setTimeout(resolve, 1500 + Math.random() * 1500)
        )
        setGenerated(true)
      }}
      onUndoForecast={() => {
        setGenerated(false)
        setSteps([])
      }}
    />
  )
}
