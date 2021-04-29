const Contract = {
  _format: "hh-sol-artifact-1",
  contractName: "ClaimsRegistry",
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
      ],
      name: "ClaimRevoked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
      ],
      name: "ClaimStored",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "subject",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "claimHash",
          type: "bytes32",
        },
      ],
      name: "computeSignableKey",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "issuer",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
      ],
      name: "getClaim",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "hash",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "_sig",
          type: "bytes",
        },
      ],
      name: "recover",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "hash",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "_sig",
          type: "bytes",
        },
      ],
      name: "recoverWithPrefix",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      name: "registry",
      outputs: [
        {
          internalType: "address",
          name: "subject",
          type: "address",
        },
        {
          internalType: "bool",
          name: "revoked",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
      ],
      name: "revokeClaim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "subject",
          type: "address",
        },
        {
          internalType: "address",
          name: "issuer",
          type: "address",
        },
        {
          internalType: "bytes32",
          name: "claimHash",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
      ],
      name: "setClaimWithSignature",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "hash",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "signer",
          type: "address",
        },
      ],
      name: "verify",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "subject",
          type: "address",
        },
        {
          internalType: "address",
          name: "issuer",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
      ],
      name: "verifyClaim",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "hash",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "sig",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "signer",
          type: "address",
        },
      ],
      name: "verifyWithPrefix",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
  ],
};

export default Contract;
