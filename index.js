// vers 1.0.4

const BossId = [981, 3000]; // Lakan HM

//MessageId: BossAction
const BossMessages = {
	9981043: 1205142908,   // Lakan has noticed you.
	9981044: 1205144607,   // Lakan is trying to take you on one at a time.
	9981045: 1205142805    // Lakan intends to kill all of you at once.
};

const BossActions = {
	1205142648: {msg: '遠離'},            // Begone purple
	1205142649: {msg: '貼近'},             // Begone orange
	1205142905: {msg: '小心屁股'},     // Shield normal to inverse
	1205142906: {msg: '小心屁股'},              // Shield inverse to normal
	// 正常狀態
	1205142908: {msg: '注 視 (近)',    next: 1205144607,    prev: 1205142805},   // Debuff aka Mark
	1205144607: {msg: '閃 電 (散 開)',              next: 1205142805,    prev: 1205142908},   // Spread aka Circles
	1205142805: {msg: '炸 彈 (集 中)',    next: 1205142908,    prev: 1205144607},   // Gather aka Bombs
	// 靈魂狀態
	1205142909: {msg: '注 視 (遠)',   next: 1205144609,    prev: 1205142806},   // Debuff aka Mark
	1205144609: {msg: '閃 電 (集 中)',              next: 1205142806,    prev: 1205142909},   // Spread aka Circles
	1205142806: {msg: '炸 彈 (集 中)', next: 1205142909,    prev: 1205144609},   // Gather aka Bombs
};
/*
const BossActions = {
	1205142648: {msg: 'Get out'},            // Begone purple
	1205142649: {msg: 'Get in'},             // Begone orange
	1205142905: {msg: 'plague/regress'},     // Shield normal to inverse
	1205142906: {msg: 'sleep'},              // Shield inverse to normal
	// Normal
	1205142908: {msg: 'Debuff (closest)',    next: 1205144607,    prev: 1205142805},   // Debuff aka Mark
	1205144607: {msg: 'Spread',              next: 1205142805,    prev: 1205142908},   // Spread aka Circles
	1205142805: {msg: 'Gather + cleanse',    next: 1205142908,    prev: 1205144607},   // Gather aka Bombs
	// Inversed
	1205142909: {msg: 'Debuff (furthest)',   next: 1205144609,    prev: 1205142806},   // Debuff aka Mark
	1205144609: {msg: 'Gather',              next: 1205142806,    prev: 1205142909},   // Spread aka Circles
	1205142806: {msg: 'Gather + no cleanse', next: 1205142909,    prev: 1205144609},   // Gather aka Bombs
};
*/
const InversedAction = {
	1205142908: 1205142909,
	1205144607: 1205144609,
	1205142805: 1205142806,
	1205142909: 1205142908,
	1205144609: 1205144607,
	1205142806: 1205142805
};

const ShieldWarningTime = 85000; //ms
const ShieldWarningMessage = '快  要  變  身  惹';
//const ShieldWarningMessage = 'Ring soon';

