# My AI Pet - BNB Chain DApp

## Overview
"My AI Pet" is a cyberpunk-themed Single Page Application where users own NFT pets on BNB Chain. Each pet has a unique crypto personality and comes alive through AI-powered chat using Google Gemini.

## Current State
- MVP complete with Landing, Dashboard, and Chat views
- Gemini AI integration for in-character pet conversations
- Hybrid entry: Real wallet connection (MetaMask/BNB Chain) OR Demo mode (no gas)
- Generated placeholder pet images (user can replace with their own in /public/)
- Series 2 "Coming Soon" section with mystery cards on dashboard
- All 5 pets have looping companion videos in chat

## Architecture
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, wouter for routing
- **Backend**: Express server with `/api/chat` SSE streaming endpoint
- **AI**: Gemini 2.5 Flash via Replit AI Integrations (no API key needed)
- **Blockchain**: ethers.js for MetaMask wallet connection, BNB Chain (chainId 56), ERC-721 ownerOf checks
- **Theme**: Cyberpunk/Neo-Fintech, pure black (#000000), BNB Yellow (#F0B90B), dark mode forced

## Key Files
- `client/src/data/pets.ts` - Pet data with `personality` (AI) and `uiDescription` (dashboard cards)
- `client/src/lib/contract.ts` - Wallet connection, BNB chain switching, ownerOf checks, mint function
- `client/src/pages/landing.tsx` - Landing page with Connect Wallet + Demo Mode buttons
- `client/src/pages/dashboard.tsx` - Pet grid (locked/unlocked), Series 2 Coming Soon, footer status
- `client/src/pages/chat.tsx` - Chat interface with video background + AI
- `client/src/components/pet-companion.tsx` - Draggable animated pet companion with looping video
- `client/src/App.tsx` - Root component with dual-mode state management (wallet vs demo)
- `server/routes.ts` - Gemini chat API with pet personalities
- `server/petData.ts` - Server-side pet personality data for AI

## Pet Data
1. Dr. Fundamental (Dog) - Cynical scholar, hates shitcoins
2. Degen Ferret (Ferret) - Unhinged degen, loves memecoins
3. FOMO Goat (Goat) - Panicky buyer, always buys the top
4. WAGMI Fox (Fox) - Wholesome community builder
5. Dr. FUD (Cat) - Everything is a scam, bear market lover

## Contract
`0x8019919bAd00C6Fd5b98817f854e2C8824334FAf`

## Entry Modes
- **Connect Wallet**: MetaMask -> BNB Chain -> checks ownerOf for token IDs 1-5 -> owned pets unlocked
- **Demo Mode**: All 5 pets unlocked instantly, no wallet needed
- Dashboard footer shows mode: green dot (Live on BNB Chain) or orange dot (Demo Mode)

## Notes
- Pet cards show `uiDescription` (3rd person), AI uses `personality` (system prompt)
- Video files (.mp4) in /public/ for each pet (dog, ferret, goat, fox, cat companion videos)
- No database needed - chat is ephemeral, pet data is hardcoded
- Disconnect clears all wallet state and session storage
