// Video chỉ phát MỘT lần, sau khi bấm "Khám phá".
// Đã phát rồi thì không cho phát lại, trừ khi tải lại trang.
const video = document.getElementById('bg-video');
const playBtn = document.getElementById('play-btn');
const intro = document.getElementById('intro');
let started = false;

// Chọn video nền theo bề rộng màn hình.
// Không dùng <source media="..."> vì Chrome đã bỏ hỗ trợ thuộc tính đó trong <video>.
const SOURCES = [
    { upTo: 767, src: 'assets/video/bg-mobile.mp4' },
    { upTo: 1279, src: 'assets/video/bg-tablet.mp4' },
    { upTo: Infinity, src: 'assets/video/bg-desktop.mp4' },
];

function applySource() {
    const src = SOURCES.find((s) => window.innerWidth <= s.upTo).src;
    if (video.getAttribute('src') === src) return;
    video.setAttribute('src', src);
    video.load();
}

applySource();

// Xoay máy / đổi cỡ cửa sổ thì đổi lại video, nhưng chỉ khi chưa bấm Khám phá
window.addEventListener('resize', () => {
    if (!started) applySource();
});

// Nhạc nền: vào bằng cú bấm của người dùng nên được phép có tiếng.
// Tăng âm dần trong 2.5s cho đỡ giật mình, giữ ở mức vừa phải.
const music = document.getElementById('bg-music');
const MUSIC_VOLUME = 0.65;
const FADE_MS = 2500;

function startMusic() {
    music.volume = 0;
    music.play().catch(() => {});

    const step = 50;
    const timer = setInterval(() => {
        const next = music.volume + MUSIC_VOLUME * step / FADE_MS;
        if (next >= MUSIC_VOLUME) {
            music.volume = MUSIC_VOLUME;
            clearInterval(timer);
        } else {
            music.volume = next;
        }
    }, step);
}

playBtn.addEventListener('click', () => {
    if (started) return;
    started = true;
    playBtn.disabled = true;

    // Ẩn toàn bộ chữ để chỉ còn video
    intro.classList.add('opacity-0', 'pointer-events-none');

    startMusic();

    video.play().catch(() => {});
});

// Hết video thì dừng hẳn ở khung hình cuối và thả phong thư xuống
const envDrop = document.getElementById('env-drop');
const envMove = document.getElementById('env-move');
const flap = document.getElementById('flap');
const letterClip = document.getElementById('letter-clip');
const letter = document.getElementById('letter');
const hint = document.getElementById('hint');
const paperLayers = envMove.querySelectorAll('[data-paper]');

// Khoảng tụt xuống của phong bì để lá thư trồi lên xong nằm đúng giữa màn hình:
//   D = (chiều cao thân + chiều cao lá thư) / 2
//     = (0.71274 + 0.90398) / 2 * env-w = 0.8085 * env-w
const DROP = 'calc(var(--env-w) * .8085)';

let landed = false;
let opened = false;
let autoOpen = false;

const DROP_MS = 2100; // khớp với animation dropIn

function dropEnvelope() {
    // Giữ nguyên opacity-0: keyframe dropIn tự điều khiển opacity nên không bị loé một khung hình
    envDrop.classList.add('animate-drop-in');
    // Timer dự phòng: nếu vì lý do gì đó animationend không phát ra
    // (class sinh muộn, tab chạy nền…) thì phong thư vẫn bấm được.
    setTimeout(land, DROP_MS + 250);
}

// Rơi xong thì chuyển sang đung đưa nhẹ và cho phép bấm mở
function land() {
    if (landed) return;
    landed = true;
    envDrop.classList.remove('opacity-0', 'animate-drop-in');
    envDrop.classList.add('animate-sway');
    envMove.classList.add('pointer-events-auto', 'cursor-pointer');
    hint.classList.remove('opacity-0');
    if (autoOpen) setTimeout(open, 300);
}

video.addEventListener('ended', () => {
    video.pause();
    dropEnvelope();
}, { once: true });

envDrop.addEventListener('animationend', (e) => {
    if (e.animationName === 'dropIn') land();
});

envMove.addEventListener('click', open);

