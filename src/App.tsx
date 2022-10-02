import React, { useState } from "react";
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
    "rms1zq6znjsv2xu66d9ynlgk6fjxp866py3svx4nxtpp3lpzh32cw2pec8tvqxu"
  );
  const [imgURL, setImgURL] = useState(undefined);
  function useInput(defaultValue: any) {
    function onChange(e: any) {
      setImgURL(undefined);
      setValue(e.target.value);
    }
    return {
      value,
      onChange,
    };
  }

  const init = async (): Promise<void> => {
    const client = new SingleNodeClient(API_ENDPOINT);
    console.log("client", client);

    const info = await client.info();
    console.log("Node Info", info);

    const indexerClient = new IndexerPluginClient(client);
    let x = Bech32Helper.addressFromBech32(value, info.protocol.bech32Hrp);
    const nft = await indexerClient.nft(x.nftId);
    const output2 = await client.output(nft.items[0]);

    const data_hex = output2.output.immutableFeatures.filter(
      (obj: { type: number }) => {
        return obj.type === 2;
      }
    )[0].data;
    let data: any = hex2a(data_hex);
    data = JSON.parse(data);

    if (isValidHttpUrl(data?.tokenURI)) {
      console.log("Get URL...");
      // Get extern metadata
      // fetch(data)
      //   .then((response) => response.json())
      //   .then((json) => {
      //     console.log(json);
      //     //setImgURL(json.image);
      //     setImgURL(json.tokenURI);
      //   });
      setImgURL(data?.tokenURI);
    } else {
      console.log("Error: Data is not a valid url");
    }
  };

  init();

  const inputProps = useInput("");
  return (
    <div>
      <h1>Shimmer NFT Explorer</h1>
      <p>Search for Nft address:</p>
      <input {...inputProps} placeholder="Type in here" />
      <p >NFT Image:</p>
      <br />
      {imgURL && <img alt="NFT" src={imgURL} />}
    </div>
  );
}

export default App;
