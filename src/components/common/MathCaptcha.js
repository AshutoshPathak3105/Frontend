import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

const generateCode = (len = 6) => {
    let code = '';
    for (let i = 0; i < len; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
    return code;
};

const drawCaptcha = (canvas, code) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 180 + 60)},${Math.floor(Math.random() * 180 + 60)},${Math.floor(Math.random() * 255)},0.5)`;
        ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, Math.random() * H);
        ctx.lineTo(Math.random() * W, Math.random() * H);
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150 + 80)},${Math.floor(Math.random() * 150 + 80)},${Math.floor(Math.random() * 255)},0.35)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    const charW = W / (code.length + 1);
    const fonts = ['bold 22px monospace', 'bold 20px "Courier New"', 'bold 21px monospace'];
    for (let i = 0; i < code.length; i++) {
        ctx.save();
        const x = charW * (i + 0.8) + Math.random() * 4 - 2;
        const y = H / 2 + 6 + Math.random() * 4 - 2;
        const angle = (Math.random() * 30 - 15) * (Math.PI / 180);
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
        const r = Math.floor(Math.random() * 80 + 160);
        const g = Math.floor(Math.random() * 80 + 160);
        const b = Math.floor(Math.random() * 80 + 200);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
    }
};

const MathCaptcha = ({ onVerify }) => {
    const [code, setCode] = useState(() => generateCode());
    const [input, setInput] = useState('');
    const [verified, setVerified] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        drawCaptcha(canvasRef.current, code);
    }, [code]);

    useEffect(() => {
        if (input.length === 0) { onVerify(false); return; }
        const ok = input === code;
        setVerified(ok);
        onVerify(ok);
    }, [input, code, onVerify]);

    const refresh = useCallback(() => {
        const newCode = generateCode();
        setCode(newCode);
        setInput('');
        setVerified(false);
        onVerify(false);
    }, [onVerify]);

    return (
        <div style={{ width: '100%' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                CAPTCHA Verification
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    borderRadius: 8, overflow: 'hidden',
                    border: '1.5px solid var(--border)', flexShrink: 0,
                }}>
                    <canvas ref={canvasRef} width={160} height={48} style={{ display: 'block' }} />
                </div>
                <button
                    type="button"
                    onClick={refresh}
                    title="New CAPTCHA"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                        padding: 4, flexShrink: 0, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <RefreshCw size={14} />
                </button>
            </div>
            <div style={{
                marginTop: 6,
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-secondary)',
                border: `1.5px solid ${verified ? 'var(--success, #22c55e)' : 'var(--border)'}`,
                borderRadius: 8, padding: '0 12px', transition: 'border-color 0.2s',
                width: '100%', boxSizing: 'border-box', overflow: 'hidden',
            }}>
                <ShieldCheck size={14} style={{ color: verified ? 'var(--success, #22c55e)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s' }} />
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter characters above"
                    maxLength={6}
                    autoComplete="off"
                    style={{
                        flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none',
                        color: 'var(--text-primary)', fontSize: 13,
                        fontFamily: 'Inter', padding: '7px 0', letterSpacing: 1,
                    }}
                />
                {verified && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success, #22c55e)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        Verified ✓
                    </span>
                )}
            </div>
        </div>
    );
};

export default MathCaptcha;
