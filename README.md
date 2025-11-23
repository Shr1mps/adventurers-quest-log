# FoundryVTT - Adventurer's Quest Log

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Shr1mps/adventurers-quest-log?style=for-the-badge&label=Forien%27s+Quest+Log+version)
![GitHub release](https://img.shields.io/github/release-date/Shr1mps/adventurers-quest-log?style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FForien%2Ffoundryvtt-forien-quest-log%2Fmaster%2Fmodule.json&label=Foundry%20Min%20Version&query=$.compatibility.minimum&colorB=orange&style=for-the-badge)
![Foundry Core Verified Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FForien%2Ffoundryvtt-forien-quest-log%2Fmaster%2Fmodule.json&label=Foundry%20Verified&query=$.compatibility.verified&colorB=orange&style=for-the-badge)
![License](https://img.shields.io/github/license/Shr1mps/adventurers-quest-log?style=for-the-badge)
![Zip Downloads](https://img.shields.io/github/downloads/Shr1mps/adventurers-quest-log/latest/module.zip?style=for-the-badge)
[![GitHub commits](https://img.shields.io/github/commits-since/Shr1mps/adventurers-quest-log/latest?style=for-the-badge)](https://github.com/Shr1mps/adventurers-quest-log/commits/)
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fforien-quest-log&style=for-the-badge)      
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white&link=https%3A%2F%2Fdiscord.gg%2FXkTFv8DRDc)](https://discord.gg/XkTFv8DRDc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/foundryworkshop)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/forien)

[![Translation status](https://hosted.weblate.org/widget/foriens-quest-log/287x66-black.png)](https://hosted.weblate.org/engage/foriens-quest-log/)

This module provides comprehensive Quest Log system for players and Game Masters to use with [Foundry VTT](https://foundryvtt.com/).

### Compatibility

| Foundry Version | Module Version |
|-----------------|----------------|
| v13             | v0.9.*         |
| v12             | v0.8.*         |
| v11             | v0.8.*         |

### Game Systems
_any_

### Language Translations: see [#translations](#translations)

## Installation

1. (Recommended) Install Adventurer's Quest Log from the Foundry package manager directly. 
   - _or_ manually using the manifest URL: `https://github.com/Shr1mps/adventurers-quest-log/releases/latest/download/module.json`


2. While loaded in your World, enable **_Adventurer's Quest Log_** in the `Module Management` configuration. 

## Recent Updates

The major `0.9.0` update to AQL:

- Foundry v13 support.
- "Jump To Pin" Context Menu option.
- Added Keybindings
  - `openQuestLog` (default: `CTRL+Q`) — Opens Quest Log (if GM or not hidden)
  - `openPrimaryQuest` (default: `CTRL+SHIFT+Q`) — Opens Primary Quest (if any)
  - `toggleQuestTracker` (default: `CTRL+ALT+Q`) — Toggles the Quest Tracker

## Usage

A button to access the Quest Log is situated on the bottom of Journal Directory or in the left hand scene controls icon 
toolbar under notes / journal entries where two new icons (scroll and list) opens the Quest Log and Quest Tracker. There
also are two `macro compendiums` available for AQL that provide ready to go macros to drop onto your hotbar that allow
convenient access to AQL for players and several GM related options.

There is a series of useful [in-depth video tutorials on YouTube](https://www.youtube.com/playlist?list=PLHslnNa8QKdD_M29g_Zs0f9zyAUVJ32Ne) 
that cover the `0.7 - 0.8` releases.

AQL is quite user-friendly with an intuitive UI, however you might want to [check out the Wiki](https://github.com/Shr1mps/adventurers-quest-log/wiki) for more detailed usage including macros and Quest API details for external developers integrations. 

## Features

- Quest Log windows that lists all quests divided into `In Progress`, `Completed` and `Failed` tabs.
- Quest creator with WYSIWYG editors for description and GM notes.
- Quest objectives.
- Draggable Item rewards.
- Fully editable Quest Details window.
- Personal Quests.
- Quest Branching in the form of Sub Quests.

## About

AQL is being updated for stability across core Foundry updates. This stability and long term maintenance of such is 
the _main feature_ of AQL presently. You can rest assured that the quest log experience you know and _love_ will 
continue to be available now and into the future.

## Translations

AQL uses Weblate to coordinate language translation from community translators. Through this interface you are able to
provide language corrections and translations. I am more than willing to support even more language translations for
AQL, so if your language isn't represented yet please visit the [AQL Weblate Portal](https://hosted.weblate.org/projects/foriens-quest-log/)
and get in contact.

The following Translations are available:

| Language                           | Last updated version |
|------------------------------------|----------------------|
| Chinese (simplified / traditional) | v0.8                 |
| Dutch                              | v0.8                 |
| English                            | v0.9                 |
| Finnish                            | v0.8                 |
| French                             | v0.8                 |
| German                             | v0.8                 |
| Italian                            | v0.8                 |
| Japanese                           | v0.8                 |
| Korean                             | v0.8                 |
| Polish                             | v0.8                 |
| Portuguese (Brazil)                | v0.8                 |
| Russian                            | v0.8                 |
| Spanish                            | v0.8                 |
| Swedish                            | v0.8                 |

## Future plans (current ideas)

Rock solid stability through future releases of Foundry VTT and even more language / internationalization support.
At this time a few quality of life features may be added in any given release as well.

_If you think you have found a bug or usability issue with AQL itself please file an issue in the 
[AQL Issue Tracker](https://github.com/Shr1mps/adventurers-quest-log/issues)_.

## Contact

TBD

## Acknowledgments

See [Authors](https://github.com/Shr1mps/adventurers-quest-log/blob/master/AUTHORS) and
[Contributors](https://github.com/Shr1mps/adventurers-quest-log/graphs/contributors)

## Support (Historical)

Between the summer of '21 and '24 AQL was developed and maintained by Michael Leahy aka [TyphonJS](https://github.com/typhonrt) / 
[TyphonJS Discord](https://typhonjs.io/discord/). Michael took AQL from MVP to the questing powerhouse that AQL became
and maintained the package through a challenging series of Foundry core update `v0.8` through `v12`. 

## License

Adventurer's Quest Log is a module for Foundry VTT by Shr1mps and is licensed under a [MIT License](https://github.com/Shr1mps/adventurers-quest-log/blob/master/LICENSE). 

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development from February 17, 2021](https://foundryvtt.com/article/license/).
