// Simple synthesized sounds using Web Audio API
// No external files required

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSuccessSound = () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
  oscillator.frequency.exponentialRampToValueAtTime(1174.66, audioContext.currentTime + 0.1); // D6

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

export const playErrorSound = () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

export const playFlipSound = () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
  
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
  
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  
    // Short high-pitch generic click
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
  
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
};

export const playCompleteSound = () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Play a small arpeggio
    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    
    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
    });
};
