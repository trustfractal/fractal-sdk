import detectEthereumProvider from "@metamask/detect-provider";
import {
  BigNumber,
  BigNumberish,
  Contract,
  providers as ethersProviders,
  utils as ethersUtils,
} from "ethers";

import {
  Erc20 as IERC20,
  Staking as IStaking,
  ClaimsRegistry as IClaimsRegistry,
  IEthereumProviderService,
} from "@fractalwallet/types";
import { Claim } from "@fractalwallet/sdk";
import { IClaimProperties } from "@fractalwallet/sdk/src/types";

import StakingDetails from "@models/Staking/StakingDetails";
import TokenTypes from "@models/Token/types";
import Credential from "@models/Credential";
import AttestationRequest from "@models/AttestationRequest";
import ClaimType from "@models/ClaimType";
import TransactionDetails from "@models/Transaction/TransactionDetails";

import {
  ERROR_PROVIDER_NOT_DETECTED,
  ERROR_PROVIDER_NOT_METAMASK,
  ERROR_PROVIDER_OVERRIDE,
  ERROR_PROVIDER_NOT_INITIALIZED,
  ERROR_USER_DECLINED_REQUEST,
} from "@services/EthereumProviderService/Errors";

import env from "@environment/index";
import ClaimsRegistry from "@contracts/ClaimsRegistry.json";
import Staking from "@contracts/Staking.json";
import ERC20 from "@contracts/ERC20.json";
import MetamaskErrors from "./MetamaskErrors";

class EthereumProviderService implements IEthereumProviderService {
  private static instance: EthereumProviderService;
  private web3Provider?: ethersProviders.Web3Provider;

  public static getInstance(): EthereumProviderService {
    if (!EthereumProviderService.instance) {
      EthereumProviderService.instance = new EthereumProviderService();
    }

    return EthereumProviderService.instance;
  }

  public async init(): Promise<ethersProviders.Web3Provider> {
    // detect the browser ethereum provider
    const provider = await detectEthereumProvider();

    if (!provider) {
      throw ERROR_PROVIDER_NOT_DETECTED();
    }

    if (provider !== window.ethereum) {
      throw ERROR_PROVIDER_OVERRIDE();
    }

    if (!window.ethereum?.isMetaMask) {
      throw ERROR_PROVIDER_NOT_METAMASK();
    }

    this.web3Provider = new ethersProviders.Web3Provider(window.ethereum);

    return this.web3Provider;
  }

  public isAvailable(): boolean {
    return this.web3Provider !== undefined;
  }

  private ensureProviderIsInitialized(): void {
    if (!this.isAvailable()) {
      throw ERROR_PROVIDER_NOT_INITIALIZED();
    }
  }

