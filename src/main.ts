import { createIcons, Heart, Pause, Play, RotateCcw, SkipForward, Star, Zap } from 'lucide';
import './styles.css';
import { bootstrapApp } from './app';

bootstrapApp().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup failure';
  document.body.innerHTML = `<main class="fatal"><h1>Avida Digital Evolution</h1><p>${message}</p></main>`;
});

createIcons({
  icons: {
    Heart,
    Pause,
    Play,
    RotateCcw,
    SkipForward,
    Star,
    Zap,
  },
});