module.exports = function VSHMLakanGuide(mod) {

	let	showNextMechanicMessage = true,
		showShieldWarnings = true,
		showBegoneMessages = false,
		boss = undefined,
		shieldWarned = false,
		timerNextMechanic = undefined, 
		lastNextAction = undefined,
		lastInversionTime = undefined,
		isReversed = false,
		isInversed = false;

	mod.command.add('vs', {
    	$none() {
    		mod.settings.enabled = !mod.settings.enabled
			mod.command.message(`侀塌的貝里克神殿 guide ${mod.settings.enabled ? '<font color="#56B4E9">[開啟]' : '<font color="#E69F00">[關閉]'}`)
			//mod.command.message(`VSHM Guide ${mod.settings.enabled ? '<font color="#56B4E9">[enabled]' : '<font color="#E69F00">[disable]'}`)
    	},			
		pt() {
			mod.settings.sendToParty = !mod.settings.sendToParty
			mod.command.message(`隊伍提示通知 ${mod.settings.sendToParty ? '<font color="#56B4E9">[開啟]' : '<font color="#E69F00">[關閉]'}`)
			//mod.command.message(`VSHM Guide ${mod.settings.sendToParty ? '<font color="#56B4E9">[enabled]' : '<font color="#E69F00">[disable]'}`)
		}
	})

	mod.hook('S_DUNGEON_EVENT_MESSAGE', 2, (event) => {	
		if (!mod.settings.enabled || !boss) return;

		let msgId = parseInt(event.message.replace('@dungeon:', ''));
		if (BossMessages[msgId]) {
			if (timerNextMechanic) clearTimeout(timerNextMechanic);
			if (showNextMechanicMessage) sendMessage('下次: ' + BossActions[BossMessages[msgId]].msg);
			(bossHealth() > 0.5) ? isReversed = false : isReversed = true;
		}
	})

	function bossHealth() {
		return (Number(boss.curHp) / Number(boss.maxHp));
	}

	mod.hook('S_BOSS_GAGE_INFO', 3, (event) => {
		if (!mod.settings.enabled) return;

		if (event.huntingZoneId == BossId[0] && event.templateId == BossId[1]) {
			boss = event;
		}

		if (boss) {
			let bossHp = bossHealth();

			if (bossHp == 0) boss = undefined;
			if (bossHp == 0 || bossHp == 1) {
				lastNextAction = undefined;
				isReversed = false;
				isInversed = false;
				shieldWarned = false;
				lastInversionTime = undefined;
				if (timerNextMechanic) clearTimeout(timerNextMechanic);
			} else {
				if (!lastInversionTime) lastInversionTime = Date.now();
			}

			if (Date.now() > (lastInversionTime + ShieldWarningTime) && !shieldWarned && boss) {
				if (showShieldWarnings) {
					let hint = (!isInversed ? BossActions[1205142905].msg : BossActions[1205142906].msg);
					sendMessage(ShieldWarningMessage + ' -> ' + hint);
				}
				shieldWarned = true;
			}
		}
	 })
	
	mod.hook('S_ACTION_STAGE', 9, (event) => {
		if (!mod.settings.enabled || !boss) return;
		
		if (boss.id - event.gameId == 0) {
			 if (BossActions[event.skill]) {
				if (!showBegoneMessages && (event.skill == 1205142648 || event.skill == 1205142649)) return;
				sendMessage(BossActions[event.skill].msg);
				
				if (!showNextMechanicMessage) return;
				
				let nextMessage;
				if (event.skill == 1205142905) {                                                 // normal to inverse
					isInversed = true;
					nextMessage = BossActions[InversedAction[lastNextAction]].msg;
					startTimer('下次: ' + nextMessage);
					//startTimer('Next: ' + nextMessage);
					lastInversionTime = Date.now();
					shieldWarned = false;
				} else if (event.skill == 1205142906) {                                          // inverse to normal
					isInversed = false;
					nextMessage = BossActions[InversedAction[lastNextAction]].msg;
					startTimer('下次: ' + nextMessage);
					//startTimer('Next: ' + nextMessage);
					lastInversionTime = Date.now();
					shieldWarned = false;
				} else if (!isReversed && BossActions[event.skill].next) {                       // normal "next"
					nextMessage = BossActions[BossActions[event.skill].next].msg;
					startTimer('下次: ' + nextMessage);
					//startTimer('Next: ' + nextMessage);
					lastNextAction = BossActions[event.skill].next;
				} else if (isReversed && BossActions[event.skill].prev) {                        // reversed "next"
					nextMessage = BossActions[BossActions[event.skill].prev].msg;
					startTimer('下次: ' + nextMessage);
					//startTimer('Next: ' + nextMessage);
					lastNextAction = BossActions[event.skill].prev;
				}
			}
		}
	})

	function startTimer(message) {
		if (timerNextMechanic) clearTimeout(timerNextMechanic);
		timerNextMechanic = setTimeout(() => {
			sendMessage(message);
			timerNextMechanic = null;
		}, 5000);
	}

	function sendMessage(msg) {
		if (!mod.settings.enabled) return;

		if (mod.settings.sendToParty) {
			mod.send('C_CHAT', 1, {
				channel: 21, //21 = p-notice, 1 = party
				message: msg
			});
		} else {
			mod.send('S_CHAT', 2, {
				channel: 21, //21 = p-notice, 1 = party
				authorName: 'DG-Guide',
				message: msg
			});
		}
	}
}