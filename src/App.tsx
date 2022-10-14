import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const {
  SingleNodeClient,
  IndexerPluginClient,
  Bech32Helper,
} = require("@iota/iota.js");

const API_ENDPOINT = "https://api.testnet.shimmer.network";
//const API_ENDPOINT = "http://localhost:14265/";

function isValidHttpUrl(string: any) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function hex2a(hexx: string) {
  var hex = hexx.substring(2);
  var str = "";
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function App() {
  // Creating a custom hook
  const [value, setValue] = useState(
    ""
  );
  // const initialValue = [{ tokenURI: "" }];
  const initialValue = [
    {
      uri: "",
      name: "",
      collectionId: "",
      collectionName: "",
      description: "",
      issuerName: "",
      standard: "",
      type: "",
      version: "",
    },
  ];
  const [nfts, setNfts] = useState(initialValue);

  function useInput(defaultValue: any) {
    function onChange(e: any) {
      setValue(e.target.value);
      //init()
    }
    return {
      value,
      onChange,
    };
  }

  const getNftByOutputId = async function (client: any, outputId: string) {
    const output2 = await client.output(outputId);
    console.log("output2", output2);

    const data_hex = output2.output.immutableFeatures.filter(
      (obj: { type: number }) => {
        return obj.type === 2;
      }
    )[0].data;
    let data: any;
    try {
      data = hex2a(data_hex);
      data = JSON.parse(data);
    } catch (error) {
      console.log("Error while converting metadata...");
    }
    console.log("data?.standard: ", data?.standard);

    if (data?.standard === "IRC27") {
      // if (isValidHttpUrl(data?.tokenURI)) {
      if (isValidHttpUrl(data?.uri)) {
        console.log("Get URL...");
        // Get extern metadata
        // fetch(data)
        //   .then((response) => response.json())
        //   .then((json) => {
        //     console.log(json);
        //     //setImgURL(json.image);
        //     setImgURL(json.tokenURI);
        //   });
        //setImgURL(data?.tokenURI);
        return data;
      } else {
        console.log("Error: Data is not a valid url");
      }
    } else {
      console.log("Error: Other Token standard");
    }
  };

  const init = async (): Promise<void> => {
    const client = new SingleNodeClient(API_ENDPOINT);
    console.log("client", client);

    const info = await client.info();
    console.log("Node Info", info);

    const indexerClient = new IndexerPluginClient(client);
    console.log("Node Info", info);
    let address = Bech32Helper.addressFromBech32(
      value,
      info.protocol.bech32Hrp
    );
    console.log("address", address);

    if (address?.type === 16) {
      const nft = await indexerClient.nft(address.nftId);
      // const nft = await indexerClient.nfts({issuerBech32: address.nftId});
      console.log("nft", nft);
      console.log("nft.items[0])", nft.items[0]);
      let x = await getNftByOutputId(client, nft.items[0]);
      console.log("x", x);
      // if (x?.type === "image") {
      if (x?.type === "image/png") {
        console.log("nfts", nfts);
        setNfts([x]);
        console.log("nfts", nfts);
      } else {
        setNfts([]);
        console.log("not a nft", nfts);
      }
    } else if (address?.type === 0) {
      console.log("address: account address detected");
      const nfts1 = await indexerClient.nfts({ addressBech32: value });
      console.log("nfts1", nfts);
      if (nfts1.items.length > 0) {
        let _nfts = [];
        for (let index = 0; index < nfts1.items.length; index++) {
          const nftId = nfts1.items[index];
          console.log("nftId", nftId);
          const nft = await getNftByOutputId(client, nfts1.items[index]);
          console.log("nft", nft);
          if (nft?.type === "image/png") {
            _nfts.push(nft);
          }
        }
        console.log("_nfts", _nfts);
        setNfts(_nfts);
      }
    } else {
      console.log("Error: Not a valid address");
    }
  };

  const loadDataOnlyOnce = useCallback(() => {
    console.log(`I need ${value}!!`);
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    // 👇️ only runs once
    console.log("useEffect ran");

    loadDataOnlyOnce();
  }, [loadDataOnlyOnce]); // 👈️ empty dependencies array

  const inputProps = useInput("");
  return (
    <div className="content">
      <div style={{width: "55%"}}>
      <div>
        <img
          src="https://faucet.testnet.shimmer.network/shimmer.svg"
          className="logo"
          alt="Shimmer"
        ></img>
      </div>
      <div className="contentrow">
        <p className="welcome">Welcome to</p>
        <h1>Shimmer NFT Explorer</h1>
        <p className="help">This explorer show the NFTs with a IRC27 standard by an given Shimmer address.</p>
        <p className="warning">Please enter a valid Shimmer address (rms1...)</p>
        <div className="iota-input">
          <label className="iota-input__label">Shimmer Address</label>
          <input
            style={{ width: "100%" }}
            {...inputProps}
            placeholder="Type in here"
          />
        </div>
        <br />
        {nfts.map((nft, index) => (
          <>
            {(nft.uri.length > 0 && value.length > 0) && (
              <div>
                <img alt="NFT" src={nft.uri} key={index} />
                <h5>{nft.name}</h5>
                <div style={{ fontSize: ".7em" }}>
                  <p>collectionName: {nft.collectionName}</p>
                  <p>description: {nft.description}</p>
                  <p>issuerName: {nft.issuerName}</p>
                  <p>standard: {nft.standard}</p>
                  <p>type: {nft.type}</p>
                  <p>collectionId: {nft.collectionId}</p>
                  <p>uri: {nft.uri}</p>
                  <p>version: {nft.version}</p>
                </div>
              </div>
            )}
          </>
        ))}
      </div>
      </div>
      <div className="illustration-container">
        <img src="https://faucet.testnet.shimmer.network/shimmer-illustration.png" alt="faucet" className="illustration svelte-15s8o4v" />

        </div>
    </div>
  );
}

export default App;
