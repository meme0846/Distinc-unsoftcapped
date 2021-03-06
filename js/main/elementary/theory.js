function updateTheoryTabs() {
	if (!tmp.elm.theory.updateTabs) tmp.elm.theory.updateTabs = function () {
		let tabs = Element.allFromClass("theorytab");
		for (let i = 0; i < tabs.length; i++) {
			tabs[i].setDisplay(thTab == tabs[i].id);
			new Element(tabs[i].id + "tabbtn").setDisplay(TH_TABS[tabs[i].id]());
		}
	};
	if (!tmp.elm.theory.showTab) tmp.elm.theory.showTab = function (name) {
		if (thTab == name) return;
		thTab = name;
		tmp.elm.theory.updateTabs();
	};
	tmp.elm.theory.updateTabs();
}

function updateTempTheoriverse() {
	tmp.elm.theory.subbed = new ExpantaNum(0)
	if (player.elementary.theory.tree.unl) tmp.elm.theory.subbed = tmp.elm.theory.subbed.plus(TREE_UPGS[4].effect(player.elementary.theory.tree.upgrades[4]||0))
	tmp.elm.theory.nerf = (player.elementary.theory.depth.minus(tmp.elm.theory.subbed).max(0).eq(0)?new ExpantaNum(0.88):ExpantaNum.pow(0.8, player.elementary.theory.depth.minus(tmp.elm.theory.subbed).max(1).cbrt()))
	if (player.elementary.theory.depth.minus(tmp.elm.theory.subbed).gte(4)) tmp.elm.theory.nerf = tmp.elm.theory.nerf.pow(player.elementary.theory.depth.minus(tmp.elm.theory.subbed).max(0).sub(3))
	if (HCTVal("tv").gt(-1)) {
		let d = HCTVal("tv")
		tmp.elm.theory.nerf = (d.minus(tmp.elm.theory.subbed).max(0).eq(0)?new ExpantaNum(0.88):ExpantaNum.pow(0.8, d.minus(tmp.elm.theory.subbed).max(1).cbrt()))
		if (d.minus(tmp.elm.theory.subbed).gte(4)) tmp.elm.theory.nerf = tmp.elm.theory.nerf.pow(d.minus(tmp.elm.theory.subbed).max(0).sub(3))
	}
	if (!tmp.elm.theory.start) tmp.elm.theory.start = function() {
		if (!player.elementary.theory.unl) return
		if (HCTVal("tv").gt(-1)) return
		tmp.elm.layer.reset(true)
		player.elementary.theory.active = !player.elementary.theory.active
	}
	tmp.elm.theory.gain = ExpantaNum.pow(2, player.elementary.theory.depth)
}

