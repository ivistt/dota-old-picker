// ══════════════════════════════════════════════
// SHOPKEEPER'S QUIZ — Актуальные рецепты Dota 2
// ══════════════════════════════════════════════

const ITEM_IMG = (key) => {
  if (key === 'recipe') return `./images/items/recipe_png.png`;
  return `./images/items/${key}_png.png`;
};

const QUIZ_ITEMS = [
  // ── Аксессуары ──
  { key:'magic_wand',           name:'Magic Wand',            components:['magic_stick','branches','branches','branches'] },
  { key:'null_talisman',        name:'Null Talisman',         components:['mantle','circlet','recipe'] },
  { key:'wraith_band',          name:'Wraith Band',           components:['slippers','circlet','recipe'] },
  { key:'bracer',               name:'Bracer',                components:['gauntlets','circlet','recipe'] },
  { key:'soul_ring',            name:'Soul Ring',             components:['ring_of_regen','recipe'] },
  { key:'falcon_blade',         name:'Falcon Blade',          components:['ring_of_regen','blade_of_alacrity','recipe'] },

  // ── Ботинки ──
  { key:'arcane_boots',         name:'Arcane Boots',          components:['boots','energy_booster'] },
  { key:'tranquil_boots',       name:'Tranquil Boots',        components:['boots','ring_of_regen','ring_of_regen'] },
  { key:'power_treads',         name:'Power Treads',          components:['boots','gloves_of_haste','belt_of_strength'] },
  { key:'phase_boots',          name:'Phase Boots',           components:['boots','blades_of_attack','recipe'] },
  { key:'travel_boots',         name:'Boots of Travel',       components:['boots','recipe'] },

  // ── Поддержка ──
  { key:'ring_of_basilius',     name:'Ring of Basilius',      components:['ring_of_protection','sobi_mask'] },
  { key:'arcane_ring',          name:'Arcane Ring',           components:['ring_of_basilius','recipe'] },
  { key:'headdress',            name:'Headdress',             components:['ring_of_regen','ring_of_protection','recipe'] },
  { key:'buckler',              name:'Buckler',               components:['chainmail','fluffy_hat','recipe'] },
  { key:'mekansm',              name:'Mekansm',               components:['headdress','buckler','recipe'] },
  { key:'guardian_greaves',     name:'Guardian Greaves',      components:['arcane_boots','mekansm'] },
  { key:'medallion_of_courage', name:'Medallion of Courage',  components:['chainmail','blight_stone','sobi_mask'] },
  { key:'solar_crest',          name:'Solar Crest',           components:['medallion_of_courage','recipe'] },
  { key:'urn_of_shadows',       name:'Urn of Shadows',        components:['crown','gauntlets','recipe'] },
  { key:'spirit_vessel',        name:'Spirit Vessel',         components:['urn_of_shadows','vitality_booster','recipe'] },
  { key:'ancient_janggo',       name:'Drum of Endurance',     components:['crown','wind_lace','recipe'] },
  { key:'boots_of_bearing',     name:'Boots of Bearing',      components:['ancient_janggo','wind_lace','recipe'] },
  { key:'vladmir',              name:"Vladmir's Offering",    components:['lifesteal','ring_of_basilius','recipe'] },
  { key:'pipe',                 name:'Pipe of Insight',       components:['ring_of_basilius','headdress','hood_of_defiance'] },
  { key:'hood_of_defiance',     name:'Hood of Defiance',      components:['ring_of_health','cloak','recipe'] },
  { key:'aether_lens',          name:'Aether Lens',           components:['energy_booster','recipe'] },
  { key:'glimmer_cape',         name:'Glimmer Cape',          components:['shadow_amulet','cloak'] },
  { key:'force_staff',          name:'Force Staff',           components:['staff_of_wizardry','ring_of_regen'] },
  { key:'cyclone',              name:"Eul's Scepter",         components:['staff_of_wizardry','wind_lace','recipe'] },
  { key:'veil_of_discord',      name:'Veil of Discord',       components:['headdress','robe','recipe'] },
  { key:'blade_mail',           name:'Blade Mail',            components:['broadsword','chainmail','recipe'] },
  { key:'lotus_orb',            name:'Lotus Orb',             components:['ring_of_health','energy_booster','platemail','recipe'] },
  { key:'vanguard',             name:'Vanguard',              components:['vitality_booster','ring_of_health','recipe'] },
  { key:'crimson_guard',        name:'Crimson Guard',         components:['vanguard','recipe'] },
  { key:'eternal_shroud',       name:'Eternal Shroud',        components:['ghost','robe','ring_of_health'] },
  { key:'pavise',               name:'Pavise',                components:['ring_of_health','chainmail','recipe'] },
  { key:'wraith_pact',          name:'Wraith Pact',           components:['urn_of_shadows','vladmir','recipe'] },

  // ── Магия ──
  { key:'kaya',                 name:'Kaya',                  components:['null_talisman','blade_of_alacrity','robe'] },
  { key:'yasha',                name:'Yasha',                 components:['slippers','blade_of_alacrity','recipe'] },
  { key:'sange',                name:'Sange',                 components:['ogre_axe','belt_of_strength','recipe'] },
  { key:'sange_and_yasha',      name:'Sange and Yasha',       components:['sange','yasha'] },
  { key:'kaya_and_sange',       name:'Kaya and Sange',        components:['kaya','sange'] },
  { key:'yasha_and_kaya',       name:'Yasha and Kaya',        components:['yasha','kaya'] },
  { key:'ultimate_scepter',     name:"Aghanim's Scepter",     components:['staff_of_wizardry','ogre_axe','point_booster'] },
  { key:'orchid',               name:'Orchid Malevolence',    components:['staff_of_wizardry','staff_of_wizardry','recipe'] },
  { key:'bloodthorn',           name:'Bloodthorn',            components:['orchid','broadsword','recipe'] },
  { key:'dagon',                name:'Dagon',                 components:['staff_of_wizardry','robe','recipe'] },
  { key:'rod_of_atos',          name:'Rod of Atos',           components:['staff_of_wizardry','diadem','recipe'] },
  { key:'gungir',             name:'Gleipnir',              components:['rod_of_atos','recipe'] },
  { key:'sheepstick',           name:'Scythe of Vyse',        components:['staff_of_wizardry','mystic_staff','ultimate_scepter'] },
  { key:'refresher',            name:'Refresher Orb',         components:['pers','recipe'] },
  { key:'sphere',        name:"Linken's Sphere",       components:['pers','recipe'] },
  { key:'bloodstone',           name:'Bloodstone',            components:['pers','staff_of_wizardry','recipe'] },
  { key:'octarine_core',        name:'Octarine Core',         components:['soul_booster','recipe'] },
  { key:'soul_booster',         name:'Soul Booster',          components:['point_booster','vitality_booster','energy_booster'] },
  { key:'witch_blade',          name:'Witch Blade',           components:['staff_of_wizardry','platemail','ring_of_regen','recipe'] },
  { key:'wind_waker',           name:'Wind Waker',            components:['cyclone','hurricane_pike'] },
  { key:'phylactery',           name:'Phylactery',            components:['staff_of_wizardry','crown','recipe'] },
  { key:'meteor_hammer',        name:'Meteor Hammer',         components:['staff_of_wizardry','ring_of_regen','recipe'] },
  { key:'mage_slayer',          name:'Mage Slayer',           components:['robe','broadsword','recipe'] },

  // ── Броня ──
  { key:'assault',              name:'Assault Cuirass',       components:['platemail','hyperstone','recipe'] },
  { key:'shivas_guard',         name:"Shiva's Guard",         components:['mystic_staff','platemail','recipe'] },
  { key:'heart',                name:'Heart of Tarrasque',    components:['vitality_booster','ring_of_tarrasque','reaver'] },
  { key:'heavens_halberd',      name:"Heaven's Halberd",      components:['sange','recipe'] },
  { key:'helm_of_the_dominator',name:'Helm of the Dominator', components:['helm_of_iron_will','recipe'] },
  { key:'helm_of_the_overlord', name:'Helm of the Overlord',  components:['helm_of_the_dominator','platemail'] },
  { key:'skadi',         name:'Eye of Skadi',          components:['ultimate_scepter','tiara_of_selemene','cornucopia'] },
  { key:'satanic',              name:'Satanic',               components:['lifesteal','reaver','recipe'] },

  // ── Оружие ──
  { key:'lesser_crit',            name:'Crystalys',             components:['broadsword','blades_of_attack','recipe'] },
  { key:'greater_crit',         name:'Daedalus',              components:['javelin','claymore','recipe'] },
  { key:'armlet',               name:'Armlet of Mordiggian',  components:['helm_of_iron_will','gloves_of_haste','blades_of_attack','recipe'] },
  { key:'desolator',            name:'Desolator',             components:['mithril_hammer','mithril_hammer','recipe'] },
  { key:'maelstrom',            name:'Maelstrom',             components:['mithril_hammer','gloves_of_haste','recipe'] },
  { key:'mjollnir',             name:'Mjollnir',              components:['maelstrom','hyperstone'] },
  { key:'bfury',                name:'Battle Fury',           components:['pers','quelling_blade','mithril_hammer'] },
  { key:'radiance',             name:'Radiance',              components:['relic','recipe'] },
  { key:'monkey_king_bar',      name:'Monkey King Bar',       components:['javelin','mithril_hammer','recipe'] },
  { key:'butterfly',            name:'Butterfly',             components:['talisman_of_evasion','eagle_horn','quarterstaff'] },
  { key:'diffusal_blade',       name:'Diffusal Blade',        components:['blade_of_alacrity','robe','recipe'] },
  { key:'disperser',            name:'Disperser',             components:['diffusal_blade','recipe'] },
  { key:'angels_demise',        name:'Khanda',                components:['oblivion_staff','lesser_crit','recipe'] },
  { key:'manta',                name:'Manta Style',           components:['yasha','orb_of_destruction','recipe'] },
  { key:'basher',         name:'Skull Basher',          components:['javelin','belt_of_strength','recipe'] },
  { key:'abyssal_blade',        name:'Abyssal Blade',         components:['basher','vanguard'] },
  { key:'black_king_bar',       name:'Black King Bar',        components:['ogre_axe','mithril_hammer','recipe'] },
  { key:'invis_sword',         name:'Shadow Blade',          components:['shadow_amulet','claymore'] },
  { key:'silver_edge',          name:'Silver Edge',           components:['invis_sword','recipe'] },
  { key:'rapier',               name:'Divine Rapier',         components:['relic','demon_edge'] },
  { key:'nullifier',            name:'Nullifier',             components:['relic','platemail','recipe'] },
  { key:'mask_of_madness',      name:'Mask of Madness',       components:['lifesteal','recipe'] },
  { key:'ethereal_blade',       name:'Ethereal Blade',        components:['eagle_horn','ghost','recipe'] },


  // ── Артефакты ──
  { key:'pers',         name:'Perseverance',          components:['ring_of_health','void_stone'] },
  { key:'oblivion_staff',       name:'Oblivion Staff',        components:['robe','staff_of_wizardry','javelin'] },
  { key:'dragon_lance',         name:'Dragon Lance',          components:['ogre_axe','belt_of_strength','recipe'] },
  { key:'hurricane_pike',       name:'Hurricane Pike',        components:['dragon_lance','force_staff'] },
  { key:'echo_sabre',           name:'Echo Sabre',            components:['ogre_axe','oblivion_staff'] },
  { key:'harpoon',              name:'Harpoon',               components:['echo_sabre','recipe'] },
  { key:'moon_shard',           name:'Moon Shard',            components:['hyperstone','hyperstone'] },
  { key:'overwhelming_blink',   name:'Overwhelming Blink',    components:['blink','reaver','recipe'] },
  { key:'swift_blink',          name:'Swift Blink',           components:['blink','eagle_horn','recipe'] },
  { key:'arcane_blink',         name:'Arcane Blink',          components:['blink','mystic_staff','recipe'] },
  { key:'hand_of_midas',        name:'Hand of Midas',         components:['gloves_of_haste','recipe'] },
  { key:'revenant_brooch',      name:"Revenant's Brooch",     components:['witch_blade','recipe'] },
  { key:'orb_of_corrosion',     name:'Orb of Corrosion',      components:['orb_of_venom','blight_stone','recipe'] },
  { key:'lance_of_pursuit',     name:'Lance of Pursuit',      components:['orb_of_corrosion','recipe'] },
];

