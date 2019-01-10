**Bug: Sometimes the first "next" message after an inversal is wrong. The immediate calls (without "next:") will be correct**

**The Normal Mode version can be found here: [https://github.com/teralove/vsnm-lakan-guide](https://github.com/teralove/vsnm-lakan-guide)**

# VSHM Lakan Guide
Calls out mechanics during the fight.

Available messages:

* **Debuff (closest)**  - aka Marks/Curse
* **Spread**  - aka Circles
* **Gather + cleanse**  - aka Bombs
* **Debuff (furthest)**  - aka Marks/Curse
* **Gather**  - aka Circles
* **Gather + no cleanse**  - aka Bombs
* **Get out**  - for Begone! (Purple)
* **Get in**  - for Begone! (Red/Orange)
* **Ring soon, get ready to dodge**  - a warning for soul mechanic incoming
* **plague/regress**  - for the shield when entering Velik's soul
* **sleep**  - for the shield when exiting Velik's soul


### Chat commands:
* **vs** - Toggles the module off/on (On by default)
* **vs pt** - Toggles sending messages to party/yourself (only yourself is default)

### Info:
* You can disable "next" messages by setting the variable 'showNextMechanicMessage' to false
* You can disable shield time warnings by setting the variable 'showShieldWarnings' to false
* You can disable the Begone messages by setting the variable 'showBegoneMessages' to false


### Known Issues:
* Joining an in-progress fight (as in, relogging on from a disconnect) will probably screw something up or throw errors.
* Sometimes the first next message after an inversal is wrong

## Changelog
### 1.1
 patch 79 (not tested yet)
### 1.0.3
* [+] Fixed: showNextMechanicMessage would still show messages following a dungeon message.
### 1.0.2
* [+] Fixed: If the party wiped, some messges could be wrong on the following fight attempts.
### 1.0.1
* [+] Added followup hint (sleep, plague/regress) to the ring/shield warning messages.
