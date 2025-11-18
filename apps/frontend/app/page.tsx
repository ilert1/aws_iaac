"use client";
import { useState } from "react";
import { ITranslateRequest, ITranslateResponse } from "@sff/shared-types";

const URL = "https://ugmg3jnit4.execute-api.us-east-1.amazonaws.com/prod/";

async function translateText({
  inputLang,
  outLang,
  text,
}: {
  inputLang: string;
  outLang: string;
  text: string;
}) {
  try {
    const req: ITranslateRequest = {
      sourceLang: inputLang,
      sourceText: text,
      targetLang: outLang,
    };

    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(req),
    });

    return (await response.json()) as ITranslateResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [inputLang, setInputLang] = useState("");
  const [outputLang, setOutputLang] = useState("");
  const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);

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
      </form>
      <pre>{JSON.stringify(outputText)}</pre>
    </div>
  );
}