const QUIZ_POOL = QUIZ_ITEMS.filter(item =>
  item.components.length >= 2 &&
  item.components.some(c => c !== 'recipe')
);

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
let quizState = {
  active:false, score:0, streak:0, bestStreak:0,
  guessesLeft:3, currentItem:null, hiddenIndex:0,
  choices:[], answered:false,
};

function openQuiz() {
  quizState = { active:true, score:0, streak:0, bestStreak:0,
                guessesLeft:3, currentItem:null, hiddenIndex:0,
                choices:[], answered:false };
  document.getElementById('quiz-overlay').classList.add('open');
  nextQuestion();
}

function closeQuiz() {
  document.getElementById('quiz-overlay').classList.remove('open');
  quizState.active = false;
}

function nextQuestion() {
  quizState.answered = false;
  quizState.guessesLeft = 3;

  const item = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
  quizState.currentItem = item;

  const nonRecipe = item.components.map((c,i)=>({c,i})).filter(x=>x.c!=='recipe');
  const hidden = nonRecipe[Math.floor(Math.random() * nonRecipe.length)];
  quizState.hiddenIndex = hidden.i;
  const answer = hidden.c;

  const allKeys = [...new Set(QUIZ_ITEMS.flatMap(x=>x.components))].filter(k=>k!=='recipe');
  const wrong = allKeys.filter(k=>k!==answer).sort(()=>Math.random()-0.5).slice(0,6);
  quizState.choices = [answer,...wrong].sort(()=>Math.random()-0.5);

  renderQuestion();
}

