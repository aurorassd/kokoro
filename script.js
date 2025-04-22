import { KokoroTTS } from 'https://cdn.jsdelivr.net/npm/kokoro-js@latest/dist/kokoro.min.js';

(async () => {
  // Kokoro モデルロード
  const tts = await KokoroTTS.from_pretrained(
    'onnx-community/Kokoro-82M-v1.0-ONNX',
    { dtype: 'q8', device: 'webgpu' }
  );

  // UI 要素
  const textInput   = document.getElementById('textInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const speakBtn    = document.getElementById('speakBtn');
  const stopBtn     = document.getElementById('stopBtn');

  // 声リストを追加
  tts.list_voices().forEach(v => {
    const opt = document.createElement('option');
    opt.value       = v;
    opt.textContent = v;
    voiceSelect.appendChild(opt);
  });

  let audioInstance = null;

  async function speak() {
    const text = textInput.value.trim();
    if (!text) return alert('テキストを入力してください。');
    speakBtn.disabled = true;
    stopBtn.disabled  = false;

    const wavBuffer = await tts.generate(text, { voice: voiceSelect.value });
    const blob      = new Blob([wavBuffer], { type: 'audio/wav' });
    const url       = URL.createObjectURL(blob);

    audioInstance = new Audio(url);
    audioInstance.play();
    audioInstance.onended = () => {
      speakBtn.disabled = false;
      stopBtn.disabled  = true;
      URL.revokeObjectURL(url);
    };
  }

  function stop() {
    if (audioInstance) audioInstance.pause();
    speakBtn.disabled = false;
    stopBtn.disabled  = true;
  }

  speakBtn.addEventListener('click', speak);
  stopBtn.addEventListener('click', stop);
})();
