import React, { useState } from 'react';
import { getUploadUrl } from '../../services/api';

const getInitials = (name = '') =>
    name?.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2) || '?';

const Avatar = ({ user, size = 40, className = '' }) => {
    const [imgError, setImgError] = useState(false);

    if (user?.avatar && !imgError) {
        return (
            <img
                src={getUploadUrl(user.avatar)}
                alt={user.name}
                className={className}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0
                }}
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'var(--gradient-primary, linear-gradient(135deg, #6366f1 0%, #a855f7 100%))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.38,
                color: '#fff',
                fontWeight: 700,
                flexShrink: 0
            }}
        >
            {getInitials(user?.name)}
        </div>
    );
};

export default Avatar;
