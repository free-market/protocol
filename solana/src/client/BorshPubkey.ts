import bs58 from 'bs58'
import { OverrideType } from '@dao-xyz/borsh'

function Base58(lengthInBytes: number): OverrideType<string> {
  return {
    serialize: (value: string, writer) => {
      writer.writeFixedArray(bs58.decode(value))
    },
    deserialize: (reader): string => {
      return bs58.encode(reader.readFixedArray(lengthInBytes))
    },
  }
}

const Base58_32 = Base58(32)
const Base58_64 = Base58(64)
export const BorshPubkey = Base58_32