  public async getAccountAddress(): Promise<string | undefined> {
    try {
      this.ensureProviderIsInitialized();

      const accounts = await this.web3Provider!.provider.request!({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        return;
      }

      return accounts[0];
    } catch (error) {
      console.error(error);
      if (error.code === MetamaskErrors.USER_DECLINED) {
        throw ERROR_USER_DECLINED_REQUEST();
      } else {
        throw error;
      }
    }
  }

  public async credentialStore(
    address: string,
    serializedCredential: string,
  ): Promise<string> {
    try {
      // prepare data
      const parsedCredential = Credential.parse(serializedCredential);
      const rootHashByteArray = ethersUtils.arrayify(parsedCredential.rootHash);
      const signer = this.web3Provider!.getSigner(address);

      // init smart contract
      const claimsRegistryContract = new Contract(
        env.CONTRACTS.CLAIMS_REGISTRY_CONTRACT,
        ClaimsRegistry.abi,
        signer,
      ) as IClaimsRegistry;

      // store the credential on-chain
      const storingResult = await claimsRegistryContract.setClaimWithSignature(
        parsedCredential.claimerAddress,
        parsedCredential.attesterAddress as string,
        rootHashByteArray,
        parsedCredential.attesterSignature as string,
      );

      // create transaction details
      const transactionDetails = new TransactionDetails(
        storingResult.chainId,
        storingResult.data,
        storingResult.from,
        storingResult.gasLimit as BigNumber,
        storingResult.gasPrice as BigNumber,
        storingResult.value as BigNumber,
      );

      return transactionDetails.serialize();
    } catch (error) {
      console.error(error);
      if (error.code === MetamaskErrors.USER_DECLINED) {
        throw ERROR_USER_DECLINED_REQUEST();
      } else {
        throw error;
      }
    }
  }

  public async isCredentialValid(
    address: string,
    serializedCredential: string,
  ): Promise<boolean> {
    try {
      // prepare data
      const parsedCredential = Credential.parse(serializedCredential);
      const signer = this.web3Provider!.getSigner(address);

      // init smart contract
      const claimsRegistryContract = new Contract(
        env.CONTRACTS.CLAIMS_REGISTRY_CONTRACT,
        ClaimsRegistry.abi,
        signer,
      ) as IClaimsRegistry;

      // verify claim
      const verifyClaim = await claimsRegistryContract.verifyClaim(
        parsedCredential.claimerAddress,
        parsedCredential.attesterAddress as string,
        parsedCredential.attesterSignature as string,
      );

      return verifyClaim;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getAttestationRequest(
    address: string,
    level: string,
    serializedProperties: string,
  ): Promise<string> {
    try {
      // prepare data
      const properties: IClaimProperties = JSON.parse(serializedProperties);
      const signer = this.web3Provider!.getSigner(address);

      // Generate the claim type
      const pseudoSchema = ClaimType.buildSchemaFromLevel(level);
      const claimType = ClaimType.fromSchema(pseudoSchema, signer._address);

      // Create a claim with our data
      const claim = new Claim(claimType, properties, signer._address);

      // Generate an AttestationRequest
      const request = new AttestationRequest(
        AttestationRequest.fromClaim(claim),
      );

      const claimerSignature = await signer.signMessage(request.rootHash);
      request.claimerSignature = claimerSignature;

      return request.serialize();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getStakingDetails(
    address: string,
    token: TokenTypes,
  ): Promise<string> {
    try {
      // prepare data
      const signer = this.web3Provider!.getSigner(address);

      // init smart contract
      const tokenContract = new Contract(
        env.CONTRACTS.ERC_20_CONTRACTS[token],
        ERC20.abi,
        signer,
      ) as IERC20;
      const stakingContract = new Contract(
        env.CONTRACTS.STAKING_CONTRACTS[token],
        Staking.abi,
        signer,
      ) as IStaking;

      // get user balance, current stake, current rewards and expected rewards
      const balance = await tokenContract.balanceOf(address);
      const stakedAmount = await stakingContract.getStakedAmount(address);
      const currentReward = await stakingContract.getCurrentReward(address);
      const maxReward = await stakingContract.getMaxStakeReward(address);

      // get liquidity pool details
      const poolTotalTokens = await stakingContract.totalPool();
      const poolAvailableTokens = await stakingContract.availablePool();

      // get staking details
      const stakingAllowedAmount = await tokenContract.allowance(
        address,
        env.CONTRACTS.STAKING_CONTRACTS[token],
      );
      const stakingStartDate = await stakingContract.startDate();
      const stakingEndDate = await stakingContract.endDate();
      const stakingMinAmount = await stakingContract.minAmount();
      const stakingMaxAmount = await stakingContract.maxAmount();
      const currentAPY = await stakingContract.currentAPY();
      const currentExpectedRewardRate = await stakingContract.calculateReward(
        Date.now(),
        stakingEndDate,
        100,
      );

      const details = new StakingDetails(
        balance,
        stakedAmount,
        currentReward,
        maxReward,
        poolAvailableTokens,
        poolTotalTokens,
        stakingAllowedAmount,
        stakingMinAmount,
        stakingMaxAmount,
        stakingStartDate,
        stakingEndDate,
        currentAPY,
        currentExpectedRewardRate,
      );

      return details.serialize();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async approveStake(
    address: string,
    amount: string,
    token: TokenTypes,
  ): Promise<string | undefined> {
    try {
      // prepare data
      const signer = this.web3Provider!.getSigner(address);
      const etherAmount = ethersUtils.parseEther(amount) as BigNumberish;

      // init smart contract
      const tokenContract = new Contract(
        env.CONTRACTS.ERC_20_CONTRACTS[token],
        ERC20.abi,
        signer,
      ) as IERC20;

      // check if approve is needed
      const allowanceValue = await tokenContract.allowance(
        address,
        env.CONTRACTS.STAKING_CONTRACTS[token],
      );

      if (allowanceValue.lt(etherAmount)) {
        // pre-approve stake for the address
        const approveResult = await tokenContract.approve(
          env.CONTRACTS.STAKING_CONTRACTS[token],
          etherAmount,
        );

        // create transaction details
        const transactionDetails = new TransactionDetails(
          approveResult.chainId,
          approveResult.data,
          approveResult.from,
          approveResult.gasLimit as BigNumber,
          approveResult.gasPrice as BigNumber,
          approveResult.value as BigNumber,
        );

        return transactionDetails.serialize();
      }
    } catch (error) {
      console.error(error);
      if (error.code === MetamaskErrors.USER_DECLINED) {
        throw ERROR_USER_DECLINED_REQUEST();
      } else {
        throw error;
      }
    }
  }

  public async getAllowedAmount(
    address: string,
    token: TokenTypes,
  ): Promise<string> {
    try {
      // prepare data
      const signer = this.web3Provider!.getSigner(address);

      // init smart contract
      const tokenContract = new Contract(
        env.CONTRACTS.ERC_20_CONTRACTS[token],
        ERC20.abi,
        signer,
      ) as IERC20;

      // get allowance value
      const allowanceValue = await tokenContract.allowance(
        address,
        env.CONTRACTS.STAKING_CONTRACTS[token],
      );

      return allowanceValue.toJSON();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async stake(
    address: string,
    amount: string,
    token: TokenTypes,
    serializedCredential: string,
  ): Promise<string> {
    try {
      // prepare data
      const parsedCredential = Credential.parse(serializedCredential);
      const signer = this.web3Provider!.getSigner(address);
      const etherAmount = ethersUtils.parseEther(amount) as BigNumberish;

      // init smart contract
      const tokenContract = new Contract(
        env.CONTRACTS.ERC_20_CONTRACTS[token],
        ERC20.abi,
        signer,
      ) as IERC20;
      const stakingContract = new Contract(
        env.CONTRACTS.STAKING_CONTRACTS[token],
        Staking.abi,
        signer,
      ) as IStaking;

      // check if approve is needed
      const allowanceValue = await tokenContract.allowance(
        address,
        env.CONTRACTS.STAKING_CONTRACTS[token],
      );

      if (allowanceValue.lt(etherAmount)) {
        // pre-approve stake for the address
        await tokenContract.approve(
          env.CONTRACTS.STAKING_CONTRACTS[token],
          etherAmount,
        );
      }

      // stake amount
      const stakingResult = await stakingContract.stake(
        etherAmount,
        parsedCredential.attesterSignature as string,
      );

      // create transaction details
      const transactionDetails = new TransactionDetails(
        stakingResult.chainId,
        stakingResult.data,
        stakingResult.from,
        stakingResult.gasLimit as BigNumber,
        stakingResult.gasPrice as BigNumber,
        stakingResult.value as BigNumber,
      );

      return transactionDetails.serialize();
    } catch (error) {
      console.error(error);
      if (error.code === MetamaskErrors.USER_DECLINED) {
        throw ERROR_USER_DECLINED_REQUEST();
      } else {
        throw error;
      }
    }
  }

  public async withdraw(address: string, token: TokenTypes): Promise<string> {
    try {
      // prepare data
      const signer = this.web3Provider!.getSigner(address);

      // init smart contract
      const stakingContract = new Contract(
        env.CONTRACTS.STAKING_CONTRACTS[token],
        Staking.abi,
        signer,
      );

      // withdraw from pool
      const withdrawResult = await stakingContract.withdraw();

      // create transaction details
      const transactionDetails = new TransactionDetails(
        withdrawResult.chainId,
        withdrawResult.data,
        withdrawResult.from,
        withdrawResult.gasLimit as BigNumber,
        withdrawResult.gasPrice as BigNumber,
        withdrawResult.value as BigNumber,
      );

      return transactionDetails.serialize();
    } catch (error) {
      console.error(error);
      if (error.code === MetamaskErrors.USER_DECLINED) {
        throw ERROR_USER_DECLINED_REQUEST();
      } else {
        throw error;
      }
    }
  }
}

const ethereumProvider: EthereumProviderService = EthereumProviderService.getInstance();

export default ethereumProvider;
