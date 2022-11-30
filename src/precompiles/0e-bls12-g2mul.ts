import { EvmErrorResult, OOGResult } from '../evm'
import { ERROR, EvmError } from '../exceptions'

import { ExecResult } from '../evm'
import { PrecompileInput } from './types'

const {
  BLS12_381_ToG2Point,
  BLS12_381_FromG2Point,
  BLS12_381_ToFrPoint,
} = require('./util/bls12_381')

export function precompile0e(opts: PrecompileInput): ExecResult {
  const mcl = (<any>opts._EVM)._mcl!

  const inputData = opts.data

  // note: the gas used is constant; even if the input is incorrect.
  const gasUsed = opts._common.paramByEIP('gasPrices', 'Bls12381G2MulGas', 2537) ?? BigInt(0)

  if (opts.gasLimit < gasUsed) {
    return OOGResult(opts.gasLimit)
  }

  if (inputData.length !== 288) {
    return EvmErrorResult(new EvmError(ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit)
  }

  // check if some parts of input are zero bytes.
  const zeroBytes16 = Buffer.alloc(16, 0)
  const zeroByteCheck = [
    [0, 16],
    [64, 80],
    [128, 144],
    [192, 208],
  ]

  for (const index in zeroByteCheck) {
    const slicedBuffer = opts.data.slice(zeroByteCheck[index][0], zeroByteCheck[index][1])
    if (!slicedBuffer.equals(zeroBytes16)) {
      return EvmErrorResult(new EvmError(ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit)
    }
  }

  // TODO: verify that point is on G2

  // convert input to mcl G2 point/Fr point, add them, and convert the output to a Buffer.
  let mclPoint
  try {
    mclPoint = BLS12_381_ToG2Point(opts.data.slice(0, 256), mcl)
  } catch (e: any) {
    return EvmErrorResult(e, opts.gasLimit)
  }

  const frPoint = BLS12_381_ToFrPoint(opts.data.slice(256, 288), mcl)

  const result = mcl.mul(mclPoint, frPoint)

  const returnValue = BLS12_381_FromG2Point(result)

  return {
    executionGasUsed: gasUsed,
    returnValue,
  }
}
