// script.js
import { KokoroTTS } from 'https://cdn.jsdelivr.net/npm/kokoro-js@latest/dist/kokoro.min.js';

(async () => {
  // 1. モデルのロード (量子化q8, WebGPU)
  const tts = await KokoroTTS.from_pretrained(
    'onnx-community/Kokoro-82M-v1.0-ONNX',
    { dtype: 'q8', device: 'webgpu' }
  );

  // 2. UI 要素取得
  const textInput   = document.getElementById('textInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const speakBtn    = document.getElementById('speakBtn');
  const stopBtn     = document.getElementById('stopBtn');

  // 3. 声リストをセレクトに追加
  tts.list_voices().forEach(v => {
    const opt = document.createElement('option');
    opt.value       = v;
    opt.textContent = v;
    voiceSelect.appendChild(opt);
  });

  let audioInstance = null;

  // 4. 読み上げ開始
  async function speak() {
    const text = textInput.value.trim();
    if (!text) {
      alert('テキストを入力してください。');
      return;
    }
    speakBtn.disabled = true;
    stopBtn.disabled  = false;

    // 5. 音声生成 & 再生
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

  // 6. 再生停止
  function stop() {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance = null;
    }
    speakBtn.disabled = false;
    stopBtn.disabled  = true;
  }

  // 7. イベント登録
  speakBtn.addEventListener('click', speak);
  stopBtn.addEventListener('click', stop);
})();
