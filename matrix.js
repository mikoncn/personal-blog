const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const charArray = chars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];
const speeds = [];
const colors = [];

for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * canvas.height / fontSize;
    speeds[i] = 0.5 + Math.random() * 0.5;
    colors[i] = Math.random();
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        const hue = 120 + Math.sin(colors[i]) * 40;
        const saturation = 70 + Math.random() * 30;
        const lightness = 40 + Math.random() * 20;
        const alpha = 0.3 + Math.random() * 0.4;
        
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.font = `${fontSize}px monospace`;
        
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        drops[i] += speeds[i];
        colors[i] += 0.02;

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
            drops[i] = 0;
            speeds[i] = 0.5 + Math.random() * 0.5;
        }
    }
}

setInterval(drawMatrix, 40);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const newColumns = canvas.width / fontSize;
    for (let i = columns; i < newColumns; i++) {
        drops[i] = Math.random() * canvas.height / fontSize;
        speeds[i] = 0.5 + Math.random() * 0.5;
        colors[i] = Math.random();
    }
});
