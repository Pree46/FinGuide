export const exportWAV = (audioBuffer, sampleRate) => {
    const interleaved = interleaveChannels(audioBuffer);
    const dataView = encodeWAV(interleaved, sampleRate);
    return new Blob([dataView], { type: 'audio/wav' });
};

const interleaveChannels = (audioBuffer) => {
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }
    
    const length = channels[0].length;
    const interleaved = new Float32Array(length * channels.length);
    
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < channels.length; channel++) {
            interleaved[i * channels.length + channel] = channels[channel][i];
        }
    }
    
    return interleaved;
};

const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);
    return view;
};

const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

const floatTo16BitPCM = (view, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
};