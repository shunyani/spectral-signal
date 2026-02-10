# 👻 Spectral Signal

**A daily persistent puzzle game built for Reddit.**
*Find the ghost. Keep your streak alive. Build your own traps.*

## 📖 Overview

**Spectral Signal** is a logic puzzle platform where players compete globally to locate a hidden "Ghost" on a grid. You must rely on **Signal Strength** to deduce the target's location.

It features two distinct layers of gameplay:
1.  **The Daily Signal:** Every day at **00:00 UTC**, a global puzzle generates. Everyone hunts the exact same ghost.
2.  **Community Contracts:** Players who prove their skill can design and post their own custom levels for the community to solve.

## 🕹️ How to Play

### The Objective
Tap tiles to scan for the ghost. Your scanner returns a **Signal Integrity** percentage (0-100%):

- **0%**: Cold. The ghost is far away.
- **100%**: **Target Acquired.** You win!

### 📡 Signal Decryption (Color Guide)
The tile color changes based on how close you are to the ghost:
- **Fuchsia**: **1 Step away.**
- **Pink**: **2 Steps away.**
- **Bright Blue**: **3-4 Steps away.**
- **Dark Navy**: **5-6 Steps away.**
- **Black**: **7+ Steps away (Wrong sector).**

### ⚔️ Game Modes (Daily & Custom)

| Mode | Grid | Difficulty | Mechanics |
|:---:|:----:|:---:|:---|
| **Scout** | 6x6 | Easy | Unlimited moves. Pure logic. |
| **Ranger** | 8x8 | Medium | **SPEEDRUN.** You have a strict **Move Limit**. Find the ghost before the battery dies. |
| **Elite** | 8x8 | Hard | **SURVIVAL.** The grid is filled with invisible mines. Hitting one is instant Game Over. |

---

## 🏗️ Creator Mode (New!)

**Become the Architect.**
Winning a Daily Game grants you clearance to **create your own challenge**.

1.  **Win a Daily Game:** Prove your skill to unlock the editor.
2.  **Design the Trap:**
    * **Scout:** Hide the ghost in a tricky spot.
    * **Ranger:** Set a custom **Move Limit** (e.g., "Can you find it in 3 moves?").
    * **Elite:** Crank up the **Mine Density** (from 10 to 25 mines) to create "Impossible" levels.
3.  **Publish:** The app automatically generates a **new Reddit Post** with your challenge.
4.  **Bounty System:** Other players earn **"Contracts Completed"** stats by solving your puzzles.

---

## 🏆 Features

### 🔥 Daily Streak System
The game tracks your consistency on the Daily Puzzle
- **Win a game** to start or extend your streak
- **Miss a day**, and your streak resets to **0**
- *Powered by Redis persistence to ensure streaks survive across sessions*

### 🌍 Global Leaderboards
Compete against other Redditors for the lowest number of attempts
- Leaderboards reset daily
- Separate rankings for Streak Length and Daily Efficiency

## 📜 CONTRACTS & COMMUNITY CHALLENGES

**Create Your Own Trap:** After playing, use the Level Editor to hide a ghost, set custom constraints (Move Limits or Mine Density), and post it to the subreddit.

**Earn Contracts:** Every time you solve a puzzle created by another Agent, you earn a Contract.

---

## 🛠️ Tech Stack

Built using the **Reddit Developer Platform (Devvit)**

- **Frontend:** Devvit UI (Blocks, ZStack, VStack)
- **Backend:** Devvit Redis Plugin (Data Persistence)
- **Language:** TypeScript
- **State Management:** `useAsync` for real-time DB syncing

### Key Technical Implementations

1.  **Dynamic UGC Engine:**
    * Uses `reddit.submitPost` to generate challenge threads
    * Custom levels are serialized (JSON) and stored in Redis using the `postId` as the key
    * Opening a challenge post hot-loads a custom "Mission Briefing" UI instead of the standard menu

2.  **Shared Daily Seed:**
    * Uses `Math.random()` seeded by the UTC Date to ensure every player gets the exact same puzzle layout for the Daily Challenge

3.  **Granular Heatmap Logic:**
    * Calculates Euclidean distance `d = sqrt((x2 - x1)^2 + (y2 - y1)^2)` to generate precise feedback.

4.  **Atomic Streak Logic:**
    * Validates "Yesterday vs. Today" timestamps server-side to prevent streak manipulation.