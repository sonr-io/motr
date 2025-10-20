import { base64 } from "@sonr.io/sdk/codec";
import {
  EthermintCryptoV1Ethsecp256k1PubKey as ProtoEthermintSecp256k1PubKey,
  CosmosCryptoSecp256k1PubKey as ProtoSecp256k1PubKey,
} from "@sonr.io/sdk/protobufs";

import type { Adapter } from "./Adapter";

type Data = {
  chainId?: string | undefined;
  key: Uint8Array;
};

export class Secp256k1PubKey implements Adapter {
  private readonly data: Data;
  private readonly type: string;

  constructor(data: Data) {
    this.data = data;
    this.type = data.chainId?.split(/[-_]/, 2).at(0) ?? "";
  }

  public toProto() {
    const isEthermintChain =
      this.type === "dymension" ||
      this.type === "evmos" ||
      this.type === "injective";
    return isEthermintChain
      ? new ProtoEthermintSecp256k1PubKey(this.data as any)
      : new ProtoSecp256k1PubKey(this.data as any);
  }

  public toAmino() {
    const isEthermintChain =
      this.type === "dymension" ||
      this.type === "evmos" ||
      this.type === "injective";

    return {
      type: isEthermintChain
        ? "ethermint/PubKeyEthSecp256k1"
        : "tendermint/PubKeySecp256k1",
      value: {
        key: base64.encode(this.data.key),
      },
    };
  }
}
