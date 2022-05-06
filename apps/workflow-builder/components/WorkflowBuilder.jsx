import * as React from 'react'
import { Form, Field } from 'react-final-form'
import cx from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownIcon } from '@heroicons/react/solid'

const STEP_DELAY = 0.3

export default () => {
  const [generated, setGenerated] = React.useState(false)
  const handleStartWithSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 750))
    setGenerated(true)
  }

  const remainingWorkflow = (
    <>
      <div className='col-span-2' />
      <div className='col-span-3 gap-5 justify-self-center flex flex-col items-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 1 }}
        >
          <ArrowDownIcon className='h-6 w-6 text-stone-500' />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 2 }}
          className='w-96 flex flex-col gap-3 p-2 md:p-4 rounded-2xl bg-stone-800 shadow-md shadow-stone-400'
        >
          <div className='px-2'>
            <div className='flex items-center justify-between gap-1'>
              <div className='flex gap-4'>
                <div className='text-base leading-5 font-bold cursor-pointer select-none text-stone-200 hover:text-stone-50 text-high-emphesis'>
                  Add liquidity with Curve
                </div>
              </div>
              <div className='flex gap-4' />
            </div>
          </div>

          <div className='flex flex-col gap-2 md:gap-4'>
            <div className='border-stone-600 hover:border-stone-600 rounded-2xl border bg-stone-700 p-3 flex flex-col gap-4'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center'>
                  <div className='bg-stone-600 flex items-center gap-2 px-2 py-1 rounded-full shadow-md text-high-emphesis cursor-not-allowed'>
                    <div
                      className='rounded-full'
                      style={{ width: 20, height: 20 }}
                    >
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
                    <div className='text-stone-200 text-sm leading-5 font-bold !text-xl'>
                      3CRV
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex gap-1 justify-between items-baseline px-1.5'>
                <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-baseline flex-grow gap-3 overflow-hidden'>
                  <div className='w-48 relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 disabled:cursor-not-allowed pr-14'>
                    12.34
                  </div>
                  <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex flex-row items-baseline'>
                    <span className='opacity-0 absolute pointer-events-none tracking-[0]'>
                      0.00 foo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 2 }}
    className="mt-14 pr-20 col-span-3">

    Perferendis sequi totam explicabo et rerum et nihil ducimus. Mollitia iste neque consequatur assumenda sapiente sunt optio et. Numquam distinctio veritatis nostrum ad adipisci nemo assumenda. Enim est ut ullam assumenda culpa laboriosam.</motion.div>

      <div className='col-span-2' />
      <div className='col-span-3 gap-5 justify-self-center flex flex-col items-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 3 }}
        >
          <ArrowDownIcon className='h-6 w-6 text-stone-500' />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 4 }}
          className='w-96 flex flex-col gap-3 p-2 md:p-4 rounded-2xl bg-stone-800 shadow-md shadow-stone-400'
        >
          <div className='px-2'>
            <div className='flex items-center justify-between gap-1'>
              <div className='flex gap-4'>
                <div className='text-base leading-5 font-bold cursor-pointer select-none text-stone-200 hover:text-stone-50 text-high-emphesis'>
                  Wrap with Portal
                </div>
              </div>
              <div className='flex gap-4' />
            </div>
          </div>

          <div className='flex flex-col gap-2 md:gap-4'>
            <div className='border-stone-600 hover:border-stone-600 rounded-2xl border bg-stone-700 p-3 flex flex-col gap-4'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center'>
                  <div className='bg-stone-600 flex items-center gap-2 px-2 py-1 rounded-full shadow-md text-high-emphesis cursor-not-allowed'>
                    <div
                      className='rounded-full'
                      style={{ width: 20, height: 20 }}
                    >
                      <div
                        className='overflow-hidden rounded'
                        style={{ width: 20, height: 20 }}
                      >
                        <img
                          alt='Portal-wrapped 3CRV'
                          src='https://curve.fi/logo.png'
                          decoding='async'
                          data-nimg='fixed'
                          className='rounded-full !rounded-full overflow-hidden'
                        />
                      </div>
                    </div>
                    <div className='text-stone-200 text-sm leading-5 font-bold !text-xl'>
                      Portal-wrapped 3CRV
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex gap-1 justify-between items-baseline px-1.5'>
                <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-baseline flex-grow gap-3 overflow-hidden'>
                  <div className='w-48 relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 disabled:cursor-not-allowed pr-14'>
                    12.34
                  </div>
                  <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex flex-row items-baseline'>
                    <span className='opacity-0 absolute pointer-events-none tracking-[0]'>
                      0.00 foo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 4 }}
    className="col-span-3 mt-14 pr-20">

