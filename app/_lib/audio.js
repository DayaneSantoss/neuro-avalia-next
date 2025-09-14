// _lib/audio.js
'use client'

export async function startRecording(setMediaRecorder, chunksRef, setRecording) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream)
  chunksRef.current = []

  recorder.ondataavailable = e => chunksRef.current.push(e.data)
  recorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const url = URL.createObjectURL(blob)
    setRecording(false)
    return { blob, url }
  }

  recorder.start()
  setMediaRecorder(recorder)
  setRecording(true)
  return recorder
}

export function stopRecording(mediaRecorder) {
  if (mediaRecorder) mediaRecorder.stop()
}

export async function transcreverAudio(audioBlob) {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')

  const res = await fetch('/api/transcrever', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return data.texto
}
