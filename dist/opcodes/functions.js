"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const util_1 = require("@ethereumjs/util");
const keccak_1 = require("ethereum-cryptography/keccak");
const utils_1 = require("ethereum-cryptography/utils");
const exceptions_1 = require("../exceptions");
const util_2 = require("./util");
const EIP3074MAGIC = Buffer.from('03', 'hex');
// the opcode functions
exports.handlers = new Map([
    // 0x00: STOP
    [
        0x00,
        function () {
            (0, util_2.trap)(exceptions_1.ERROR.STOP);
        },
    ],
    // 0x01: ADD
    [
        0x01,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = (0, util_2.mod)(a + b, util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x02: MUL
    [
        0x02,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = (0, util_2.mod)(a * b, util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x03: SUB
    [
        0x03,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = (0, util_2.mod)(a - b, util_1.TWO_POW256);
            runState.stack.push(r);
        },
    ],
    // 0x04: DIV
    [
        0x04,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
            if (b === BigInt(0)) {
                r = BigInt(0);
            }
            else {
                r = (0, util_2.mod)(a / b, util_1.TWO_POW256);
            }
            runState.stack.push(r);
        },
    ],
    // 0x05: SDIV
    [
        0x05,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
            if (b === BigInt(0)) {
                r = BigInt(0);
            }
            else {
                r = (0, util_2.toTwos)((0, util_2.fromTwos)(a) / (0, util_2.fromTwos)(b));
            }
            runState.stack.push(r);
        },
    ],
    // 0x06: MOD
    [
        0x06,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
            if (b === BigInt(0)) {
                r = b;
            }
            else {
                r = (0, util_2.mod)(a, b);
            }
            runState.stack.push(r);
        },
    ],
    // 0x07: SMOD
    [
        0x07,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
            if (b === BigInt(0)) {
                r = b;
            }
            else {
                r = (0, util_2.fromTwos)(a) % (0, util_2.fromTwos)(b);
            }
            runState.stack.push((0, util_2.toTwos)(r));
        },
    ],
    // 0x08: ADDMOD
    [
        0x08,
        function (runState) {
            const [a, b, c] = runState.stack.popN(3);
            let r;
            if (c === BigInt(0)) {
                r = BigInt(0);
            }
            else {
                r = (0, util_2.mod)(a + b, c);
            }
            runState.stack.push(r);
        },
    ],
    // 0x09: MULMOD
    [
        0x09,
        function (runState) {
            const [a, b, c] = runState.stack.popN(3);
            let r;
            if (c === BigInt(0)) {
                r = BigInt(0);
            }
            else {
                r = (0, util_2.mod)(a * b, c);
            }
            runState.stack.push(r);
        },
    ],
    // 0x0a: EXP
    [
        0x0a,
        function (runState) {
            const [base, exponent] = runState.stack.popN(2);
            if (exponent === BigInt(0)) {
                runState.stack.push(BigInt(1));
                return;
            }
            if (base === BigInt(0)) {
                runState.stack.push(base);
                return;
            }
            const r = (0, util_2.exponentation)(base, exponent);
            runState.stack.push(r);
        },
    ],
    // 0x0b: SIGNEXTEND
    [
        0x0b,
        function (runState) {
            /* eslint-disable-next-line prefer-const */
            let [k, val] = runState.stack.popN(2);
            if (k < BigInt(31)) {
                const signBit = k * BigInt(8) + BigInt(7);
                const mask = (BigInt(1) << signBit) - BigInt(1);
                if ((val >> signBit) & BigInt(1)) {
                    val = val | BigInt.asUintN(256, ~mask);
                }
                else {
                    val = val & mask;
                }
            }
            runState.stack.push(val);
        },
    ],
    // 0x10 range - bit ops
    // 0x10: LT
    [
        0x10,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a < b ? BigInt(1) : BigInt(0);
            runState.stack.push(r);
        },
    ],
    // 0x11: GT
    [
        0x11,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a > b ? BigInt(1) : BigInt(0);
            runState.stack.push(r);
        },
    ],
    // 0x12: SLT
    [
        0x12,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = (0, util_2.fromTwos)(a) < (0, util_2.fromTwos)(b) ? BigInt(1) : BigInt(0);
            runState.stack.push(r);
        },
    ],
    // 0x13: SGT
    [
        0x13,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = (0, util_2.fromTwos)(a) > (0, util_2.fromTwos)(b) ? BigInt(1) : BigInt(0);
            runState.stack.push(r);
        },
    ],
    // 0x14: EQ
    [
        0x14,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a === b ? BigInt(1) : BigInt(0);
            runState.stack.push(r);
        },
    ],
    // 0x15: ISZERO
    [
        0x15,
        function (runState) {
            const a = runState.stack.pop();
            const r = a === BigInt(0) ? BigInt(1) : BigInt(0);
            runState.stack.push(r);
        },
    ],
    // 0x16: AND
    [
        0x16,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a & b;
            runState.stack.push(r);
        },
    ],
    // 0x17: OR
    [
        0x17,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a | b;
            runState.stack.push(r);
        },
    ],
    // 0x18: XOR
    [
        0x18,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            const r = a ^ b;
            runState.stack.push(r);
        },
    ],
    // 0x19: NOT
    [
        0x19,
        function (runState) {
            const a = runState.stack.pop();
            const r = BigInt.asUintN(256, ~a);
            runState.stack.push(r);
        },
    ],
    // 0x1a: BYTE
    [
        0x1a,
        function (runState) {
            const [pos, word] = runState.stack.popN(2);
            if (pos > BigInt(32)) {
                runState.stack.push(BigInt(0));
                return;
            }
            const r = (word >> ((BigInt(31) - pos) * BigInt(8))) & BigInt(0xff);
            runState.stack.push(r);
        },
    ],
    // 0x1b: SHL
    [
        0x1b,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            if (a > BigInt(256)) {
                runState.stack.push(BigInt(0));
                return;
            }
            const r = (b << a) & util_1.MAX_INTEGER_BIGINT;
            runState.stack.push(r);
        },
    ],
    // 0x1c: SHR
    [
        0x1c,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            if (a > 256) {
                runState.stack.push(BigInt(0));
                return;
            }
            const r = b >> a;
            runState.stack.push(r);
        },
    ],
    // 0x1d: SAR
    [
        0x1d,
        function (runState) {
            const [a, b] = runState.stack.popN(2);
            let r;
            const bComp = BigInt.asIntN(256, b);
            const isSigned = bComp < 0;
            if (a > 256) {
                if (isSigned) {
                    r = util_1.MAX_INTEGER_BIGINT;
                }
                else {
                    r = BigInt(0);
                }
                runState.stack.push(r);
                return;
            }
            const c = b >> a;
            if (isSigned) {
                const shiftedOutWidth = BigInt(255) - a;
                const mask = (util_1.MAX_INTEGER_BIGINT >> shiftedOutWidth) << shiftedOutWidth;
                r = c | mask;
            }
            else {
                r = c;
            }
            runState.stack.push(r);
        },
    ],
    // 0x20 range - crypto
    // 0x20: SHA3
    [
        0x20,
        function (runState) {
            const [offset, length] = runState.stack.popN(2);
            let data = Buffer.alloc(0);
            if (length !== BigInt(0)) {
                data = runState.memory.read(Number(offset), Number(length));
            }
            const r = BigInt('0x' + (0, utils_1.bytesToHex)((0, keccak_1.keccak256)(data)));
            runState.stack.push(r);
        },
    ],
    // 0x30 range - closure state
    // 0x30: ADDRESS
    [
        0x30,
        function (runState) {
            const address = (0, util_1.bufferToBigInt)(runState.interpreter.getAddress().buf);
            runState.stack.push(address);
        },
    ],
    // 0x31: BALANCE
    [
        0x31,
        function (runState) {
            const addressBigInt = runState.stack.pop();
            const address = new util_1.Address((0, util_2.addressToBuffer)(addressBigInt));
            const balance = runState.interpreter.getExternalBalance(address);
            runState.stack.push(balance);
        },
    ],
    // 0x32: ORIGIN
    [
        0x32,
        function (runState) {
            runState.stack.push(runState.interpreter.getTxOrigin());
        },
    ],
    // 0x33: CALLER
    [
        0x33,
        function (runState) {
            runState.stack.push(runState.interpreter.getCaller());
        },
    ],
    // 0x34: CALLVALUE
    [
        0x34,
        function (runState) {
            runState.stack.push(runState.interpreter.getCallValue());
        },
    ],
    // 0x35: CALLDATALOAD
    [
        0x35,
        function (runState) {
            const pos = runState.stack.pop();
            if (pos > runState.interpreter.getCallDataSize()) {
                runState.stack.push(BigInt(0));
                return;
            }
            const i = Number(pos);
            let loaded = runState.interpreter.getCallData().slice(i, i + 32);
            loaded = loaded.length ? loaded : Buffer.from([0]);
            let r = (0, util_1.bufferToBigInt)(loaded);
            if (loaded.length < 32) {
                r = r << (BigInt(8) * BigInt(32 - loaded.length));
            }
            runState.stack.push(r);
        },
    ],
    // 0x36: CALLDATASIZE
    [
        0x36,
        function (runState) {
            const r = runState.interpreter.getCallDataSize();
            runState.stack.push(r);
        },
    ],
    // 0x37: CALLDATACOPY
    [
        0x37,
        function (runState) {
            const [memOffset, dataOffset, dataLength] = runState.stack.popN(3);
            if (dataLength !== BigInt(0)) {
                const data = (0, util_2.getDataSlice)(runState.interpreter.getCallData(), dataOffset, dataLength);
                const memOffsetNum = Number(memOffset);
                const dataLengthNum = Number(dataLength);
                runState.memory.extend(memOffsetNum, dataLengthNum);
                runState.memory.write(memOffsetNum, dataLengthNum, data);
            }
        },
    ],
    // 0x38: CODESIZE
    [
        0x38,
        function (runState) {
            runState.stack.push(runState.interpreter.getCodeSize());
        },
    ],
    // 0x39: CODECOPY
    [
        0x39,
        function (runState) {
            const [memOffset, codeOffset, dataLength] = runState.stack.popN(3);
            if (dataLength !== BigInt(0)) {
                const data = (0, util_2.getDataSlice)(runState.interpreter.getCode(), codeOffset, dataLength);
                const memOffsetNum = Number(memOffset);
                const lengthNum = Number(dataLength);
                runState.memory.extend(memOffsetNum, lengthNum);
                runState.memory.write(memOffsetNum, lengthNum, data);
            }
        },
    ],
    // 0x3b: EXTCODESIZE
    [
        0x3b,
        function (runState) {
            const addressBigInt = runState.stack.pop();
            const size = BigInt((runState.eei.getContractCode(new util_1.Address((0, util_2.addressToBuffer)(addressBigInt)))).length);
            runState.stack.push(size);
        },
    ],
    // 0x3c: EXTCODECOPY
    [
        0x3c,
        function (runState) {
            const [addressBigInt, memOffset, codeOffset, dataLength] = runState.stack.popN(4);
            if (dataLength !== BigInt(0)) {
                const code = runState.eei.getContractCode(new util_1.Address((0, util_2.addressToBuffer)(addressBigInt)));
                const data = (0, util_2.getDataSlice)(code, codeOffset, dataLength);
                const memOffsetNum = Number(memOffset);
                const lengthNum = Number(dataLength);
                runState.memory.extend(memOffsetNum, lengthNum);
                runState.memory.write(memOffsetNum, lengthNum, data);
            }
        },
    ],
    // 0x3f: EXTCODEHASH
    [
        0x3f,
        function (runState) {
            const addressBigInt = runState.stack.pop();
            const address = new util_1.Address((0, util_2.addressToBuffer)(addressBigInt));
            const empty = (runState.eei.getAccount(address)).isEmpty();
            if (empty) {
                runState.stack.push(BigInt(0));
                return;
            }
            const codeHash = (runState.eei.getAccount(new util_1.Address((0, util_2.addressToBuffer)(addressBigInt))))
                .codeHash;
            runState.stack.push(BigInt('0x' + codeHash.toString('hex')));
        },
    ],
    // 0x3d: RETURNDATASIZE
    [
        0x3d,
        function (runState) {
            runState.stack.push(runState.interpreter.getReturnDataSize());
        },
    ],
    // 0x3e: RETURNDATACOPY
    [
        0x3e,
        function (runState) {
            const [memOffset, returnDataOffset, dataLength] = runState.stack.popN(3);
            if (dataLength !== BigInt(0)) {
                const data = (0, util_2.getDataSlice)(runState.interpreter.getReturnData(), returnDataOffset, dataLength);
                const memOffsetNum = Number(memOffset);
                const lengthNum = Number(dataLength);
                runState.memory.extend(memOffsetNum, lengthNum);
                runState.memory.write(memOffsetNum, lengthNum, data);
            }
        },
    ],
    // 0x3a: GASPRICE
    [
        0x3a,
        function (runState) {
            runState.stack.push(runState.interpreter.getTxGasPrice());
        },
    ],
    // '0x40' range - block operations
    // 0x40: BLOCKHASH
    [
        0x40,
        function (runState) {
            const number = runState.stack.pop();
            const diff = runState.interpreter.getBlockNumber() - number;
            // block lookups must be within the past 256 blocks
            if (diff > BigInt(256) || diff <= BigInt(0)) {
                runState.stack.push(BigInt(0));
                return;
            }
            const hash = runState.eei.getBlockHash(number);
            runState.stack.push(hash);
        },
    ],
    // 0x41: COINBASE
    [
        0x41,
        function (runState) {
            runState.stack.push(runState.interpreter.getBlockCoinbase());
        },
    ],
    // 0x42: TIMESTAMP
    [
        0x42,
        function (runState) {
            runState.stack.push(runState.interpreter.getBlockTimestamp());
        },
    ],
    // 0x43: NUMBER
    [
        0x43,
        function (runState) {
            runState.stack.push(runState.interpreter.getBlockNumber());
        },
    ],
    // 0x44: DIFFICULTY (EIP-4399: supplanted as PREVRANDAO)
    [
        0x44,
        function (runState, common) {
            if (common.isActivatedEIP(4399)) {
                runState.stack.push(runState.interpreter.getBlockPrevRandao());
            }
            else {
                runState.stack.push(runState.interpreter.getBlockDifficulty());
            }
        },
    ],
    // 0x45: GASLIMIT
    [
        0x45,
        function (runState) {
            runState.stack.push(runState.interpreter.getBlockGasLimit());
        },
    ],
    // 0x46: CHAINID
    [
        0x46,
        function (runState) {
            runState.stack.push(runState.interpreter.getChainId());
        },
    ],
    // 0x47: SELFBALANCE
    [
        0x47,
        function (runState) {
            runState.stack.push(runState.interpreter.getSelfBalance());
        },
    ],
    // 0x48: BASEFEE
    [
        0x48,
        function (runState) {
            runState.stack.push(runState.interpreter.getBlockBaseFee());
        },
    ],
    // 0x50 range - 'storage' and execution
    // 0x50: POP
    [
        0x50,
        function (runState) {
            runState.stack.pop();
        },
    ],
    // 0x51: MLOAD
    [
        0x51,
        function (runState) {
            const pos = runState.stack.pop();
            const word = runState.memory.read(Number(pos), 32);
            runState.stack.push((0, util_1.bufferToBigInt)(word));
        },
    ],
    // 0x52: MSTORE
    [
        0x52,
        function (runState) {
            const [offset, word] = runState.stack.popN(2);
            const buf = (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(word), 32);
            const offsetNum = Number(offset);
            runState.memory.extend(offsetNum, 32);
            runState.memory.write(offsetNum, 32, buf);
        },
    ],
    // 0x53: MSTORE8
    [
        0x53,
        function (runState) {
            const [offset, byte] = runState.stack.popN(2);
            const buf = (0, util_1.bigIntToBuffer)(byte & BigInt(0xff));
            const offsetNum = Number(offset);
            runState.memory.extend(offsetNum, 1);
            runState.memory.write(offsetNum, 1, buf);
        },
    ],
    // 0x54: SLOAD
    [
        0x54,
        function (runState) {
            const key = runState.stack.pop();
            const keyBuf = (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(key), 32);
            const value = runState.interpreter.storageLoad(keyBuf);
            const valueBigInt = value.length ? (0, util_1.bufferToBigInt)(value) : BigInt(0);
            runState.stack.push(valueBigInt);
        },
    ],
    // 0x55: SSTORE
    [
        0x55,
        function (runState) {
            const [key, val] = runState.stack.popN(2);
            const keyBuf = (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(key), 32);
            // NOTE: this should be the shortest representation
            let value;
            if (val === BigInt(0)) {
                value = Buffer.from([]);
            }
            else {
                value = (0, util_1.bigIntToBuffer)(val);
            }
            runState.interpreter.storageStore(keyBuf, value);
        },
    ],
    // 0x56: JUMP
    [
        0x56,
        function (runState) {
            const dest = runState.stack.pop();
            if (dest > runState.interpreter.getCodeSize()) {
                (0, util_2.trap)(exceptions_1.ERROR.INVALID_JUMP + ' at ' + (0, util_2.describeLocation)(runState));
            }
            const destNum = Number(dest);
            if (!(0, util_2.jumpIsValid)(runState, destNum)) {
                (0, util_2.trap)(exceptions_1.ERROR.INVALID_JUMP + ' at ' + (0, util_2.describeLocation)(runState));
            }
            runState.programCounter = destNum;
        },
    ],
    // 0x57: JUMPI
    [
        0x57,
        function (runState) {
            const [dest, cond] = runState.stack.popN(2);
            if (cond !== BigInt(0)) {
                if (dest > runState.interpreter.getCodeSize()) {
                    (0, util_2.trap)(exceptions_1.ERROR.INVALID_JUMP + ' at ' + (0, util_2.describeLocation)(runState));
                }
                const destNum = Number(dest);
                if (!(0, util_2.jumpIsValid)(runState, destNum)) {
                    (0, util_2.trap)(exceptions_1.ERROR.INVALID_JUMP + ' at ' + (0, util_2.describeLocation)(runState));
                }
                runState.programCounter = destNum;
            }
        },
    ],
    // 0x58: PC
    [
        0x58,
        function (runState) {
            runState.stack.push(BigInt(runState.programCounter - 1));
        },
    ],
    // 0x59: MSIZE
    [
        0x59,
        function (runState) {
            runState.stack.push(runState.memoryWordCount * BigInt(32));
        },
    ],
    // 0x5a: GAS
    [
        0x5a,
        function (runState) {
            runState.stack.push(runState.interpreter.getGasLeft());
        },
    ],
    // 0x5b: JUMPDEST
    [0x5b, function () { }],
    // 0x5c: BEGINSUB
    [
        0x5c,
        function (runState) {
            (0, util_2.trap)(exceptions_1.ERROR.INVALID_BEGINSUB + ' at ' + (0, util_2.describeLocation)(runState));
        },
    ],
    // 0x5d: RETURNSUB
    [
        0x5d,
        function (runState) {
            if (runState.returnStack.length < 1) {
                (0, util_2.trap)(exceptions_1.ERROR.INVALID_RETURNSUB);
            }
            const dest = runState.returnStack.pop();
            runState.programCounter = Number(dest);
        },
    ],
    // 0x5e: JUMPSUB
    [
        0x5e,
        function (runState) {
            const dest = runState.stack.pop();
            if (dest > runState.interpreter.getCodeSize()) {
                (0, util_2.trap)(exceptions_1.ERROR.INVALID_JUMPSUB + ' at ' + (0, util_2.describeLocation)(runState));
            }
            const destNum = Number(dest);
            if (!(0, util_2.jumpSubIsValid)(runState, destNum)) {
                (0, util_2.trap)(exceptions_1.ERROR.INVALID_JUMPSUB + ' at ' + (0, util_2.describeLocation)(runState));
            }
            runState.returnStack.push(BigInt(runState.programCounter));
            runState.programCounter = destNum + 1;
        },
    ],
    // 0x5f: PUSH0
    [
        0x5f,
        function (runState) {
            runState.stack.push(BigInt(0));
        },
    ],
    // 0x60: PUSH
    [
        0x60,
        function (runState, common) {
            const numToPush = runState.opCode - 0x5f;
            if (common.isActivatedEIP(3540) &&
                runState.programCounter + numToPush > runState.code.length) {
                (0, util_2.trap)(exceptions_1.ERROR.OUT_OF_RANGE);
            }
            const loaded = (0, util_1.bufferToBigInt)(runState.interpreter
                .getCode()
                .slice(runState.programCounter, runState.programCounter + numToPush));
            runState.programCounter += numToPush;
            runState.stack.push(loaded);
        },
    ],
    // 0x80: DUP
    [
        0x80,
        function (runState) {
            const stackPos = runState.opCode - 0x7f;
            runState.stack.dup(stackPos);
        },
    ],
    // 0x90: SWAP
    [
        0x90,
        function (runState) {
            const stackPos = runState.opCode - 0x8f;
            runState.stack.swap(stackPos);
        },
    ],
    // 0xa0: LOG
    [
        0xa0,
        function (runState) {
            const [memOffset, memLength] = runState.stack.popN(2);
            const topicsCount = runState.opCode - 0xa0;
            const topics = runState.stack.popN(topicsCount);
            const topicsBuf = topics.map(function (a) {
                return (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(a), 32);
            });
            let mem = Buffer.alloc(0);
            if (memLength !== BigInt(0)) {
                mem = runState.memory.read(Number(memOffset), Number(memLength));
            }
            runState.interpreter.log(mem, topicsCount, topicsBuf);
        },
    ],
    // 0xb3: TLOAD
    [
        0xb3,
        function (runState) {
            const key = runState.stack.pop();
            const keyBuf = (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(key), 32);
            const value = runState.interpreter.transientStorageLoad(keyBuf);
            const valueBN = value.length ? (0, util_1.bufferToBigInt)(value) : BigInt(0);
            runState.stack.push(valueBN);
        },
    ],
    // 0xb4: TSTORE
    [
        0xb4,
        function (runState) {
            if (runState.interpreter.isStatic()) {
                (0, util_2.trap)(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            const [key, val] = runState.stack.popN(2);
            const keyBuf = (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(key), 32);
            // NOTE: this should be the shortest representation
            let value;
            if (val === BigInt(0)) {
                value = Buffer.from([]);
            }
            else {
                value = (0, util_1.bigIntToBuffer)(val);
            }
            runState.interpreter.transientStorageStore(keyBuf, value);
        },
    ],
    // '0xf0' range - closures
    // 0xf0: CREATE
    [
        0xf0,
        function (runState) {
            const [value, offset, length] = runState.stack.popN(3);
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            let data = Buffer.alloc(0);
            if (length !== BigInt(0)) {
                data = runState.memory.read(Number(offset), Number(length));
            }
            const ret = runState.interpreter.create(gasLimit, value, data);
            runState.stack.push(ret);
        },
    ],
    // 0xf5: CREATE2
    [
        0xf5,
        function (runState) {
            if (runState.interpreter.isStatic()) {
                (0, util_2.trap)(exceptions_1.ERROR.STATIC_STATE_CHANGE);
            }
            const [value, offset, length, salt] = runState.stack.popN(4);
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            let data = Buffer.alloc(0);
            if (length !== BigInt(0)) {
                data = runState.memory.read(Number(offset), Number(length));
            }
            const ret = runState.interpreter.create2(gasLimit, value, data, (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(salt), 32));
            runState.stack.push(ret);
        },
    ],
    // 0xf1: CALL
    [
        0xf1,
        function (runState) {
            const [_currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength] = runState.stack.popN(7);
            const toAddress = new util_1.Address((0, util_2.addressToBuffer)(toAddr));
            let data = Buffer.alloc(0);
            if (inLength !== BigInt(0)) {
                data = runState.memory.read(Number(inOffset), Number(inLength));
            }
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            const ret = runState.interpreter.call(gasLimit, toAddress, value, data);
            // Write return data to memory
            (0, util_2.writeCallOutput)(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf2: CALLCODE
    [
        0xf2,
        function (runState) {
            const [_currentGasLimit, toAddr, value, inOffset, inLength, outOffset, outLength] = runState.stack.popN(7);
            const toAddress = new util_1.Address((0, util_2.addressToBuffer)(toAddr));
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            let data = Buffer.alloc(0);
            if (inLength !== BigInt(0)) {
                data = runState.memory.read(Number(inOffset), Number(inLength));
            }
            const ret = runState.interpreter.callCode(gasLimit, toAddress, value, data);
            // Write return data to memory
            (0, util_2.writeCallOutput)(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf4: DELEGATECALL
    [
        0xf4,
        function (runState) {
            const value = runState.interpreter.getCallValue();
            const [_currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength] = runState.stack.popN(6);
            const toAddress = new util_1.Address((0, util_2.addressToBuffer)(toAddr));
            let data = Buffer.alloc(0);
            if (inLength !== BigInt(0)) {
                data = runState.memory.read(Number(inOffset), Number(inLength));
            }
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            const ret = runState.interpreter.callDelegate(gasLimit, toAddress, value, data);
            // Write return data to memory
            (0, util_2.writeCallOutput)(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf6: AUTH
    [
        0xf6,
        function (runState) {
            // eslint-disable-next-line prefer-const
            let [authority, memOffset, memLength] = runState.stack.popN(3);
            if (memLength > BigInt(128)) {
                memLength = BigInt(128);
            }
            let mem = runState.memory.read(Number(memOffset), Number(memLength));
            if (mem.length < 128) {
                mem = (0, util_1.setLengthRight)(mem, 128);
            }
            const yParity = BigInt(mem[31]);
            const r = mem.slice(32, 64);
            const s = mem.slice(64, 96);
            const commit = mem.slice(96, 128);
            if ((0, util_1.bufferToBigInt)(s) > util_1.SECP256K1_ORDER_DIV_2) {
                (0, util_2.trap)(exceptions_1.ERROR.AUTH_INVALID_S);
            }
            const paddedInvokerAddress = (0, util_1.setLengthLeft)(runState.interpreter._env.address.buf, 32);
            const chainId = (0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(runState.interpreter.getChainId()), 32);
            const message = Buffer.concat([EIP3074MAGIC, chainId, paddedInvokerAddress, commit]);
            const msgHash = Buffer.from((0, keccak_1.keccak256)(message));
            let recover;
            try {
                recover = (0, util_1.ecrecover)(msgHash, yParity + BigInt(27), r, s);
            }
            catch (e) {
                // Malformed signature, push 0 on stack, clear auth variable
                runState.stack.push(BigInt(0));
                runState.auth = undefined;
                return;
            }
            const addressBuffer = (0, util_1.publicToAddress)(recover);
            const address = new util_1.Address(addressBuffer);
            runState.auth = address;
            const expectedAddress = new util_1.Address((0, util_1.setLengthLeft)((0, util_1.bigIntToBuffer)(authority), 20));
            if (!expectedAddress.equals(address)) {
                // expected address does not equal the recovered address, clear auth variable
                runState.stack.push(BigInt(0));
                runState.auth = undefined;
                return;
            }
            runState.auth = address;
            runState.stack.push(BigInt(1));
        },
    ],
    // 0xf7: AUTHCALL
    [
        0xf7,
        function (runState) {
            const [_currentGasLimit, addr, value, _valueExt, argsOffset, argsLength, retOffset, retLength,] = runState.stack.popN(8);
            const toAddress = new util_1.Address((0, util_2.addressToBuffer)(addr));
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            let data = Buffer.alloc(0);
            if (argsLength !== BigInt(0)) {
                data = runState.memory.read(Number(argsOffset), Number(argsLength));
            }
            const ret = runState.interpreter.authcall(gasLimit, toAddress, value, data);
            // Write return data to memory
            (0, util_2.writeCallOutput)(runState, retOffset, retLength);
            runState.stack.push(ret);
        },
    ],
    // 0xfa: STATICCALL
    [
        0xfa,
        function (runState) {
            const value = BigInt(0);
            const [_currentGasLimit, toAddr, inOffset, inLength, outOffset, outLength] = runState.stack.popN(6);
            const toAddress = new util_1.Address((0, util_2.addressToBuffer)(toAddr));
            const gasLimit = runState.messageGasLimit;
            runState.messageGasLimit = undefined;
            let data = Buffer.alloc(0);
            if (inLength !== BigInt(0)) {
                data = runState.memory.read(Number(inOffset), Number(inLength));
            }
            const ret = runState.interpreter.callStatic(gasLimit, toAddress, value, data);
            // Write return data to memory
            (0, util_2.writeCallOutput)(runState, outOffset, outLength);
            runState.stack.push(ret);
        },
    ],
    // 0xf3: RETURN
    [
        0xf3,
        function (runState) {
            const [offset, length] = runState.stack.popN(2);
            let returnData = Buffer.alloc(0);
            if (length !== BigInt(0)) {
                returnData = runState.memory.read(Number(offset), Number(length));
            }
            runState.interpreter.finish(returnData);
        },
    ],
    // 0xfd: REVERT
    [
        0xfd,
        function (runState) {
            const [offset, length] = runState.stack.popN(2);
            let returnData = Buffer.alloc(0);
            if (length !== BigInt(0)) {
                returnData = runState.memory.read(Number(offset), Number(length));
            }
            runState.interpreter.revert(returnData);
        },
    ],
    // '0x70', range - other
    // 0xff: SELFDESTRUCT
    [
        0xff,
        function (runState) {
            const selfdestructToAddressBigInt = runState.stack.pop();
            const selfdestructToAddress = new util_1.Address((0, util_2.addressToBuffer)(selfdestructToAddressBigInt));
            return runState.interpreter.selfDestruct(selfdestructToAddress);
        },
    ],
]);
// Fill in rest of PUSHn, DUPn, SWAPn, LOGn for handlers
const pushFn = exports.handlers.get(0x60);
for (let i = 0x61; i <= 0x7f; i++) {
    exports.handlers.set(i, pushFn);
}
const dupFn = exports.handlers.get(0x80);
for (let i = 0x81; i <= 0x8f; i++) {
    exports.handlers.set(i, dupFn);
}
const swapFn = exports.handlers.get(0x90);
for (let i = 0x91; i <= 0x9f; i++) {
    exports.handlers.set(i, swapFn);
}
const logFn = exports.handlers.get(0xa0);
for (let i = 0xa1; i <= 0xa4; i++) {
    exports.handlers.set(i, logFn);
}
//# sourceMappingURL=functions.js.map