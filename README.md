# 👻 Spectral Signal

**A daily persistent puzzle game built for Reddit.** *Find the ghost. your streak alive.*

## 📖 Overview

**Spectral Signal** is a daily logic puzzle where players compete globally to locate a hidden "Ghost" on a grid. You must rely on **Signal Strength** to deduce the target's location.

Every day at **00:00 UTC**, the ghost moves to a new location. The entire subreddit shares the same daily seed, meaning everyone is hunting the exact same ghost.

## 🕹️ How to Play

### The Objective
Tap tiles to scan for the ghost. Your scanner returns a **Signal Integrity** percentage (0-100%):

- **0%**: Cold. The ghost is far away.
- **100%**: **Target Acquired.** You win!

### 📡 Signal Decryption (Color Guide)
The tile color changes based on how close you are to the ghost:
-  **fuchsia** : **1 Step away.**
-  **pink** : **2 Steps away**
-  **bright blue**: **3-4 Steps away**
- **dark navy:**  **5-6 Steps away** 
-  **black**: **7+ Steps away Wrong sector.** 

### ⚔️ Game Modes

| Mode       | Grid | Difficulty | Mechanics |
|:---:|:----:|:---:|:---|
| **Scout**  | 6x6  | Easy | Unlimited moves. Good for learning the game. |
| **Ranger** | 8x8  | Medium | **MOVE LIMIT.** You only have **7 Moves**. Find the ghost   before you run out. |
| **Elite**  | 8x8  | Hard | **HIDDEN BOMBS.** The grid is filled with 11 invisible mines. Hitting one is instant Game Over. |

---

## 🏆 Features

### 🔥 Daily Streak System
The game tracks your consistency.
- **Win a game** to start or extend your streak.
- **Miss a day**, and your streak resets to **0**.
- *Powered by Redis persistence to ensure streaks survive across sessions.*

### 🌍 Global Leaderboards
Compete against other Redditors for the lowest number of attempts.
- Leaderboards reset daily.
- Separate rankings for Streak Length and Daily Efficiency.

---

## 🛠️ Tech Stack

Built using the **Reddit Developer Platform (Devvit)**.

- **Frontend:** Devvit UI (Blocks, ZStack, VStack)
- **Backend:** Devvit Redis Plugin (Data Persistence)
- **Language:** TypeScript
- **State Management:** `useAsync` for real-time DB syncing.

### Key Technical Implementations
1.  **Shared Daily Seed:** Uses `Math.random()` seeded by the UTC Date to ensure every player gets the exact same puzzle layout for the day.
2.  **Granular Heatmap Logic:** Calculates Euclidean distance between the tap and the ghost to generate precise "percentage" feedback.
3.  **Atomic Streak Logic:** Validates "Yesterday vs. Today" timestamps server-side to prevent streak manipulation.

---