function updateTempSupersymmetry() {
	if (!tmp.elm.theory.ss) tmp.elm.theory.ss = {}
	if (!tmp.elm.theory.ss.unl) tmp.elm.theory.ss.unl = function() {
		if (!player.elementary.theory.unl) return
		if (player.elementary.theory.supersymmetry.unl) return
		if (player.elementary.theory.points.lt(1)) return
		player.elementary.theory.points = player.elementary.theory.points.sub(1).max(0)
		player.elementary.theory.supersymmetry.unl = true
	}
	for (let i=0;i<4;i++) {
		let type = ["squark", "slepton", "neutralino", "chargino"][i]
		tmp.elm.theory.ss[type+"Gain"] = new ExpantaNum((4-i)/4)
		if (player.elementary.theory.tree.unl) {
			tmp.elm.theory.ss[type+"Gain"] = tmp.elm.theory.ss[type+"Gain"].times(TREE_UPGS[1].effect(player.elementary.theory.tree.upgrades[1]||0))
			tmp.elm.theory.ss[type+"Gain"] = tmp.elm.theory.ss[type+"Gain"].times(TREE_UPGS[5].effect(player.elementary.theory.tree.upgrades[5]||0))
			tmp.elm.theory.ss[type+"Gain"] = tmp.elm.theory.ss[type+"Gain"].times(getStringEff(1))
			if (player.elementary.foam.unl && tmp.elm.qf) tmp.elm.theory.ss[type+"Gain"] = tmp.elm.theory.ss[type+"Gain"].times(tmp.elm.qf.boost9)
			if (player.elementary.sky.unl && tmp.elm.sky) tmp.elm.theory.ss[type+"Gain"] = tmp.elm.theory.ss[type+"Gain"].times(tmp.elm.sky.spinorEff[5])
		}
		tmp.elm.theory.ss[type+"Eff"] = player.elementary.theory.supersymmetry[type+"s"].plus(1)
		if (tmp.elm.theory.ss[type+"Eff"].gte(1e9)) tmp.elm.theory.ss[type+"Eff"] = tmp.elm.theory.ss[type+"Eff"].cbrt().times(1e6)
	}
	if (hasDE(5)) for (let i=2;i>=0;i--) {
		let type = ["squark", "slepton", "neutralino", "chargino"][i]
		let next = ["squark", "slepton", "neutralino", "chargino"][i+1]
		if ((player.elementary.theory.tree.upgrades[i+22]||new ExpantaNum(0)).gte(1)) tmp.elm.theory.ss[type+"Gain"] = tmp.elm.theory.ss[type+"Gain"].times(tmp.elm.theory.ss[next+"Eff"])
	}
	tmp.elm.theory.ss.wavelength = player.elementary.theory.supersymmetry.squarks.times(player.elementary.theory.supersymmetry.sleptons).times(player.elementary.theory.supersymmetry.neutralinos).times(player.elementary.theory.supersymmetry.charginos).pow(1/5)
	tmp.elm.theory.ss.waveEff = tmp.elm.theory.ss.wavelength.plus(1).pow(2.25)
	if (tmp.elm.theory.ss.waveEff.gte(1e13)) tmp.elm.theory.ss.waveEff = tmp.elm.theory.ss.waveEff.pow(1/4).times(Math.pow(1e13, 3/4))
}

function updateTempTheoryTree() {
	if (!tmp.elm.theory.tree) tmp.elm.theory.tree = {}
	if (!tmp.elm.theory.tree.unl) tmp.elm.theory.tree.unl = function() {
		if (!player.elementary.theory.unl) return
		if (!player.elementary.theory.supersymmetry.unl) return
		if (player.elementary.theory.tree.unl) return
		if (player.elementary.theory.points.lt(1)) return
		player.elementary.theory.points = player.elementary.theory.points.sub(1).max(0)
		player.elementary.theory.tree.unl = true
	}
	tmp.elm.theory.tree.bought = function(i) { return new ExpantaNum(player.elementary.theory.tree.upgrades[i]||0) }
	if (!tmp.elm.theory.tree.buy) tmp.elm.theory.tree.buy = function(x, max=false) {
		if (!player.elementary.theory.unl) return
		if (!player.elementary.theory.tree.unl) return
		let bought = tmp.elm.theory.tree.bought(x)
		let cap = getTreeUpgCap(x)
		if (bought.gte(cap)) return
		let cost = TREE_UPGS[x].cost(bought).div(tmp.elm.theory.tree.costReduc).round()
		if (player.elementary.theory.points.lt(cost)) return
		if (tmp.ach[162].has && (outerShiftDown||max) && TREE_UPGS[x].target!==undefined) {
			let pts = player.elementary.theory.points
			if (pts.eq(0)&&cost.eq(0)) pts = new ExpantaNum(.99)
			let target = TREE_UPGS[x].target(pts.times(tmp.elm.theory.tree.costReduc)).max(0).min(cap);
			if (target.lte(bought)||target.lt(1)) return;
			let newCost = TREE_UPGS[x].cost(target.sub(1)).div(tmp.elm.theory.tree.costReduc).round();
			if (!player.elementary.entropy.upgrades.includes(13)) {
				player.elementary.theory.points = player.elementary.theory.points.sub(newCost).max(0);
				player.elementary.theory.tree.spent = player.elementary.theory.tree.spent.plus(newCost);
			}
			player.elementary.theory.tree.upgrades[x] = bought.max(target)
		} else {
			if (!player.elementary.entropy.upgrades.includes(13)) {
				player.elementary.theory.points = player.elementary.theory.points.sub(cost).max(0)
				player.elementary.theory.tree.spent = player.elementary.theory.tree.spent.plus(cost)
			}
			player.elementary.theory.tree.upgrades[x] = bought.plus(1)
		}
	}
	tmp.elm.theory.tree.costReduc = ach152Eff()
	if (player.elementary.theory.inflatons.unl) tmp.elm.theory.tree.costReduc = tmp.elm.theory.tree.costReduc.times(getInflatonEff1())
	if (player.elementary.foam.unl && tmp.elm.qf) tmp.elm.theory.tree.costReduc = tmp.elm.theory.tree.costReduc.times(tmp.elm.qf.boost8)
}

