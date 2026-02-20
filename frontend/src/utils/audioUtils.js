export const RINGTONES = [
    {
        id: 'digital_alarm',
        name: 'Digital Alarm',
        url: 'https://assets.mixkit.co/active_storage/sfx/1017/1017-preview.mp3'
    },
    {
        id: 'soft_glow',
        name: 'Soft Glow',
        url: 'https://assets.mixkit.co/active_storage/sfx/1016/1016-preview.mp3'
    },
    {
        id: 'beep_beep',
        name: 'Beep Beep',
        url: 'https://assets.mixkit.co/active_storage/sfx/1014/1014-preview.mp3'
    },
    {
        id: 'cyber_alert',
        name: 'Cyber Alert',
        url: 'https://assets.mixkit.co/active_storage/sfx/999/999-preview.mp3'
    },
    {
        id: 'morning_dawn',
        name: 'Morning Dawn',
        url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
    }
];

export const playRingtone = (id) => {
    const ringtone = RINGTONES.find(r => r.id === id) || RINGTONES[0];
    const audio = new Audio(ringtone.url);
    audio.play().catch(err => console.error('Audio playback failed:', err));
    return audio;
};
