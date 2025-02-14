import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import FarmABI from "./abis/Farm.json";
import { parseMetamaskError } from "./utils";

const address = CONFIG.FARM_CONTRACT;

type FarmAccount = {
  account: string;
  owner: string;
  tokenId: number;
};

type FarmCreatedEvent = {
  owner: string;
  landAddress: string;
  tokenId: number;
};
/**
 * Farm NFT contract
 */
export class Farm {
  private web3: Web3;
  private account: string;

  private farm: any;

  constructor(web3: Web3, account: string) {
    this.web3 = web3;
    this.account = account;
    this.farm = new this.web3.eth.Contract(
      FarmABI as AbiItem[],
      address as string
    );
  }

  // TODO - simplify the smart contract to fetch this in 1 call
  public async getFarms(attempts = 0): Promise<FarmAccount[]> {
    await new Promise((res) => setTimeout(res, 3000 * attempts));

    try {
      const accounts = await this.farm.methods
        .getFarms(this.account)
        .call({ from: this.account });

      return accounts;
    } catch (e) {
      const error = parseMetamaskError(e);
      if (attempts < 3) {
        return this.getFarms(attempts + 1);
      }

      throw error;
    }
  }

  public async getFarm(tokenId: number): Promise<FarmAccount> {
    const account = await this.farm.methods.getFarm(tokenId).call();

    return account;
  }

  public async getNewFarm(oldTokenId?: number): Promise<FarmAccount> {
    await new Promise((res) => setTimeout(res, 3000));

    const farms = await this.getFarms();

    // Try again
    if (farms.length === 0) {
      return this.getNewFarm(oldTokenId);
    }

    return farms[0];
  }
}
