"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile0c = void 0;
const evm_1 = require("../evm");
const exceptions_1 = require("../exceptions");
const { BLS12_381_ToG1Point, BLS12_381_ToFrPoint, BLS12_381_FromG1Point, } = require('./util/bls12_381');
function precompile0c(opts) {
    const mcl = opts._EVM._mcl;
    const inputData = opts.data;
    if (inputData.length === 0) {
        return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_INPUT_EMPTY), opts.gasLimit); // follow Geths implementation
    }
    const numPairs = Math.floor(inputData.length / 160);
    const gasUsedPerPair = opts._common.paramByEIP('gasPrices', 'Bls12381G1MulGas', 2537) ?? BigInt(0);
    const gasDiscountArray = opts._common.paramByEIP('gasPrices', 'Bls12381MultiExpGasDiscount', 2537);
    const gasDiscountMax = gasDiscountArray[gasDiscountArray.length - 1][1];
    let gasDiscountMultiplier;
    if (numPairs <= gasDiscountArray.length) {
        if (numPairs === 0) {
            gasDiscountMultiplier = 0; // this implicitly sets gasUsed to 0 as per the EIP.
        }
        else {
            gasDiscountMultiplier = gasDiscountArray[numPairs - 1][1];
        }
    }
    else {
        gasDiscountMultiplier = gasDiscountMax;
    }
    const gasUsed = (gasUsedPerPair * BigInt(numPairs) * BigInt(gasDiscountMultiplier)) / BigInt(1000);
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (inputData.length % 160 !== 0) {
        return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    // prepare pairing list and check for mandatory zero bytes
    const zeroBytes16 = Buffer.alloc(16, 0);
    const zeroByteCheck = [
        [0, 16],
        [64, 80],
    ];
    const G1Array = [];
    const FrArray = [];
    for (let k = 0; k < inputData.length / 160; k++) {
        // zero bytes check
        const pairStart = 160 * k;
        for (const index in zeroByteCheck) {
            const slicedBuffer = opts.data.slice(zeroByteCheck[index][0] + pairStart, zeroByteCheck[index][1] + pairStart);
            if (!slicedBuffer.equals(zeroBytes16)) {
                return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit);
            }
        }
        let G1;
        try {
            G1 = BLS12_381_ToG1Point(opts.data.slice(pairStart, pairStart + 128), mcl);
        }
        catch (e) {
            return (0, evm_1.EvmErrorResult)(e, opts.gasLimit);
        }
        const Fr = BLS12_381_ToFrPoint(opts.data.slice(pairStart + 128, pairStart + 160), mcl);
        G1Array.push(G1);
        FrArray.push(Fr);
    }
    const result = mcl.mulVec(G1Array, FrArray);
    const returnValue = BLS12_381_FromG1Point(result);
    return {
        executionGasUsed: gasUsed,
        returnValue,
    };
}
exports.precompile0c = precompile0c;
//# sourceMappingURL=0c-bls12-g1multiexp.js.map