function updateTempTheories() {
	if (!tmp.elm.theory) tmp.elm.theory = {}
	
	updateTheoryTabs()
	updateTempTheoriverse();
	updateTempSupersymmetry();
	updateTempTheoryTree();
}

function resetTheoryTree(force=false) {
	if (!force) {
		if (!player.elementary.theory.unl) return
		if (!player.elementary.theory.tree.unl) return
		if (!confirm("Are you sure you want to reset your tree to get Theory Points back?")) return
	}
	player.elementary.theory.points = player.elementary.theory.points.plus(player.elementary.theory.tree.spent)
	player.elementary.theory.tree.spent = new ExpantaNum(0)
	player.elementary.theory.tree.upgrades = {}
	elmReset(true)
}

// Strings

function unlockStrings() {
	if (!player.elementary.theory.unl) return
	if (!player.elementary.theory.tree.unl) return
	if (player.elementary.theory.strings.unl) return
	if (player.elementary.theory.points.lt(7)) return
	if (!confirm("Are you sure you want to unlock Strings? You will not be able to get your Theory Points back!")) return
	player.elementary.theory.points = player.elementary.theory.points.sub(7).max(0)
	player.elementary.theory.strings.unl = true
}

function getStringEff(n) {
	if (!player.elementary.theory.unl || !player.elementary.theory.strings.unl) return new ExpantaNum(1)
	let ret = player.elementary.theory.strings.amounts[n-1].plus(1).pow(3/n)
	if (n==1 && player.elementary.entropy.upgrades.includes(18)) ret = ret.pow(5);
	let finalExp = new ExpantaNum(1)
	let ettu = player.elementary.theory.tree.upgrades
	if (hasDE(5) && n==2) finalExp = finalExp.plus(TREE_UPGS[14].effect(ettu[14]||0))
	if (hasDE(5) && n==3) finalExp = finalExp.plus(TREE_UPGS[15].effect(ettu[15]||0))
	if (hasDE(5) && n==4) finalExp = finalExp.plus(TREE_UPGS[16].effect(ettu[16]||0))
	if (hasDE(5) && n==5) finalExp = finalExp.plus(TREE_UPGS[17].effect(ettu[17]||0))
	if (hasDE(5) && n==6) finalExp = finalExp.plus(TREE_UPGS[18].effect(ettu[18]||0))
	if (hasDE(5) && n==7) finalExp = finalExp.plus(TREE_UPGS[19].effect(ettu[19]||0))
	return ret.pow(finalExp)
}

function getStringGain(n) {
	if (!player.elementary.theory.strings.unl) return new ExpantaNum(0)
	if (n>1) if (!(player.elementary.theory.strings.amounts[n-2].gte(STR_REQS[n])&&(UNL_STR()>=n))) return new ExpantaNum(0)
	let gain = new ExpantaNum(0.02).times(1/Math.sqrt(n))
	if (n<TOTAL_STR) gain = gain.times(getStringEff(n+1))
	gain = gain.times(getEntangleEff())
	if (tmp.ach[144].has) gain = gain.times(1.25)
	if (tmp.ach[157].has) gain = gain.times(2)
	if (player.elementary.foam.unl && tmp.elm.qf) gain = gain.times(tmp.elm.qf.boost15)
	return gain
}

