import React, { useId } from 'react';

const LogoImage = ({ height = 42, withText = true, className = "" }) => {
    // Aspect ratio: viewBox is 620x100, so width = height * 6.2
    const width = withText ? height * 6.2 : height;
    const uid = useId().replace(/:/g, '_');
    const gradId = `sarthiGrad_${uid}`;
    const shadowId = `shadow_${uid}`;

    return (
        <svg
            width={width}
            height={height}
            viewBox={withText ? "0 0 620 100" : "0 0 145 100"}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ display: 'block', overflow: 'visible' }}
        >
            <defs>
                {/* Gradient for "Sarthi" part of text */}
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                {/* Soft shadow for the briefcase */}
                <filter id={shadowId} x="-2" y="-2" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
                </filter>
            </defs>

            {/* --- ICON PART --- */}
            {/* Magnifying Glass */}
            <circle cx="45" cy="45" r="30" stroke="#0ea5e9" strokeWidth="9" />
            <path d="M22 68 L 10 85" stroke="#0ea5e9" strokeWidth="12" strokeLinecap="round" />

            {/* Briefcase inside lens */}
            <g filter={`url(#${shadowId})`}>
                <rect x="33" y="34" width="24" height="18" rx="2" fill="#f97316" />
                <path d="M40 34 V 30 Q 40 27, 43 27 H 47 Q 50 27, 50 30 V 34" stroke="#f97316" strokeWidth="3" fill="none" />
                <rect x="42" y="42" width="6" height="4" rx="1" fill="white" opacity="0.4" />
            </g>

            {/* Stylized J (Orange) */}
            <path d="M90 25 V 65 Q 90 82, 72 82" stroke="#f97316" strokeWidth="14" strokeLinecap="round" fill="none" />

            {/* Stylized S (Blue) */}
            <path d="M102 25 Q 135 25, 135 42 Q 135 52, 118 52 Q 102 52, 102 65 Q 102 82, 135 82" stroke="#0ea5e9" strokeWidth="14" strokeLinecap="round" fill="none" />

            {/* Waves at bottom */}
            <path d="M50 92 Q 95 82, 140 92" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
            <path d="M60 98 Q 100 88, 145 98" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

            {/* --- TEXT PART --- */}
            {withText && (
                <g>
                    {/* "Job" in Red */}
                    <text
                        x="160"
                        y="75"
                        fill="#ef4444"
                        style={{
                            font: 'bold 72px "Plus Jakarta Sans", sans-serif',
                            letterSpacing: '-2px'
                        }}
                    >
                        Job
                    </text>
                    {/* "Sarthi" in Yellow/Gold Gradient */}
                    <text
                        x="285"
                        y="75"
                        fill={`url(#${gradId})`}
                        style={{
                            font: 'bold 72px "Plus Jakarta Sans", sans-serif',
                            letterSpacing: '-2px'
                        }}
                    >
                        Sarthi
                    </text>
                </g>
            )}
        </svg>
    );
};

export default LogoImage;
