tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                display: ['"Playfair Display"', 'Georgia', 'serif'],
                body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
            },
            animation: {
                'fade-up': 'fadeUp 1s ease-out both',
                'drop-in': 'dropIn 2.1s forwards',
                'sway': 'sway 6s ease-in-out infinite',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                // Rơi tăng tốc như trọng lực, chạm đất rồi nảy nhỏ dần và lắc nhẹ
                dropIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'translate3d(0,-130vh,0) rotate(-16deg) scale(.82)',
                        animationTimingFunction: 'cubic-bezier(.5,0,.75,0)',
                    },
                    '6%': { opacity: '1' },
                    '46%': {
                        transform: 'translate3d(0,0,0) rotate(5deg) scale(1)',
                        animationTimingFunction: 'cubic-bezier(.2,.8,.3,1)',
                    },
                    '60%': {
                        transform: 'translate3d(0,-11vh,0) rotate(-4deg) scale(.985)',
                        animationTimingFunction: 'cubic-bezier(.5,0,.75,0)',
                    },
                    '74%': {
                        transform: 'translate3d(0,0,0) rotate(2.5deg) scale(1)',
                        animationTimingFunction: 'cubic-bezier(.2,.8,.3,1)',
                    },
                    '84%': {
                        transform: 'translate3d(0,-4vh,0) rotate(-1.4deg)',
                        animationTimingFunction: 'cubic-bezier(.5,0,.75,0)',
                    },
                    '92%': {
                        transform: 'translate3d(0,0,0) rotate(.8deg)',
                        animationTimingFunction: 'cubic-bezier(.2,.8,.3,1)',
                    },
                    '96%': { transform: 'translate3d(0,-1.2vh,0) rotate(-.3deg)' },
                    '100%': { opacity: '1', transform: 'translate3d(0,0,0) rotate(0deg) scale(1)' },
                },
                // Đung đưa rất nhẹ sau khi đã nằm yên
                sway: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-8px) rotate(.7deg)' },
                },
            },
        },
    },
}
