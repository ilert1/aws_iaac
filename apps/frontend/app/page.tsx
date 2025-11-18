"use client";
import { useState } from "react";

const URL = "https://ugmg3jnit4.execute-api.us-east-1.amazonaws.com/prod/";

async function translateText(input: {
  inputLang: string;
  outLang: string;
  text: string;
}) {
  try {
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({
        sourceLanguage: input.inputLang,
        targetLanguages: input.outLang,
        text: input.text,
      }),
    });

    return response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return error.toString();
  }
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [inputLang, setInputLang] = useState("");
  const [outputLang, setOutputLang] = useState("");
  const [outputText, setOutputText] = useState("");

  return (
    <div className="flex flex-col min-h-screen items-center justify-between p-24">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const res = await translateText({
            inputLang: inputLang,
            outLang: outputLang,
            text: inputText,
          });
          setOutputText(res);
        }}
      >
        <div>
          <label htmlFor="inputText">Input text</label>
          <textarea
            className="bg-white"
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="inputLang">Input language</label>
          <input
            className="bg-white"
            id="inputLang"
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="outputLang">Output language</label>
          <input
            className="bg-white"
            id="outputLang"
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          />
        </div>

        <button type="submit" className="btn bg-blue-500 p-2 mt-2 rounded-xl">
          Translate
        </button>

        <div>
          <label htmlFor="outputText">Output text</label>
          <textarea
            className="bg-white"
            id="outputText"
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
          />
        </div>
      </form>
      <pre>{outputText}</pre>
    </div>
  );
}