function getEntangleGain() {
	let base = new ExpantaNum(1)
	player.elementary.theory.strings.amounts.forEach(x => function() { base = base.times(ExpantaNum.add(x, 1)) }())
	let gain = base.pow(1/7).sqrt()
	gain = gain.times(TREE_UPGS[6].effect(player.elementary.theory.tree.upgrades[6]||0))
	gain = gain.times(TREE_UPGS[30].effect(player.elementary.theory.tree.upgrades[30]||0))
	if (player.elementary.foam.unl && tmp.elm.qf) gain = gain.times(tmp.elm.qf.boost3)
	return gain
}

function getEntangleEff() {
	let eff = player.elementary.theory.strings.entangled.plus(1).pow(1.5)
	return eff
}

function entangleStrings() {
	let lastStr = player.elementary.theory.strings.amounts.findIndex(x => new ExpantaNum(x).eq(0))+1
	if (lastStr<3&&lastStr!=0) return
	player.elementary.theory.strings.entangled = player.elementary.theory.strings.entangled.plus(getEntangleGain())
	player.elementary.theory.strings.amounts = [new ExpantaNum(0), new ExpantaNum(0), new ExpantaNum(0), new ExpantaNum(0), new ExpantaNum(0), new ExpantaNum(0), new ExpantaNum(0)]
}

// Preons

function unlockPreons() {
	if (!player.elementary.theory.unl) return
	if (!player.elementary.theory.strings.unl) return
	if (player.elementary.theory.preons.unl) return
	if (player.elementary.theory.points.lt(10)) return
	if (!confirm("Are you sure you want to unlock Preons? You will not be able to get your Theory Points back!")) return
	player.elementary.theory.points = player.elementary.theory.points.sub(10).max(0)
	player.elementary.theory.preons.unl = true
}

function getPreonGain() {
	if (!player.elementary.theory.preons.unl) return new ExpantaNum(0)
	let gain = player.elementary.theory.strings.amounts[0].plus(1).log10().div(10)
	gain = gain.times(TREE_UPGS[9].effect(player.elementary.theory.tree.upgrades[9]||0))
	return gain
}

function getTBCost() {
	let b = new ExpantaNum(player.elementary.theory.preons.boosters)
	if (b.gte(4)) b = b.pow(2).div(4)
	let base = new ExpantaNum(2)
	if (hasDE(5)) base = base.pow(0.1)
	let cost = new ExpantaNum(20).times(ExpantaNum.pow(base, b))
	cost = cost.div(TREE_UPGS[10].effect(player.elementary.theory.tree.upgrades[10]||0))
	return cost
}

function getTBTarg() {
	let base = new ExpantaNum(2)
	if (hasDE(5)) base = base.pow(0.1)
	let targ = player.elementary.theory.preons.amount.times(TREE_UPGS[10].effect(player.elementary.theory.tree.upgrades[10]||0)).div(20).max(1).logBase(base)
	if (targ.gte(4)) targ = targ.times(4).sqrt()
	return targ.plus(1).floor();
}

function getTBGain(bulk=1) {
	if (player.elementary.entropy.upgrades.includes(17)) {
		if (bulk==1) return player.elementary.theory.preons.boosters.plus(1).pow(5)
		else {
			let s = player.elementary.theory.preons.boosters.plus(1)
			let t = ExpantaNum.add(bulk, s)
			return ExpantaNum.div(s.pow(6).times(-2).plus(s.pow(5).times(6)).sub(s.pow(4).times(5)).plus(s.pow(2)).plus(t.pow(2).times(t.plus(1).pow(2)).times(t.pow(2).times(2).plus(t.times(2)).sub(1))), 12).round();
		}
	} else {
		if (bulk==1) return player.elementary.theory.preons.boosters.plus(1)
		else {
			let a = player.elementary.theory.preons.boosters.plus(1)
			let n = ExpantaNum.add(bulk, a)
			let d = 1
			return n.div(2).times(a.times(2).plus(n.sub(1).times(d))).round();
		}
	}
}

