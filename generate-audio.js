// Generate a gentle valid looping audio file for assets/music/background.mp3
const fs = require('fs');
const path = require('path');

// Let's create a valid minimal MP3 or WAV audio with soft romantic chimes
// A valid RIFF WAVE file (PCM 16-bit 44.1kHz stereo) containing a soft romantic arpeggio
const sampleRate = 44100;
const durationSec = 6;
const numChannels = 2;
const numSamples = sampleRate * durationSec;
const byteRate = sampleRate * numChannels * 2;
const blockAlign = numChannels * 2;
const dataSize = numSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk 1 size (16 for PCM)
buffer.writeUInt16LE(1, 20);  // PCM format
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34); // 16 bits per sample

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Romantic music box notes: C5 (523.25), E5 (659.25), G5 (783.99), B5 (987.77), C6 (1046.50), G5, E5, D5 (587.33)
const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 783.99, 659.25, 587.33];
const noteDuration = durationSec / notes.length;

let offset = 44;
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const noteIdx = Math.floor(t / noteDuration);
  const noteFreq = notes[noteIdx] || 523.25;
  const noteTime = t % noteDuration;

  // Gentle bell/music box envelope (exponential decay)
  const env = Math.exp(-noteTime * 4.5);
  // Soft sine with gentle harmonic
  const tone = Math.sin(2 * Math.PI * noteFreq * t) * 0.7 +
               Math.sin(4 * Math.PI * noteFreq * t) * 0.25 +
               Math.sin(6 * Math.PI * noteFreq * t) * 0.05;

  const sampleVal = Math.max(-1, Math.min(1, tone * env * 0.35));
  const intSample = Math.floor(sampleVal * 32767);

  // Left channel
  buffer.writeInt16LE(intSample, offset);
  // Right channel (slight chorus pan)
  buffer.writeInt16LE(intSample, offset + 2);
  offset += 4;
}

const outputPath = path.join(__dirname, 'assets', 'music', 'background.mp3');
fs.writeFileSync(outputPath, buffer);
console.log('Generated gentle audio at', outputPath);
