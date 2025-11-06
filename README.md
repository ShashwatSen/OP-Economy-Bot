---

# 🏴‍☠️ OP Economy Bot

A **One Piece–themed Discord economy bot** built in **JavaScript** that brings the thrill of treasure hunting, bounty collection, and pirate adventures to your Discord server!
Created with ❤️ by **Shashwat Sen**.

---

## ⚙️ Features

* 🪙 **Dynamic Economy System** – Earn, spend, and manage your Berries!
* ⚔️ **Bounties & Battles** – Challenge other pirates or claim their bounty.
* 🏝️ **Treasure Hunts** – Explore islands for hidden treasures and rare loot.
* 👒 **One Piece Theme** – Custom visuals, commands, and events inspired by the anime.
* 📊 **Leaderboards & Profiles** – Show off your wealth and pirate status.
* 💬 **Interactive Commands** – Fully Discord Slash Command–compatible.

---

## 📁 Project Structure

```
OP-Economy-Bot/
├─  Build/
│    ├── config/
│    │   ├── abilities.json
│    │   ├── animals.json
│    │   ├── armors.json
│    │   ├── config.json
│    │   ├── dungeonkeys.json
│    │   ├── misc.json
│    │   ├── weapons.json
│    │
│    ├── commands/
│    │   ├── economy/
│    │   │   ├── blackjack.js
│    │   │   ├── buy.js     
│    │   │   ├── cash.js    
│    │   │   ├── coinflip.js
│    │   │   ├── give.js   
│    │   │   ├── shop.js   
│    │   │   └── slot.js   
│    │   │
│    │   ├── owner/
│    │   │   └── eval.js
│    │   │
│    │   ├── pets/
│    │   │   ├── autohunt.js
│    │   │   ├── battle.js
│    │   │   ├── hunt.js
│    │   │   ├── sell.js
│    │   │   ├── tame.js     
│    │   │   └── zoo.js
│    │   │
│    │   ├── ranking/
│    │   │   └── leaderboard.js
│    │   │
│    │   ├── owner/
│    │   │   └── eval.js
│    │   │
│    │   └── utility/
│    │       ├── help.js
│    │       ├── inventory.js
│    │       └── prefix.js
│    │
│    └─ utils/
│       ├── databaseTemplate.js
│       ├── dbsetup.js
│       └── verifyUser.js
│
├── LICENSE
├── README.md
├── package-lock.json    
├── package.json
├── .env
└── pnpm-lock.yaml
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ShashwatSen/OP-Economy-Bot.git
cd OP-Economy-Bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Bot

FIll the `config.json` file in the config directory

### 4. Run the Bot

```bash
node build/index.js
```

---

## 💡 Usage

Once the bot is online, use slash commands like:

```
op cash
op daily
op fight [@opponent]
```

to begin your pirate adventure!

---

## 🧠 Technologies Used

* **Node.js**
* **Discord.js v14**
  
---

## 🏗️ Future Plans

* 🗺️ Dungeon exploration system
* 🧭 Crew and alliance creation
* 🏦 OP Bank and trading
* 🎯 Events and timed missions

---

## 👑 Credits

Developed by **Shashwat Sen**
Inspired by *One Piece* by Eiichiro Oda.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---