function theoryBoost(max=false) {
	if (!player.elementary.theory.unl) return
	if (!player.elementary.theory.preons.unl) return
	if (player.elementary.theory.preons.amount.lt(getTBCost())) return
	let targ;
	if (max) {
		targ = getTBTarg();
		if (targ.sub(player.elementary.theory.preons.boosters).lt(1)) return;
	}
	player.elementary.theory.preons.amount = player.elementary.theory.preons.amount.sub(getTBCost())
	if (max) {
		let bulk = targ.sub(player.elementary.theory.preons.boosters).max(1);
		player.elementary.theory.points = player.elementary.theory.points.plus(getTBGain(bulk));
		player.elementary.theory.preons.boosters = player.elementary.theory.preons.boosters.plus(bulk);
	} else {
		player.elementary.theory.points = player.elementary.theory.points.plus(getTBGain())
		player.elementary.theory.preons.boosters = player.elementary.theory.preons.boosters.plus(1)
	}
}

// Accelerons

function unlockAccelerons() {
	if (!player.elementary.theory.unl) return
	if (!player.elementary.theory.preons.unl) return
	if (player.elementary.theory.accelerons.unl) return
	if (player.elementary.theory.points.lt(84)) return
	if (!confirm("Are you sure you want to unlock Accelerons? You won't be able to get your Theory Points back!")) return
	player.elementary.theory.points = player.elementary.theory.points.sub(84).max(0)
	player.elementary.theory.accelerons.unl = true
}

function getAccelGain() {
	if (!player.elementary.theory.accelerons.unl) return new ExpantaNum(0)
	let gain = tmp.acc.plus(1).log10().div(1e6).sqrt()
	gain = gain.times(TREE_UPGS[12].effect(player.elementary.theory.tree.upgrades[12]||0))
	return gain
}

function getAccelEff() {
	if (!player.elementary.theory.accelerons.unl) return new ExpantaNum(1)
	let eff = player.elementary.theory.accelerons.amount.plus(1).pow(0.04)
	return eff
}

function darkExpand() {
	if (!player.elementary.theory.accelerons.unl) return
	if (player.elementary.theory.accelerons.expanders.gte(MAX_DARK_EXPANDERS)) return
	if (player.elementary.theory.accelerons.amount.lt(DARK_EXPANDER_COSTS[player.elementary.theory.accelerons.expanders.plus(1).toNumber()])) return
	player.elementary.theory.accelerons.amount = player.elementary.theory.accelerons.amount.sub(DARK_EXPANDER_COSTS[player.elementary.theory.accelerons.expanders.plus(1).toNumber()])
	player.elementary.theory.accelerons.expanders = player.elementary.theory.accelerons.expanders.plus(1)
}

function buyGluon3(col) {
	if (!hasDE(1)) return
	if (player.elementary.bosons.gauge.gluons[col].amount.lt(tmp.elm.bos.gluonCost(col, 3))) return
	player.elementary.bosons.gauge.gluons[col].amount = player.elementary.bosons.gauge.gluons[col].amount.sub(tmp.elm.bos.gluonCost(col, 3))
	player.elementary.bosons.gauge.gluons[col].upgrades[2] = (player.elementary.bosons.gauge.gluons[col].upgrades[2]||new ExpantaNum(0)).plus(1)
	player.elementary.theory.points = player.elementary.theory.points.plus(10)
}

function hasDE(n) { 
	return player.elementary.theory.accelerons.expanders.gte(n)&&player.elementary.theory.accelerons.unl 
}

// Tree Export/Import functions
function exportTree() {
	let upgs = player.elementary.theory.tree.upgrades
	let parsedUpgs = {}
	for (let i=0;i<Object.keys(upgs).length;i++) {
		let key = Object.keys(upgs)[i]
		parsedUpgs[key] = upgs[key].toString();
	}
	let tree = JSON.stringify(parsedUpgs)
	notifier.info("Tree exported!")
	copyToClipboard(tree)
}

