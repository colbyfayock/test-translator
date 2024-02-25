import { useEffect, useState, useRef } from 'react';

import { default as languageCodesData } from '../data/language-codes.json';
import { default as countryCodesData } from '../data/country-codes.json';

const languageCodes: Record<string, string> = languageCodesData;
const countryCodes: Record<string, string> = countryCodesData;

const Translator = () => {
  const synthRef = useRef<SpeechSynthesis>();

  const [isActive, setIsActive] = useState(false);
  const [isSpeechDetected, setIsSoundDetected] = useState(false);
  const [text, setText] = useState<string>();
  const [translation, setTranslation] = useState<string>();
  const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>();
  const [language, setLanguage] = useState<string>('pt-BR');

  const availableLanguages = Array.from(new Set(voices?.map(({ lang }) => lang)))
    .map(lang => {
      const split = lang.split('-');
      const languageCode: string = split[0];
      const countryCode: string = split[1];
      return {
        lang,
        label: languageCodes[languageCode] || lang,
        dialect: countryCodes[countryCode]
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label));
  const activeLanguage = availableLanguages.find(({ lang }) => language === lang);

  const availableVoices = voices?.filter(({ lang }) => lang === language);
  const activeVoice = availableVoices?.find(({ name }) => name.includes('Google')) || availableVoices?.[0];

  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    synthRef.current.onvoiceschanged = function() {
      const voices = synthRef.current?.getVoices();
      setVoices(voices);
    }
  }, []);

  useEffect(() => {
    (async function run() {
      if ( !text || !synthRef.current || !activeVoice ) return;
      
      const translatedText = await translate(text);

      setTranslation(translatedText);

      const utterance = new SpeechSynthesisUtterance(translatedText);

      utterance.voice = activeVoice;

      synthRef.current.speak(utterance);
    })()
  }, [text, synthRef.current, activeVoice])

  function handleOnClick() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = function() {
      setIsActive(true);
    }

    recognition.onend = function() {
      setIsActive(false);
      setIsSoundDetected(false);
    }

    recognition.onsoundstart = function() {
      setIsSoundDetected(true);
    }

    recognition.onsoundend = function() {
      setIsSoundDetected(false);
    }

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    }

    recognition.start();
  }

  async function translate(text: string) {
    const results = await fetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        language
      })
    }).then(r => r.json());
    return results.text
  }

  return (
    <div className="mt-12 px-4">

      <div className="max-w-lg rounded-xl overflow-hidden mx-auto">
        <div className="bg-zinc-200 p-4 border-b-4 border-zinc-300">
          <div className="bg-blue-200 rounded-lg p-2 border-2 border-blue-300">
            <ul className="font-mono font-bold text-blue-900 uppercase px-4 py-2 border border-blue-800 rounded">
              <li>
                &gt; Translation Mode: { activeLanguage?.label }
              </li>
              <li>
                &gt; Dialect: { activeLanguage?.dialect }
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-zinc-800 p-4 border-b-4 border-zinc-950">
          <p className="flex items-center gap-3">
            <span className={`block rounded-full w-5 h-5 flex-shrink-0 flex-grow-0 ${isActive ? 'bg-red-500' : 'bg-red-900'} `}>
              <span className="sr-only">{ isActive ? 'Actively recording' : 'Not actively recording' }</span>
            </span>
            <span className={`block rounded w-full h-5 flex-grow-1 ${isSpeechDetected ? 'bg-green-500' : 'bg-green-900'}`}>
              <span className="sr-only">{ isSpeechDetected ? 'Speech is being recorded' : 'Speech is not being recorded' }</span>
            </span>
          </p>
        </div>

        <div className="bg-zinc-800 p-4">
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg bg-zinc-200 rounded-lg p-5 mx-auto">
            <form>
              <div>
                <label className="block text-zinc-500 text-[.6rem] uppercase font-bold mb-1">Language</label>
                <select className="w-full text-[.7rem] rounded-sm border-zinc-300 px-2 py-1 pr-7" name="language" value={language} onChange={(event) => {
                  setLanguage(event.currentTarget.value);
                }}>
                  {availableLanguages.map(({ lang, label }) => {
                    return (
                      <option key={lang} value={lang}>
                        { label } ({ lang })
                      </option>
                    )
                  })}
                </select>
              </div>
            </form>
            <p>
              <button
                className="w-full h-full uppercase font-semibold text-sm text-zinc-400 bg-zinc-900 color-white py-3 rounded-sm"
                onClick={handleOnClick}
              >
                Record
              </button>
            </p>
          </div>
        </div>
      </div>


      <div className="max-w-lg mx-auto mt-12">
        <p className="mb-4">
          Spoken Text: { text }
        </p>
        <p>
          Translation: { translation }
        </p>
      </div>

    </div>
  )
}

export default Translator;