function open() {
    if (!landed || opened) return;
    opened = true;
    hint.classList.add('opacity-0');
    envMove.classList.remove('cursor-pointer');
    envDrop.classList.remove('animate-sway');

    // 1) Nắp bật lên
    flap.style.transform = 'translate(-14.583%, -54.297%) rotateX(0deg)';

    // 2) Phong bì tụt xuống, lá thư trồi lên khỏi miệng thư
    setTimeout(() => {
        envMove.style.transform = `translateY(${DROP})`;
        letter.style.transform = 'translate(-50%, 0)';
    }, 700);

    // 3) Giấy phong bì mờ dần, chỉ còn lại lá thư
    setTimeout(() => {
        paperLayers.forEach((el) => (el.style.opacity = '0'));
    }, 1500);

    // 4) Thư đã ra hẳn -> bỏ vùng cắt rồi phóng to cho dễ đọc
    setTimeout(() => {
        letterClip.classList.remove('overflow-hidden');
        letter.style.transform = 'translate(-50%, 0) scale(var(--letter-zoom))';
    }, 2300);

    // 5) Đọc thư chừng 3s rồi mới hỏi (2300 mở + 1500 phóng to + 3000 đọc)
    setTimeout(askRefuse, 2300 + 1500 + 3000);
}

// ---- Hộp thoại ----
const dialogLayer = document.getElementById('dialog-layer');
const dialogBox = document.getElementById('dialog');
const dialogText = document.getElementById('dialog-text');
const dialogActions = document.getElementById('dialog-actions');

const BTN_BASE = 'font-display text-[11px] uppercase tracking-[.28em] px-6 py-3 border transition '
    + 'duration-300 sm:text-xs';
const BTN_STYLE = {
    nhat: BTN_BASE + ' border-[#d9bda6] text-[#8a7059] hover:bg-[#f0e4d6]',
    dam: BTN_BASE + ' border-[#b0836f] bg-[#b0836f] text-[#fdfaf3] hover:bg-[#9a6f5c]',
};

function openDialog(text, buttons) {
    dialogText.textContent = text;
    dialogActions.replaceChildren(...buttons.map((b) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = BTN_STYLE[b.kieu || 'nhat'];
        el.textContent = b.chu;
        el.addEventListener('click', b.khiBam);
        return el;
    }));
    dialogLayer.classList.remove('opacity-0', 'pointer-events-none');
    dialogBox.classList.remove('scale-95');
}

function closeDialog() {
    dialogLayer.classList.add('opacity-0', 'pointer-events-none');
    dialogBox.classList.add('scale-95');
}

function askRefuse() {
    openDialog('Bạn có muốn từ chối cuộc hẹn này không?', [
        { chu: 'Có', kieu: 'nhat', khiBam: showMaintenance },
        { chu: 'Không', kieu: 'dam', khiBam: closeDialog },
    ]);
}

function showMaintenance() {
    openDialog('Chức năng từ chối đang được bảo trì, vui lòng thử lại sau.', [
        { chu: 'Đành vậy', kieu: 'dam', khiBam: closeDialog },
    ]);
}

// Chặn mọi lệnh play khác (kể cả trình duyệt tự khôi phục) khi chưa bấm nút hoặc đã xem xong
video.addEventListener('play', () => {
    if (!started || video.ended) video.pause();
});

// Đồng hồ đếm ngược tới giờ hẹn.
// Lưu ý: tháng trong JS đếm từ 0, nên 7 = tháng 8. Đây là 19:00 ngày 01/08/2026,
// trùng mốc "Anh đón em" ở đầu lịch trình — đổi giờ hẹn thì sửa ngay dòng dưới.
const HEN = new Date(2026, 7, 1, 19, 0, 0);
const countdown = document.getElementById('countdown');
const countdownDone = document.getElementById('countdown-done');
const cdCells = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s'),
};
let cdTimer;

function tickCountdown() {
    const ms = HEN - Date.now();
    if (ms <= 0) {
        countdown.classList.add('hidden');
        countdownDone.classList.remove('hidden');
        clearInterval(cdTimer);
        return;
    }
    const s = Math.floor(ms / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    cdCells.d.textContent = pad(Math.floor(s / 86400));
    cdCells.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cdCells.m.textContent = pad(Math.floor((s % 3600) / 60));
    cdCells.s.textContent = pad(s % 60);
}

tickCountdown();
cdTimer = setInterval(tickCountdown, 1000);

// Phím tắt lúc chỉnh giao diện: ?skip bỏ qua video, ?open mở luôn thư, ?nobg tắt nền
const q = new URLSearchParams(location.search);
if (q.has('nobg')) video.style.display = 'none';
if (q.has('skip') || q.has('open')) {
    started = true;
    intro.classList.add('opacity-0', 'pointer-events-none');
    autoOpen = q.has('open');
    dropEnvelope();
}
