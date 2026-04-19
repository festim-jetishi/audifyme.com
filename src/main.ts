import './style.css'

/* =========================================================================
   AUDIFYME � DARK CINEMATIC ANIMATIONS + VOICE PLAYER
   ========================================================================= */

// 1. Initial Load Animations
window.addEventListener('DOMContentLoaded', () => {
    const heroReveals = document.querySelectorAll('.hero-section .reveal-up, .hero-section .reveal-scale, .nav-pill');
    setTimeout(() => {
        heroReveals.forEach(el => {
            el.classList.add('is-visible');
        });
    }, 100);
});

// 2. Scroll Intersection Observers
const scrollReveals = document.querySelectorAll(
    '.voice-showcase .reveal-up, .story-immersion .reveal-up, .voice-synthesis-premium .reveal-up, .iu-header.reveal-up, .iu-interactive-zone.reveal-up, .cta-section.reveal-up, .conversion-node, .engine-caption'
);

const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

scrollReveals.forEach(el => {
    scrollObserver.observe(el);
});

// 3. Subtle Mouse Parallax on Mascot
const heroSection = document.querySelector('.hero-section');
const mascot = document.querySelector('.mascot-wrapper') as HTMLElement;

if (heroSection && mascot) {
    heroSection.addEventListener('mousemove', (e: any) => {
        const x = (window.innerWidth / 2 - e.pageX) / 50;
        const y = (window.innerHeight / 2 - e.pageY) / 50;
        mascot.style.transform = `translateY(${-8 + y}px) rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
    });

    heroSection.addEventListener('mouseleave', () => {
        mascot.style.transform = '';
    });
}

// 4. Interactive Voice Showcase Player
let currentAudio: HTMLAudioElement | null = null;
let currentCard: HTMLElement | null = null;

const pauseIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
const playIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.href);

function resolveVoiceSrc(voiceSrc: string) {
    if (!voiceSrc.startsWith('/')) {
        return voiceSrc;
    }

    return new URL(voiceSrc.slice(1), appBaseUrl).toString();
}

function stopCurrentPlayback() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if (currentCard) {
        currentCard.classList.remove('is-playing');
        const btn = currentCard.querySelector('.vc-play');
        if (btn) btn.innerHTML = playIcon;
        currentCard = null;
    }
}

document.querySelectorAll('.voice-card').forEach(card => {
    const voiceSrc = card.getAttribute('data-voice');
    const playBtn = card.querySelector('.vc-play');

    const handlePlay = () => {
        if (!voiceSrc) return;

        // If this card is already playing, stop it
        if (currentCard === card) {
            stopCurrentPlayback();
            return;
        }

        stopCurrentPlayback();
        stopImmersionPlayback(); // Also stop the story immersion if playing

        // Play this card
        const audio = new Audio(resolveVoiceSrc(voiceSrc));
        currentAudio = audio;
        currentCard = card as HTMLElement;

        card.classList.add('is-playing');
        if (playBtn) playBtn.innerHTML = pauseIcon;

        audio.play().catch(() => {
            stopCurrentPlayback();
        });

        audio.addEventListener('ended', () => {
            stopCurrentPlayback();
        });
    };

    // Click on whole card or play button
    card.addEventListener('click', handlePlay);
});

// 5. Story Immersion Player
let immersionAudio: HTMLAudioElement | null = null;
let currentImmersionBtn: HTMLElement | null = null;
let animationFrameId: number | null = null;

const immersionBgGlow = document.querySelector('.immersion-bg-glow') as HTMLElement;
const passageText = document.querySelector('.passage-text') as HTMLElement;
const liveVisualizer = document.querySelector('.live-visualizer') as HTMLElement;
const wordSpans = passageText ? passageText.querySelectorAll('span') : [];

function stopImmersionPlayback() {
    if (immersionAudio) {
        immersionAudio.pause();
        immersionAudio.currentTime = 0;
        immersionAudio = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (currentImmersionBtn) {
        currentImmersionBtn.classList.remove('active');
        currentImmersionBtn.style.removeProperty('--active-color');
        currentImmersionBtn = null;
    }
    if (immersionBgGlow) {
        immersionBgGlow.style.opacity = '0.05';
        immersionBgGlow.style.background = 'radial-gradient(circle, var(--accent-teal) 0%, transparent 60%)';
    }
    if (passageText) {
        passageText.classList.remove('is-reading');
        passageText.style.removeProperty('--active-color');
        wordSpans.forEach(span => span.classList.remove('active', 'past'));
    }
    if (liveVisualizer) {
        liveVisualizer.classList.remove('active');
    }
}

function updateWordHighlight() {
    if (!immersionAudio || !wordSpans.length) return;

    // Simulate pacing: divide total duration by number of words
    // We use a slight offset so it feels more natural
    const duration = immersionAudio.duration || 10; // Fallback to 10s if not loaded yet
    const currentTime = immersionAudio.currentTime;
    const timePerWord = duration / wordSpans.length;

    // Calculate which word we should be on
    let currentWordIndex = Math.floor(currentTime / timePerWord);

    // Bounds check
    if (currentWordIndex >= wordSpans.length) {
        currentWordIndex = wordSpans.length - 1;
    }

    // Update classes
    wordSpans.forEach((span, index) => {
        if (index < currentWordIndex) {
            span.classList.remove('active');
            span.classList.add('past');
        } else if (index === currentWordIndex) {
            span.classList.add('active');
            span.classList.remove('past');
        } else {
            span.classList.remove('active', 'past');
        }
    });

    if (!immersionAudio.paused) {
        animationFrameId = requestAnimationFrame(updateWordHighlight);
    }
}

document.querySelectorAll('.immersion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const voiceSrc = btn.getAttribute('data-voice');
        const color = btn.getAttribute('data-color');

        if (!voiceSrc || !color) return;

        if (currentImmersionBtn === btn) {
            stopImmersionPlayback();
            return;
        }

        stopImmersionPlayback();
        stopCurrentPlayback(); // Also stop carousel player if playing

        immersionAudio = new Audio(resolveVoiceSrc(voiceSrc));
        currentImmersionBtn = btn as HTMLElement;

        btn.classList.add('active');
        (btn as HTMLElement).style.setProperty('--active-color', color);

        if (immersionBgGlow) {
            immersionBgGlow.style.opacity = '0.15';
            immersionBgGlow.style.background = `radial-gradient(circle, ${color} 0%, transparent 60%)`;
        }

        if (passageText) {
            passageText.classList.add('is-reading');
            passageText.style.setProperty('--active-color', color);
        }

        if (liveVisualizer) {
            liveVisualizer.classList.add('active');
            liveVisualizer.style.setProperty('--accent-teal', color);
        }

        // Wait for metadata to load so we know the duration before animating words
        immersionAudio.addEventListener('loadedmetadata', () => {
            // Reset spans
            wordSpans.forEach(span => span.classList.remove('active', 'past'));
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            // Start playback and animation
            immersionAudio?.play().then(() => {
                animationFrameId = requestAnimationFrame(updateWordHighlight);
            }).catch(() => stopImmersionPlayback());
        });

        // Trigger load
        immersionAudio.load();

        immersionAudio.addEventListener('ended', stopImmersionPlayback);
    });
});

// 5. Voice Synthesis Showcase Animation
const prompts = [
    { text: "A grumpy 60-year-old dwarven blacksmith who's had one too many ales.", prefix: "DWF", color: "#7f9b6d" },
    { text: "A charismatic former wrestler with a gravel voice who calls people 'jabroni'.", prefix: "RCK", color: "#c9a87a" },
    { text: "A soft-spoken British narrator describing a lion hunt on the savanna.", prefix: "NAT", color: "#8fa878" },
    { text: "A turtleneck-wearing tech founder announcing the next big thing. One more thing...", prefix: "SVJ", color: "#f59e0b" },
    { text: "A gap-toothed late-night host doing a sleepy bedtime monologue.", prefix: "LNT", color: "#ef4444" }
];

const vsTypingText = document.getElementById('vsTypingText');
const vsModelId = document.getElementById('vsModelId');
const vsStatusText = document.getElementById('vsStatusText');
const vsWaveformContainer = document.getElementById('vsWaveformContainer');
const vsWaveform = document.getElementById('vsWaveform');

// Initialize dense waveform
if (vsWaveform) {
    for (let i = 0; i < 70; i++) {
        const span = document.createElement('span');
        span.style.animationDelay = `${Math.random() * 1.5}s`;
        vsWaveform.appendChild(span);
    }
}

let promptIndex = 0;

function generateRandomId(prefix: string) {
    const hex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    return `#${prefix}_${hex}`;
}

async function typePrompt(text: string) {
    if (!vsTypingText) return;
    vsTypingText.textContent = '';

    // Quick typing effect
    for (let i = 0; i < text.length; i++) {
        vsTypingText.textContent += text[i];
        await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
    }
}

async function runSynthesisLoop() {
    if (!vsTypingText || !vsModelId || !vsStatusText || !vsWaveform || !vsWaveformContainer) return;

    const currentPrompt = prompts[promptIndex];

    // Reset state
    vsWaveform.classList.remove('is-speaking');
    vsStatusText.textContent = 'Awaiting Input...';
    vsModelId.textContent = '--';

    // Wait a beat
    await new Promise(r => setTimeout(r, 1000));

    // Type prompt
    vsStatusText.textContent = 'Analyzing Prompt...';
    await typePrompt(`"${currentPrompt.text}"`);

    // "Generate"
    vsStatusText.textContent = 'Synthesizing Model...';
    await new Promise(r => setTimeout(r, 1500));

    // "Speak"
    vsStatusText.textContent = 'Playback Active';
    vsModelId.textContent = generateRandomId(currentPrompt.prefix);

    // Update colors for this specific model
    (vsWaveformContainer as HTMLElement).style.setProperty('--accent-teal', currentPrompt.color);
    document.querySelectorAll('.vs-pulse, .vs-mac-dots span:nth-child(2)').forEach(el => {
        (el as HTMLElement).style.backgroundColor = currentPrompt.color;
        (el as HTMLElement).style.boxShadow = `0 0 12px ${currentPrompt.color}`;
    });

    vsWaveform.classList.add('is-speaking');

    // "Speak" for roughly the length of the text
    const speakingTime = Math.max(2000, currentPrompt.text.length * 60);
    await new Promise(r => setTimeout(r, speakingTime));

    // Next prompt
    promptIndex = (promptIndex + 1) % prompts.length;
    runSynthesisLoop();
}

// Start loop when section comes into view (or right away for simplicity)
setTimeout(() => {
    // Only run if we are on the page with it
    if (document.querySelector('.voice-synthesis-premium')) {
        runSynthesisLoop();
    }
}, 1000);

/* =========================================================================
   REDESIGN ADDITIONS
   ========================================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal hero content on load
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero-section .reveal-up, .hero-section .reveal-scale').forEach(el => {
        setTimeout(() => el.classList.add('is-visible'), 100);
    });
});

// Observe new sections for reveal animations
const redesignObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

document.querySelectorAll(
    '.ticker-section, .founder-section, .reviews-section, .pricing-section, .faq-section'
).forEach(el => redesignObserver.observe(el));

// Scroll progress bar
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

// Magnetic pull on .btn-large
if (!prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>('.btn-large').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            btn.style.transform = `translate(${dx / 8}px, ${dy / 8}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// iPhone narrator typewriter � cycle through voices
const narratorEl = document.getElementById('ip-narrator');
if (narratorEl && !prefersReducedMotion) {
    const narrators = ['Mom', 'Dad', 'Jack (best friend)', 'Julian (pro)', "Morgan Freeman's cousin", 'Grandma'];
    let idx = 0;
    const cycle = async () => {
        while (true) {
            await new Promise(r => setTimeout(r, 3500));
            idx = (idx + 1) % narrators.length;
            const next = narrators[idx];
            // fade out
            narratorEl.style.transition = 'opacity 0.3s';
            narratorEl.style.opacity = '0';
            await new Promise(r => setTimeout(r, 300));
            narratorEl.textContent = next;
            narratorEl.style.opacity = '1';
        }
    };
    cycle();
}

// FAQ � smooth icon rotate is via CSS. Nothing extra needed.

