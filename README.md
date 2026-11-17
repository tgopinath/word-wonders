# Word Wonders — English Vocabulary Builder

An animated vocabulary app for children aged 3–10. React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What works today (Phase 1–2 complete, parts of 3–5)

- **First learning journey, end to end:** Home → Fruits → Apple → tap the animated apple → pronunciation → word, meaning, example sentence, picture story → Listen & repeat → Quick check → Find the Object game → Results → stars, lesson bonus, badges.
- 25 categories, 314 words (24 × 12 + 26 letters), 3 levels, lessons of 6 words.
- 24 animation types; custom SVG art for Apple (bites) and Banana (peels); emoji art with per-word animations and effects (split, roar rings, water spray, bubbles, sparkles) for every other word.
- Audio service: speech synthesis today, recorded clips later (`audioSrc`), slow mode, replay, waveform.
- Find the Object (lesson mode + spaced-repetition revision mode).
- Progress in localStorage: stars, streaks, favorites, recent words, Leitner boxes, quiz accuracy, time per day, 10 badges.
- Explore with search by word, category and first letter; Favorites; My Learning; Parent area (math gate, multiple child profiles, preferences, daily limit, stats, tricky words, reset).

## Not built yet

Listen and Identify, Match the Word (drag and drop), Spell the Word, and the ten mini-games are listed in Games as "Coming soon". Also still to do: avatar accessories and unlockable backgrounds, offline service worker, code splitting, Three.js/Lottie assets.

## Structure

```
src/
  types.ts                 VocabItem, Category, Lesson
  data/                    categories, compact word rows → vocabulary, lessons, badges, games, repository
  services/                audio (pronunciation), sfx (Web Audio), progress (model, storage, spaced repetition)
  state/ProgressProvider   React context: all progress actions + badge awards
  animations/              animation configs per AnimType (idle + action)
  art/                     custom animated SVG assets
  components/              AnimatedObject, cards, buttons, nav, celebration
  games/                   game logic (pure) + game screens
  screens/                 Home, Explore, CategoryGallery, WordDetail, Games, MyLearning, Favorites, Parent
```

To add a word, append a row to `src/data/words.ts`. To add recorded audio, set `audioSrc` on the item; the service plays it first and falls back to speech.
