import { ExecResult } from '../evm'
import { EVMInterface } from '../types'
import { Common } from '@ethereumjs/common'

export interface PrecompileFunc {
  (input: PrecompileInput): ExecResult | ExecResult
}

export interface PrecompileInput {
  data: Buffer
  gasLimit: bigint
  _common: Common
  _EVM: EVMInterface
}
