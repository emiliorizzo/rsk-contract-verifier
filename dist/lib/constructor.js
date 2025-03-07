"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.normalizeOutput = exports.getTypesFromAbi = exports.getConstructorTypes = exports.getConstructorAbi = exports.encodeConstructorArgs = exports.decodeConstructorArgs = void 0;var _rskUtils = require("@rsksmart/rsk-utils");
var _abi = require("@ethersproject/abi");
var _bn = require("bn.js");

const abiCoder = new _abi.AbiCoder(function (type, value) {
  if (type.match(/^u?int/) && !Array.isArray(value) && (value !== Object(value) || value.constructor.name !== 'BN' || (0, _bn.isBN)(value))) {
    return value.toString();
  }
  return value;
});

const encode = (types, value) => {
  try {
    const decoded = abiCoder.encode(types, value);
    return decoded ? (0, _rskUtils.remove0x)(decoded) : decoded;
  } catch (err) {
    return undefined;
  }
};
const decode = (types, value) => {
  try {
    const decoded = abiCoder.decode(types, value);
    return decoded;
  } catch (err) {
    return undefined;
  }
};

const getConstructorAbi = (abi) => abi.filter((x) => x.type === 'constructor')[0];exports.getConstructorAbi = getConstructorAbi;

const getTypesFromAbi = (abiDef) => abiDef.inputs.map((x) => x.type);exports.getTypesFromAbi = getTypesFromAbi;

const getConstructorTypes = (abi) => getTypesFromAbi(getConstructorAbi([...abi]));exports.getConstructorTypes = getConstructorTypes;

const encodeConstructorArgs = (args, abi) => {
  const types = getConstructorTypes(abi);
  for (let p in types) {
    let type = types[p];
    let value = args[p];
    if (type.indexOf('bytes') > -1 && !value) value = '0x';
    args[p] = value;
  }
  const encoded = encode(types, args);
  return encoded ? encoded.toString('hex') : encoded;
};exports.encodeConstructorArgs = encodeConstructorArgs;

const normalizeOutput = (out) => {
  if (Array.isArray(out)) return out.map(normalizeOutput);
  if ((0, _bn.isBN)(out)) out = (0, _rskUtils.add0x)(out.toString(16));
  if ((0, _rskUtils.isAddress)(out)) out = (0, _rskUtils.add0x)(out.toLowerCase());
  return out;
};exports.normalizeOutput = normalizeOutput;

const decodeConstructorArgs = (encoded, abi) => {
  const types = getConstructorTypes(abi);
  let decoded = decode(types, (0, _rskUtils.toBuffer)(encoded));
  return decoded ? normalizeOutput(decoded) : decoded;
};exports.decodeConstructorArgs = decodeConstructorArgs;