Tenetur consequuntur illo eos quod doloribus iusto voluptatem. Reprehenderit in et odio sed quam molestiae. Amet dolor voluptatibus quia molestias voluptatum. Non repellendus consequatur et aut excepturi nisi doloremque vero.</motion.div>

      <div className='col-span-2' />
      <div className='col-span-3 gap-5 justify-self-center flex flex-col items-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 5 }}
        >
          <ArrowDownIcon className='h-6 w-6 text-stone-500' />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 6 }}
          className='w-96 flex flex-col gap-3 p-2 md:p-4 rounded-2xl bg-stone-800 shadow-md shadow-stone-400'
        >
          <div className='px-2'>
            <div className='flex items-center justify-between gap-1'>
              <div className='flex gap-4'>
                <div className='text-base leading-5 font-bold cursor-pointer select-none text-stone-200 hover:text-stone-50 text-high-emphesis'>
                  Lend with Solend
                </div>
              </div>
              <div className='flex gap-4' />
            </div>
          </div>

          <div className='flex flex-col gap-2 md:gap-4'>
            <div className='border-stone-600 hover:border-stone-600 rounded-2xl border bg-stone-700 p-3 flex flex-col gap-4'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center'>
                  <div className='bg-stone-600 flex items-center gap-2 px-2 py-1 rounded-full shadow-md text-high-emphesis cursor-not-allowed'>
                    <div
                      className='rounded-full'
                      style={{ width: 20, height: 20 }}
                    >
                      <div
                        className='overflow-hidden rounded'
                        style={{ width: 20, height: 20 }}
                      >
                        <img
                          alt='Portal-wrapped 3CRV'
                          src='https://curve.fi/logo.png'
                          decoding='async'
                          data-nimg='fixed'
                          className='rounded-full !rounded-full overflow-hidden'
                        />
                      </div>
                    </div>
                    <div className='text-stone-200 text-sm leading-5 font-bold !text-xl'>
                      Portal-wrapped 3CRV
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex gap-1 justify-between items-baseline px-1.5'>
                <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-baseline flex-grow gap-3 overflow-hidden'>
                  <div className='w-48 relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 disabled:cursor-not-allowed pr-14'>
                    12.34
                  </div>
                  <div className='text-2xl leading-7 tracking-[-0.01em] font-bold relative flex flex-row items-baseline'>
                    <span className='opacity-0 absolute pointer-events-none tracking-[0]'>
                      0.00 foo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: STEP_DELAY * 6 }}
    className="pr-20 mt-14 col-span-3">
    Molestiae nisi ut delectus laborum consectetur ipsum vitae. Natus sit nemo a cumque distinctio laudantium assumenda. Rerum adipisci quibusdam ut et aut corporis est magnam. Aperiam amet nihil labore.
    </motion.div>
    </>
  )

  const form = (
    <Form
      onSubmit={handleStartWithSubmit}
      initialValues={{ amount: null }}
      render={({ handleSubmit, submitting, form }) => {
        const amount = form.getFieldState('amount')?.value
        const empty = amount == null || Number(amount) === 0
        const usdEstimate =
          empty || isNaN(parseFloat(amount))
            ? '0.00'
            : parseFloat(amount).toFixed(2)

        return (
          <form
            onSubmit={handleSubmit}
            className={cx(
              'col-span-3 self-start justify-self-center w-96 flex flex-col gap-3 p-2 md:p-4 rounded-2xl bg-stone-800 shadow-md shadow-stone-400 transition-opacity transition-200',
              { 'opacity-75': submitting }
            )}
          >
            <div className='px-2'>
              <div className='flex items-center justify-between gap-1'>
                <div className='flex gap-4'>
                  <div className='text-base leading-5 font-bold cursor-pointer select-none text-stone-200 hover:text-stone-50 text-high-emphesis'>
                    Start with
                  </div>
                </div>
                <div className='flex gap-4' />
              </div>
            </div>
            <div className='flex flex-col gap-2 md:gap-4'>
              <div className='border-stone-600 hover:border-stone-600 rounded-2xl border bg-stone-700 p-3 flex flex-col gap-4'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center'>
                    <div
                      className={cx(
                        'bg-stone-600 flex items-center gap-2 px-2 py-1 rounded-full shadow-md text-high-emphesis',
                        generated
                          ? 'cursor-not-allowed'
                          : 'hover:bg-stone-500 cursor-pointer'
                      )}
                    >
                      <div
                        className='rounded-full'
                        style={{ width: 20, height: 20 }}
                      >
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
                      <div className='text-stone-200 text-sm leading-5 font-bold !text-xl'>
                        USDC
                      </div>
                      <svg
                        className='text-stone-300'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                        width='18'
                      >
                        <path
                          fillRule='evenodd'
                          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <Field
                  name='amount'
                  render={({ input }) => (
                    <div className='flex gap-1 justify-between items-baseline px-1.5'>
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
                          className='w-48 relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 disabled:cursor-not-allowed pr-14'
                          {...input}
                          onBlur={(event) => {
                            const value = parseFloat(event.target.value)
                            if (!isNaN(value)) {
                              form.change('amount', value.toFixed(2))
                            }
                            input.onBlur(event)
                          }}
                        />
                        <span className='text-xs leading-4 font-medium text-stone-400 absolute bottom-1.5 pointer-events-none text-right w-full'>
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

              <div
                className={cx('overflow-hidden w-full', {
                  '-mt-2 md:-mt-4': generated && !submitting
                })}
              >
                <AnimatePresence>
                  {!generated && (
                    <motion.button
                      layout
                      initial={{ marginTop: 0, scale: 1 }}
                      animate={{ marginTop: 0, scale: 1 }}
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
                          <div className='flex items-center'>Generate</div>
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
      }}
    />
  )

  // <div className='min-h-full flex flex-col justify-start items-center gap-5 pt-5 grid-rows-3'>
  return (
    <div className='min-h-full grid grid-cols-8 pt-5 gap-5'>
      <div className="col-span-2" />
      {form}
      <div className="col-span-3" />
      {generated && remainingWorkflow}
    </div>
  )
}
