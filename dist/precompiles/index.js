"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemdPrecompileAddress = exports.precompiles = exports.getActivePrecompiles = void 0;
const common_1 = require("@ethereumjs/common");
const util_1 = require("@ethereumjs/util");
const _01_ecrecover_1 = require("./01-ecrecover");
const _02_sha256_1 = require("./02-sha256");
const _03_ripemd160_1 = require("./03-ripemd160");
const _04_identity_1 = require("./04-identity");
const _05_modexp_1 = require("./05-modexp");
var PrecompileAvailabilityCheck;
(function (PrecompileAvailabilityCheck) {
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["EIP"] = 0] = "EIP";
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["Hardfork"] = 1] = "Hardfork";
})(PrecompileAvailabilityCheck || (PrecompileAvailabilityCheck = {}));
const ripemdPrecompileAddress = '0000000000000000000000000000000000000003';
exports.ripemdPrecompileAddress = ripemdPrecompileAddress;
const precompiles = {
    '0000000000000000000000000000000000000001': _01_ecrecover_1.precompile01,
    '0000000000000000000000000000000000000002': _02_sha256_1.precompile02,
    [ripemdPrecompileAddress]: _03_ripemd160_1.precompile03,
    '0000000000000000000000000000000000000004': _04_identity_1.precompile04,
    '0000000000000000000000000000000000000005': _05_modexp_1.precompile05,
    //'0000000000000000000000000000000000000006': precompile06,
    //'0000000000000000000000000000000000000007': precompile07,
    //'0000000000000000000000000000000000000008': precompile08,
    //'0000000000000000000000000000000000000009': precompile09,
    //'000000000000000000000000000000000000000a': precompile0a,
    //'000000000000000000000000000000000000000b': precompile0b,
    //'000000000000000000000000000000000000000c': precompile0c,
    //'000000000000000000000000000000000000000d': precompile0d,
    //'000000000000000000000000000000000000000e': precompile0e,
    //'000000000000000000000000000000000000000f': precompile0f,
    //'0000000000000000000000000000000000000010': precompile10,
    //'0000000000000000000000000000000000000011': precompile11,
    //'0000000000000000000000000000000000000012': precompile12,
};
exports.precompiles = precompiles;
const precompileAvailability = {
    '0000000000000000000000000000000000000001': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: common_1.Hardfork.Chainstart,
    },
    '0000000000000000000000000000000000000002': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: common_1.Hardfork.Chainstart,
    },
    [ripemdPrecompileAddress]: {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: common_1.Hardfork.Chainstart,
    },
    '0000000000000000000000000000000000000004': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: common_1.Hardfork.Chainstart,
    },
    '0000000000000000000000000000000000000005': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: common_1.Hardfork.Byzantium,
    },
    //'0000000000000000000000000000000000000006': {
    //  type: PrecompileAvailabilityCheck.Hardfork,
    //  param: Hardfork.Byzantium,
    //},
    //'0000000000000000000000000000000000000007': {
    //  type: PrecompileAvailabilityCheck.Hardfork,
    //  param: Hardfork.Byzantium,
    //},
    //'0000000000000000000000000000000000000008': {
    //  type: PrecompileAvailabilityCheck.Hardfork,
    //  param: Hardfork.Byzantium,
    //},
    //'0000000000000000000000000000000000000009': {
    //  type: PrecompileAvailabilityCheck.Hardfork,
    //  param: Hardfork.Istanbul,
    //},
    //'000000000000000000000000000000000000000a': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'000000000000000000000000000000000000000b': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'000000000000000000000000000000000000000c': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'000000000000000000000000000000000000000d': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'000000000000000000000000000000000000000f': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'000000000000000000000000000000000000000e': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'0000000000000000000000000000000000000010': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'0000000000000000000000000000000000000011': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
    //'0000000000000000000000000000000000000012': {
    //  type: PrecompileAvailabilityCheck.EIP,
    //  param: 2537,
    //},
};
function getPrecompile(address, common) {
    const addr = address.buf.toString('hex');
    if (precompiles[addr] !== undefined) {
        const availability = precompileAvailability[addr];
        if ((availability.type === PrecompileAvailabilityCheck.Hardfork &&
            common.gteHardfork(availability.param)) ||
            (availability.type === PrecompileAvailabilityCheck.EIP &&
                common.eips().includes(availability.param))) {
            return precompiles[addr];
        }
    }
    return precompiles[''];
}
function getActivePrecompiles(common, customPrecompiles) {
    const precompileMap = new Map();
    if (customPrecompiles) {
        for (const precompile of customPrecompiles) {
            precompileMap.set(precompile.address.buf.toString('hex'), 'function' in precompile ? precompile.function : undefined);
        }
    }
    for (const addressString in precompiles) {
        if (precompileMap.has(addressString)) {
            continue;
        }
        const address = new util_1.Address(Buffer.from(addressString, 'hex'));
        const precompileFunc = getPrecompile(address, common);
        if (precompileFunc !== undefined) {
            precompileMap.set(addressString, precompileFunc);
        }
    }
    return precompileMap;
}
exports.getActivePrecompiles = getActivePrecompiles;
//# sourceMappingURL=index.js.map