function renderQuestion() {
  const item = quizState.currentItem;
  document.getElementById('quiz-item-img').src = ITEM_IMG(item.key);
  document.getElementById('quiz-item-name').textContent = item.name;

  const compRow = document.getElementById('quiz-components');
  compRow.innerHTML = '';
  item.components.forEach((c,i) => {
    const div = document.createElement('div');
    div.className = 'quiz-comp' + (i===quizState.hiddenIndex ? ' hidden-comp' : '');
    if (i===quizState.hiddenIndex) {
      div.innerHTML = `<div class="quiz-comp-mystery">?</div>`;
    } else {
      const img = document.createElement('img');
      img.src = ITEM_IMG(c); img.alt = c;
      div.appendChild(img);
    }
    compRow.appendChild(div);
  });

  const choicesEl = document.getElementById('quiz-choices');
  choicesEl.innerHTML = '';
  quizState.choices.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'quiz-choice'; btn.dataset.key = key;
    const img = document.createElement('img');
    img.src = ITEM_IMG(key); img.alt = key;
    btn.appendChild(img);
    btn.addEventListener('click', ()=>onChoiceClick(key,btn));
    choicesEl.appendChild(btn);
  });

  updateQuizHUD();
}

function updateQuizHUD() {
  document.getElementById('quiz-guesses').textContent = quizState.guessesLeft;
  document.getElementById('quiz-score').textContent = quizState.score;
  const el = document.getElementById('quiz-streak');
  if (quizState.streak >= 3) { el.textContent=`${quizState.streak} in a row`; el.style.display='block'; }
  else el.style.display='none';
}

