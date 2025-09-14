
// 'use client'

// import { useState, useEffect, useRef } from 'react'

// export default function GravadorForm({ onUpdate }) {
//   const [recording, setRecording] = useState(false)
//   const [texto, setTexto] = useState('')
//   const [audioURL, setAudioURL] = useState(null)
//   const mediaRecorderRef = useRef(null)
//   const audioChunksRef = useRef([])
//   const recognitionRef = useRef(null)

//   // Inicializa reconhecimento de voz
//   useEffect(() => {
//     if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
//       alert('Seu navegador não suporta reconhecimento de voz')
//       return
//     }

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
//     const recognition = new SpeechRecognition()
//     recognition.lang = 'pt-BR'
//     recognition.continuous = true
//     recognition.interimResults = true

//     recognition.onresult = e => {
//       let interimText = ''
//       for (let i = e.resultIndex; i < e.results.length; i++) {
//         interimText += e.results[i][0].transcript
//       }
//       setTexto(interimText)
//       if (onUpdate) onUpdate(interimText) // envia pro formulário
//     }

//     recognitionRef.current = recognition
//   }, [onUpdate])

//   const startRecording = async () => {
//     setRecording(true)
//     setTexto('')
//     audioChunksRef.current = []

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//     const mediaRecorder = new MediaRecorder(stream)
//     mediaRecorder.ondataavailable = e => audioChunksRef.current.push(e.data)
//     mediaRecorder.onstop = () => {
//       const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
//       const url = URL.createObjectURL(blob)
//       setAudioURL(url)
//     }
//     mediaRecorder.start()
//     mediaRecorderRef.current = mediaRecorder

//     recognitionRef.current.start()
//   }

//   const stopRecording = () => {
//     setRecording(false)
//     mediaRecorderRef.current.stop()
//     recognitionRef.current.stop()
//   }

//   const resumirTranscricao = () => {
//     // Resumo simples: pega as 3 primeiras frases
//     const frases = texto.split(/[.!?]/).filter(Boolean)
//     const resumo = frases.slice(0, 3).join('. ') + (frases.length > 3 ? '...' : '')
//     setTexto(resumo)
//     if (onUpdate) onUpdate(resumo)
//   }

//   const reset = () => {
//     setRecording(false)
//     setTexto('')
//     setAudioURL(null)
//     audioChunksRef.current = []
//     if (onUpdate) onUpdate('')
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4">
//       <h2 className="text-2xl font-bold mb-2">Gravação e Transcrição</h2>

//       <textarea
//         value={texto}
//         readOnly
//         placeholder="Transcrição aparecerá aqui..."
//         className="w-full h-32 p-3 border rounded"
//       />

//       <div className="flex gap-4">
//         <button
//           onClick={recording ? stopRecording : startRecording}
//           className={`px-6 py-2 rounded text-white ${
//             recording ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
//           }`}
//         >
//           {recording ? 'Parar Gravação' : 'Iniciar Gravação'}
//         </button>

//         <button
//           onClick={resumirTranscricao}
//           disabled={!texto}
//           className="px-6 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
//         >
//           Resumir
//         </button>

//         <button
//           onClick={reset}
//           className="px-6 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
//         >
//           Limpar
//         </button>
//       </div>

//       {audioURL && (
//         <div className="mt-4">
//           <h3 className="font-semibold mb-2">Ouça a gravação:</h3>
//           <audio controls src={audioURL} className="w-full" />
//         </div>
//       )}
//     </div>
//   )
// }
