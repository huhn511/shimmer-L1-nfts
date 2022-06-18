import React, { useState } from "react";
import styled from "styled-components";
import "./App.css";

// Styling a regular HTML input
const StyledInput = styled.input`
  display: block;
  margin: 20px 0px;
  border: 1px solid lightblue;
`;

const { SingleNodeClient, IndexerPluginClient } = require("@iota/iota.js");

const API_ENDPOINT = "http://localhost:14265/";

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
    "0x0755f364d9266c9146f54e65af965ede08103ebc524273e57091af8cc4a7bdfd"
  );
  const [imgURL, setImgURL] = useState(undefined);
  function useInput(defaultValue: any) {
    function onChange(e: any) {
      setImgURL(undefined)
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

    const output = await client.output(value);
    console.log("output", output);
    // Get the data from the metadata feature(type 2)
    const data_hex = output.output.immutableFeatures.filter(
      (obj: { type: number }) => {
        return obj.type === 2;
      }
    )[0].data;
    console.log("data_hex", data_hex);
    const data = hex2a(data_hex);
    console.log("data", data);

    if (isValidHttpUrl(data)) {
      console.log("Get URL...");
      //Get Method
      fetch(data)
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          setImgURL(json.image);
        });
    } else {
      console.log("Error: Data is not a valid url");
    }

    // const indexerPluginClient = new IndexerPluginClient(client);
    // const data = await indexerPluginClient.nft("0x006192068630857a2761ef61fe6c067485f6bf4fb8de6b7ec6696fbabdc8606b");
    // console.log("data", data);
  };

  init();

  const inputProps = useInput("");
  return (
    <div>
      <StyledInput {...inputProps} placeholder="Type in here" />
      <span>Value: {inputProps.value} </span>
      <br />
      {imgURL && <img src={imgURL} />}
    </div>
  );
}

export default App;