function onChoiceClick(key, btn) {
  if (quizState.answered) return;
  const answer = quizState.currentItem.components[quizState.hiddenIndex];
  if (key === answer) {
    quizState.answered = true;
    quizState.score += quizState.guessesLeft * 500;
    quizState.streak++;
    quizState.bestStreak = Math.max(quizState.bestStreak, quizState.streak);
    btn.classList.add('correct');
    revealAnswer(answer);
    setTimeout(nextQuestion, 1200);
  } else {
    btn.classList.add('wrong'); btn.disabled = true;
    quizState.guessesLeft--;
    updateQuizHUD();
    if (quizState.guessesLeft <= 0) {
      quizState.answered = true; quizState.streak = 0;
      revealAnswer(answer);
      document.querySelectorAll('.quiz-choice').forEach(b => { if(b.dataset.key===answer) b.classList.add('correct'); });
      setTimeout(nextQuestion, 1800);
    }
  }
  updateQuizHUD();
}

function revealAnswer(answer) {
  const el = document.querySelector('#quiz-components .hidden-comp');
  if (el) {
    el.classList.remove('hidden-comp'); el.innerHTML = '';
    const img = document.createElement('img');
    img.src = ITEM_IMG(answer); img.alt = answer;
    el.appendChild(img);
  }
}