function importTree() {
	let input = prompt("Paste your exported Theory Tree here.")
	try {
		let upgs = JSON.parse(input)
		let plyr = player.elementary.theory.tree.upgrades
		for (let i=0;i<Object.keys(upgs).length;i++) {
			let key = Object.keys(upgs)[i]
			upgs[key] = new ExpantaNum(upgs[key])
			if (upgs[key].lte(plyr[key])) continue
			else {
				let cap = getTreeUpgCap(key)
				let costs = Array.from({length: Math.min(upgs[key].toNumber(), cap.toNumber())}, (v,i) => TREE_UPGS[key].cost(new ExpantaNum(i)).div(tmp.elm.theory.tree.costReduc).round())
				let totalCost = costs.reduce((x,y) => ExpantaNum.add(x, y))
				if (tmp.ach[162].has) totalCost = TREE_UPGS[key].cost(upgs[key]).div(tmp.elm.theory.tree.costReduc).min(totalCost).round()
				if (player.elementary.theory.points.gte(totalCost)) {
					if (!player.elementary.entropy.upgrades.includes(13)) {
						player.elementary.theory.points = player.elementary.theory.points.sub(totalCost).max(0)
						player.elementary.theory.tree.spent = player.elementary.theory.tree.spent.plus(totalCost)
					}
					player.elementary.theory.tree.upgrades[key] = ExpantaNum.min(upgs[key], cap)
				} else notifier.warn("You could not afford some of your requested Tree upgrades!")
			}
		}
	} catch(e) {
		notifier.error("Invalid tree")
	}
}

// Inflatons
function unlockInflatons() {
	if (!player.elementary.theory.unl) return
	if (!(player.elementary.hc.unl&&player.elementary.theory.accelerons.unl)) return
	if (player.elementary.theory.inflatons.unl) return
	if (player.elementary.theory.points.lt(1600)) return
	if (!confirm("Are you sure you want to unlock Inflatons? You won't be able to get your Theory Points back!")) return
	player.elementary.theory.points = player.elementary.theory.points.sub(1600).max(0)
	player.elementary.theory.inflatons.unl = true
}

function getInflatonState() {
	let x = player.elementary.theory.inflatons.amount.plus(1).log10()
	if (x.gte(5.5)) x = x.sqrt().times(Math.sqrt(5.5)).plus(5.5).div(2)
	if (x.gte(1e6)) return 1
	return -1*Math.cos(x.toNumber())
}

function getInflatonGain() {
	let gain = player.elementary.theory.inflatons.amount.plus(1).pow(0.6)
	gain = gain.times(player.elementary.theory.inflatons.amount.plus(1).pow((tmp.elm.hc.infState+1)/6))
	if (player.elementary.foam.unl && tmp.elm.qf) gain = gain.times(tmp.elm.qf.boost4)
	return gain
}

function getInflatonEff1() {
	let eff = player.elementary.theory.inflatons.amount.plus(1).log10().sqrt().plus(1)
	if (player.elementary.entropy.upgrades.includes(20)) eff = eff.times(player.elementary.theory.inflatons.amount.plus(1).pow(0.01))
	return eff
}

function getInflatonEff2() {
	let amt = player.elementary.theory.inflatons.amount
	let eff = new ExpantaNum(0)
	if (amt.gte(1e3)) eff = eff.plus(1)
	if (amt.gte(1e4)) eff = eff.plus(1)
	if (amt.gte(1e5)) eff = eff.plus(1)
	if (amt.gte(1e6)) eff = eff.plus(1)
	eff = eff.plus(amt.div(1e6).max(1).log10())
	eff = eff.plus(amt.plus(1).log10().plus(1).log10())
	if (player.elementary.sky.unl && tmp.elm.sky) eff = eff.times(tmp.elm.sky.spinorEff[13])
	return eff.floor()
}

function getTreeUpgCap(x) {
	let cap = new ExpantaNum(TREE_UPGS[x].cap)
	if (player.elementary.foam.unl && tmp.elm.qf && QFB17_TARGETS.includes(parseInt(x+""))) cap = cap.plus(tmp.elm.qf.boost17)
	return cap;
}
