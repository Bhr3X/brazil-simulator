/**
 * English Translations & Cultural Localization for all 19 Brazilian Encounters
 * Provides natural, flavorful English adaptations of dialogues, slang, and outcomes.
 */

export const EN_ENCOUNTER_TEXTS = {
  PADARIA_ESTRELA: {
    title: '🥖 ESTRELA BAKERY OF PIRITUBA',
    intro: (state) => `
      The aroma of warm French bread and fresh drip coffee drifts onto the sidewalk.<br>
      The counter clerk in a coffee-stained apron asks in a raspy voice:<br>
      <em>"— Hey boss, the usual on the grill?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      pingado_pao: {
        label: 'Half-and-half coffee in American glass + Crispy toasted French bread',
        outcome: 'The toasted French bread arrived sizzling with melted butter, and the milky coffee hit the spot. Full stomach (+30%) and renewed sanity (+18%).'
      },
      coxinha_estufa: {
        label: 'Chicken & Catupiry coxinha from the warmer + Fresh sugarcane juice',
        outcome: (state, ptResult) => ptResult.includes('queimação')
          ? 'The coxinha was golden, but the heavy oil sat rough on your stomach. Gained 45% stomach, but got a harsh dose of São Paulo heartburn (-10% Sanity).'
          : 'Crispy coxinha, generous shredded chicken filling, and ice-cold sugarcane juice with lime! Stomach almost full (+45%).'
      },
      nota_100: {
        label: (state) => state.flags.tentouNota100
          ? 'Pay with R$ 100 bill (The cashier already warned you they have no change today)'
          : 'Try paying for a R$ 3.00 espresso with a R$ 100 bill',
        costLabel: 'Street Hustle Check (1x per day)',
        outcome: (state, ptResult) => ptResult.includes('respirada')
          ? 'The cashier took a deep breath, glared at you, but went into the back safe and handed you R$ 97.00 in crumpled small bills. Brazilian hustle victory (+5 Ginga)!'
          : '"— You kidding me, boss? 6:30 in the morning and you hand me a hundred-real bill?! No Pix?!" You left empty-handed with your ears burning (-12% Sanity).'
      },
      agua_copo: {
        label: (state) => state.flags.aguaPadaria
          ? 'Ask for tap water (Already had your glass of water today)'
          : 'Ask for a glass of tap water and browse the pastry display',
        costLabel: 'Free (1x per day)',
        outcome: 'The counter clerk handed you a plastic cup of ice water. Refreshed your head (+8% Sanity).'
      },
      pagar_boleto_enel: {
        label: 'Pay Enel electric bill at the bakery lottery cashier',
        outcome: 'Payment receipt printed on thermal paper! Huge relief: daily goal successfully completed (+35% Sanity)!'
      },
      fornada_cinco_manha: {
        label: (state) => {
          const isDawn = state.currentHour >= 5.0 && state.currentHour < 6.0 && ((state.elapsedSeconds || 0) >= 700);
          if (!isDawn) return '05:00 First Bake (Only available during dawn hours from 05:00 to 06:00)';
          return state.flags.primeiraFornada
            ? '05:00 First Bake (Quota used — next batch tomorrow at 5 AM)'
            : '🌅 First Bake of the Day (Piping Hot French Bread at 05:00) — R$ 5.00';
        },
        outcome: '🌅 The baker pulled the baking sheet of French bread crackling hot from the brick oven! Smells like victory, golden crispy crust. You survived the Pirituba night (+35% Stomach, +25% Sanity)!'
      }
    }
  },

  BAR_DO_TIAO: {
    title: '🍺 TIÃO\'S CORNER PUB // POOL & COLD BEER',
    intro: (state) => `
      Seu Tião wipes a glass behind the tiled counter as pagode music plays on a small transistor radio.<br>
      Two older regulars are intensely debating soccer over pickled eggs and cold beer:<br>
      <em>"— Welcome! Table is free, beer is sub-zero, and the bar tab is open if you\'re a regular."</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Danger: ${state.perigo}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      cerveja_600: {
        label: 'Order a 600ml ice-cold Brahma beer in a brown glass bottle',
        outcome: 'Seu Tião pulled a bottle frosted with ice right out of the cooler. The cold foam washed away the street exhaustion (-15% Danger, +22% Sanity, +10% Stomach).'
      },
      desafio_sinuca: {
        label: 'Challenge the local bar shark to an 8-ball pool game (R$ 10.00 bet)',
        costLabel: 'Pool Check (Ginga)',
        outcome: (state, ptResult) => ptResult.includes('Tabelou')
          ? 'You banked the 8-ball off the rail straight into the corner pocket! The old-timers clapped their hands: "— Kid has smooth hands!" You pocketed R$ 20.00 and earned street cred (+R$ 20.00, +15 Ginga)!'
          : 'You scratched the cue ball on the break and the old-timer cleaned the table in two turns. R$ 10.00 lost and a harsh lesson in neighborhood pool (-R$ 10.00, -10% Sanity).'
      },
      aposta_jogo_bicho: {
        label: 'Place a R$ 5.00 bet on the illegal animal lottery (Jogo do Bicho) with Seu Tião',
        costLabel: 'Animal Lottery (R$ 5.00)',
        outcome: (state, ptResult) => ptResult.includes('DEU BICHO')
          ? '🎰 JACKPOT ON THE DEER! The afternoon draw confirmed your number! Seu Tião reached into the wooden drawer and counted out R$ 50.00 in cash! Huge win in Pirituba (+R$ 50.00, +25 Ginga, +30% Sanity)!'
          : 'The 2 PM draw came out as Ostrich. Not your lucky day, but hoping is part of the Brazilian soul (-R$ 5.00, -5% Sanity).'
      },
      caderninho_fiado: {
        label: (state) => (state.debt || 0) >= 3500
          ? 'Ask for credit on the tab (Tião\'s ledger is capped: pay your debt first)'
          : 'Ask Seu Tião to put your drink on the tab (Credit)',
        costLabel: 'Put on Tab (Max R$ 35.00)',
        outcome: 'Seu Tião picked up his worn pencil behind his ear and scribbled your name in the spiral notebook: "— Pay me by the weekend, boss!" (+R$ 12.00 drink, debt recorded).'
      },
      ovo_conserva: {
        label: 'Eat a pink pickled egg and a pickled sausage from the counter jar',
        outcome: 'Vinegar, pepper, and street tradition. Heavy digestion, but filled your stomach on a budget (+28% Stomach, -6% Sanity).'
      }
    }
  },

  ADEGA_DO_ZE: {
    title: '🍷 ZÉ\'S LIQUOR & BEVERAGE SHOP',
    intro: (state) => `
      Crates of beer bottles stacked to the ceiling, ice chests humming, and funk beats echoing from a mounted loudspeaker.<br>
      Zé glances up from counting receipts behind the wire gate:<br>
      <em>"— Looking for cold brews, a pack of ice, or bringing cans to sell by the kilo?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Danger: ${state.perigo}%</small>
    `,
    options: {
      litrao_skol: {
        label: 'Buy a 1-liter Skol returnable bottle',
        outcome: 'Ice-cold 1-liter bottle cracked open right at the sidewalk curb. Refreshed your mood instantly (+18% Sanity, -10% Danger).'
      },
      vender_latinhas: {
        label: 'Sell the bag of crushed aluminum cans scavenged on the hill',
        costLabel: '+R$ 18.00 in Cash',
        outcome: 'Zé tossed the bag onto the analog hanging scale: "— Three point two kilos of clean aluminum!" He slapped R$ 18.00 in cash onto the counter (+R$ 18.00, +10 Ginga)!'
      },
      corote_canelinha: {
        label: 'Buy a bottle of cheap cinnamon cachaça (Corote)',
        outcome: 'Sweet, potent, and burning down your throat. Street anxiety vanished, but your stomach took a hit (-12% Stomach, +15% Sanity, +8 Ginga).'
      }
    }
  },

  FLANELINHA: {
    title: '🚗 UNOFFICIAL PARKING VALET AT THE CROSSING',
    intro: (state) => `
      A man in a yellow reflective vest with a rag draped over his shoulder waves his arms energetically:<br>
      <em>"— Back it up, boss! Cut the wheel, keep coming! Park here and nobody touches your ride!"</em><br>
      <small style="color:#ffcc00">Danger: ${state.perigo}% | Street Savvy: ${state.ginga}</small>
    `,
    options: {
      pagar_cinco: {
        label: 'Pay R$ 5.00 to guarantee your car won\'t be scratched',
        outcome: 'The valet tapped the hood with his rag: "— Right on, boss! Car is fully guarded. Peace of mind on Paula Ferreira!" (-R$ 5.00, -20% Danger, +10% Sanity).'
      },
      migue_cartao: {
        label: 'Try the classic excuse: "Only got credit card and Pix, bro!"',
        costLabel: 'Hustle Check',
        outcome: (state, ptResult) => ptResult.includes('máquininha')
          ? 'The valet pulled an orange card reader straight out of his back pocket: "— Accepts credit, debit, Pix, and crypto, boss!" You had to tap your card (-R$ 5.00, +5 Ginga).'
          : 'He gave an understanding nod: "— Tough times, huh boss? Go in peace, next time you get me!" Smooth talk saved your cash (+8 Ginga).'
      },
      peitar_rua: {
        label: 'Refuse to pay: "The street is public, pal!"',
        costLabel: 'High Confrontation',
        outcome: 'The valet stepped back with folded arms and a cold smirk: "— Street is public, boss, but glass is private..." You walked away with knots in your stomach (+30% Danger, -20% Sanity).'
      }
    }
  },

  POSTO_PIRITUBA: {
    title: '⛽ PIRITUBA 24H GAS STATION',
    intro: (state) => `
      Neon gas pump canopy illuminating the asphalt, attendant in uniform, and tires hissing on the tarmac.<br>
      <em>"— Ethanol or gas, chief? Want me to check the oil and wash the windshield?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}%</small>
    `,
    options: {
      abastecer_30: {
        label: 'Put R$ 30.00 of ethanol in the 2004 Celta',
        outcome: 'Fuel needle rose safely above the empty reserve! Relief from the fear of stalling out on the avenue (-R$ 30.00, +25% Sanity).'
      },
      calibrar_agua: {
        label: 'Check tire pressure at the air pump and drink from the water fountain',
        outcome: '30 PSI in all four tires and two hearty gulps of chilled water. Refreshed without spending a cent (+10% Sanity).'
      },
      fandangos_refri: {
        label: 'Buy a bag of corn chips and a soda at the convenience store',
        outcome: 'Classic snack run. High sodium and quick energy (+30% Stomach, +15% Sanity).'
      }
    }
  },

  PONTO_ONIBUS: {
    title: '🚌 SPTRANS BUS STOP // PIRITUBA TERMINAL',
    intro: (state) => `
      Crowd packed under the metal awning waiting for the 8400-10 bus line.<br>
      The diesel roar of approaching articulated buses echoes off the asphalt.<br>
      <em>"Attention passengers: tap your card on the validator."</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Danger: ${state.perigo}%</small>
    `,
    options: {
      pagar_onibus: {
        label: 'Pay bus fare with Bus Pass or cash (R$ 4.40)',
        outcome: 'Turnstile beeps green! You board, take a seat near the window, and watch the São Paulo cityscape glide by (+15% Sanity, -10% Danger).'
      },
      pular_catraca: {
        label: 'Jump the turnstile when the conductor looks away',
        costLabel: 'Ginga Check (Danger Risk)',
        outcome: (state, ptResult) => ptResult.includes('gato')
          ? 'Vaulted the bar like a cat! Slipped into the crowd at the back of the bus undetected (+12 Ginga, +10% Danger).'
          : 'Turnstile metal caught your knee with a loud CLANG! The driver hit the brakes: "— Get down, freeloader!" Walked away humiliated and limping (-20% Sanity, +25% Danger).'
      }
    }
  },

  DOIS_CARAS_MOTO: {
    title: '🏍️ TWO DUDES ON A MOTORCYCLE // NIGHT STICK-UP',
    intro: (state) => `
      The buzzing sound of an exhaust pipe cuts through the dark evening air.<br>
      A black 160cc motorcycle mounts the sidewalk curb and blocks your path:<br>
      <em>"— DON\'T MOVE! Pass the phone and the wallet! Quick!"</em><br>
      <strong style="color:#ff3333">HIGH ADRENALINE SITUATION! CHOOSE YOUR REACTION:</strong>
    `,
    options: {
      entrar_padoca: {
        label: 'Duck quickly into the bakery before they pull over',
        outcome: 'You sprinted through the bakery doors! The bright fluorescent lights and patrons startled the riders, and they sped off (-20% Danger, +15 Ginga)!'
      },
      dar_celular_falso: {
        label: 'Hand over the decoy cracked phone: "Take it bro, don\'t shoot!"',
        costLabel: 'Street Smarts (Decoy Phone)',
        outcome: 'The rider snatched the decoy phone, stuffed it in his jacket, and sped away. Your real phone and wallet stayed safe in your sock! Masterful street survival (+20 Ginga, -30% Danger)!'
      },
      orelhao_disfarce: {
        label: 'Pretend you\'re making an urgent call at the payphone',
        outcome: (state, ptResult) => ptResult.includes('despistar')
          ? 'You faked an animated conversation with your back turned. They decided you weren\'t worth the risk and zoomed off (+15 Ginga)!'
          : 'They weren\'t fooled for a second. The rider patted your pockets and snatched whatever cash you had on you (-R$ 20.00, -25% Sanity, +20% Danger).'
      }
    }
  },

  BANCA_JORNAL: {
    title: '📰 MÁRIO\'S CORNER NEWSSTAND',
    intro: (state) => `
      Magazines, comics, cold drinks, and lottery tickets hanging from clotheslines in the booth.<br>
      Seu Mário pushes his glasses up his nose:<br>
      <em>"— Morning, young blood! Got the daily news, crossword puzzles, and the latest gossip on the mayor."</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      raspadinha_sorte: {
        label: 'Buy a R$ 2.00 lucky scratch-off ticket',
        outcome: (state, ptResult) => ptResult.includes('PREMIADA')
          ? '🎉 WINNER! Three matching treasure symbols! Seu Mário handed you R$ 25.00 in crisp bills (+R$ 25.00, +20% Sanity)!'
          : 'Scratch-off came up empty: "Try again next time!" (-R$ 2.00, -3% Sanity).'
      },
      comprar_almanaque: {
        label: 'Buy the Historical Almanac of Pirituba (R$ 15.00)',
        outcome: 'Fascinating read about the English railway origins of Pirituba, the old brickworks, and the green hills (+30% Sanity, Almanac added to inventory).'
      },
      fofoca_bairro: {
        label: 'Chat with Seu Mário about neighborhood politics and gossip',
        outcome: 'Seu Mário shared all the local lore: "— That corner crossing has seen it all since the 70s..." (+10% Sanity).'
      }
    }
  },

  PASTEL_FEIRA: {
    title: '🥟 DONA MARIA\'S STREET MARKET PASTEL STALL',
    intro: (state) => `
      Bubbling hot oil, golden crispy pastels, and fresh lime sugarcane juice flowing from the press.<br>
      <em>"— Step right up, darling! Fresh beef, cheese, hearts of palm, and special pastels made with love!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}%</small>
    `,
    options: {
      combo_pastel_garapa: {
        label: 'Crispy beef pastel with vinaigrette + Sugarcane juice with lime',
        outcome: 'The king of Brazilian street food! Piping hot, crispy bubbles, delicious seasoning, and iced sugarcane juice. Stomach fully satisfied (+50% Stomach, +20% Sanity).'
      },
      pastel_simples: {
        label: 'Simple melted cheese pastel',
        outcome: 'Crispy, gooey melted cheese stretching with every bite. Great comfort food on a budget (+35% Stomach, +12% Sanity).'
      },
      xepa_conversa: {
        label: 'Wait for the end-of-market discount and ask for leftover scraps',
        outcome: 'Dona Maria smiled warmly and handed you a warm pastel parcel: "— Take it, dear, eat well!" Free food through neighborly kindness (+30% Stomach, +15% Sanity).'
      }
    }
  },

  SEMAFORO_BICO: {
    title: '🚦 EDGAR FACÓ TRAFFIC LIGHT // STREET HUSTLE',
    intro: (state) => `
      Line of idling cars, heat shimmering off the asphalt, and the countdown timer ticking on the traffic light.<br>
      <em>Opportunity to earn quick honest cash between red lights!</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Street Savvy: ${state.ginga}</small>
    `,
    options: {
      vender_balas: {
        label: 'Sell peanut candy and mints between stopped cars',
        outcome: 'Walking briskly between lanes, offering treats to drivers. Earned R$ 15.00 in coins before the light turned green (+R$ 15.00, +10 Ginga, -10% Stomach)!'
      },
      limpar_parabrisa: {
        label: 'Spray squeegee and wipe windshields at the red light',
        outcome: 'Quick soapy spray, smooth squeegee pull, and a grateful driver tipped you R$ 10.00! Honest street hustle (+R$ 10.00, +8 Ginga, -8% Stomach).'
      },
      sair_canteiro: {
        label: 'Step back onto the pedestrian median and catch your breath',
        outcome: 'Stepped out of the exhaust fumes and rested on the concrete curb (+5% Sanity).'
      }
    }
  },

  BAILE_LAJE: {
    title: '🔊 ROOFTOP STREET PARTY ATOP THE HILL',
    intro: (state) => `
      Wall of massive sound systems booming bass, colored strobe lights over the brick terraces, and the whole neighborhood dancing.<br>
      <em>"Welcome to the Pirituba Rooftop Funk! Leave your worries down the hill!"</em><br>
      <small style="color:#ffcc00">Sanity: ${state.sanidade}% | Danger: ${state.perigo}% | Street Savvy: ${state.ginga}</small>
    `,
    options: {
      copao_whisky: {
        label: 'Grab a big plastic cup of cheap whiskey & energy drink (R$ 15.00)',
        outcome: 'Ice cubes clinking, sweet buzz, and bass shaking your ribs. Urban stress evaporated (+35% Sanity, +15 Ginga, -15% Stomach).'
      },
      dancar_passinho: {
        label: 'Show off your funk dance moves in the circle',
        outcome: 'Synchronized footwork, crowd cheered and hyped you up! Instant neighborhood respect (+25 Ginga, +20% Sanity).'
      },
      desenrolo_crias: {
        label: 'Talk with the local homies by the speaker wall',
        outcome: 'Great friendly conversation about life, jobs, and dreams on the hill (+15% Sanity, -15% Danger).'
      }
    }
  },

  BLITZ_PM: {
    title: '🚔 MILITARY POLICE CHECKPOINT ON PAULA FERREIRA',
    intro: (state) => `
      Red and blue lightbars flashing against the houses in the dead of night.<br>
      Two police cruisers parked across the street with officers inspecting IDs:<br>
      <em>"— HALT RIGHT THERE, CITIZEN! Hands where I can see them and step against the wall!"</em><br>
      <strong style="color:#ff3333">HIGH DANGER SITUATION! CHOOSE YOUR ATTITUDE:</strong>
    `,
    options: {
      apresentar_documento: {
        label: 'Stay calm, keep hands visible, and present your ID',
        costLabel: 'Cool Citizen',
        outcome: (state, ptResult) => ptResult.includes('esculacho')
          ? 'Because you were noticeably nervous, officers conducted a thorough pat-down: pockets emptied, shoes checked on the cold asphalt. Nothing illegal, but the humiliation stung deep (-30% Sanity).'
          : 'The sergeant inspected your national ID and checked the radio: "— Clean record. Watch your hours around here, son. Move along." (-40% Danger, massive relief)!'
      },
      desenrolo_ginga: {
        label: 'Speak respectfully as a local: "Good evening, sergeant! Born and raised in Pirituba!"',
        costLabel: 'Smooth Talk (Requires Ginga 55)',
        outcome: (state, ptResult) => ptResult.includes('tranquila')
          ? 'Your calm demeanor and respectful tone broke the tension immediately. The officer smiled: "— Resident of the area? Go in peace, head straight home." (+20 Ginga, -50% Danger)!'
          : 'Your voice trembled and you stuttered. The officer frowned: "— Shaking for what? Something to hide?!" Pushed you against the car for a stern lecture (-35% Sanity, +25% Danger).'
      },
      viela_atalho: {
        label: 'Silently back away down the alley before being spotted',
        costLabel: 'Stealth Escape',
        outcome: (state, ptResult) => ptResult.includes('penumbra')
          ? 'You took two quiet steps back and vanished into the shadows of the graffiti alley. The officers never even noticed (+15 Ginga, -20% Danger)!'
          : 'A sharp whistle cut through the air: "— HALT RIGHT THERE! STOP NOW!" You had to sprint for your life, jumping puddles to lose the cruiser (+45% Danger, -30% Sanity).'
      }
    }
  },

  NPC_BALEIRO: {
    title: '🍬 CLODOALDO THE CANDY VENDOR // EDGAR FACÓ',
    intro: (state) => `
      Clodoaldo walks steadily with his blue-and-white styrofoam cooler slung across his chest and a backwards cap.<br>
      <em>"— Fresh candy! Peanut bars, strong mints, and ice-cold energy drinks! What\'ll it be today, warrior?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      comprar_pacoca: {
        label: 'Buy Peanut Candy & Strong Mints Kit (Quick Energy)',
        outcome: 'You chew the crumbly peanut sweet and pop a strong mint. Instant sugar rush (+25% Stomach, +5 Ginga).'
      },
      comprar_energetico: {
        label: 'Buy an Ice-Cold 500ml Energy Drink (R$ 8.00)',
        outcome: 'Chilled bubbly gulp! Taurine and carbonation grant an instant mental reboot (+30% Sanity).'
      },
      bico_fardo: {
        label: (state) => (state.flags.bicoFardoCount || 0) >= 2
          ? 'Help unload crates (Odd jobs finished for today)'
          : 'Help Clodoaldo unload a heavy soda crate at the corner',
        costLabel: '+R$ 10.00 | -8% Hunger',
        outcome: 'Muscle work! In three minutes the crate is neatly stacked. Clodoaldo hands you a crumpled ten-real bill: "— Thanks partner, saved my day!" (+R$ 10.00, +8 Ginga, -8% Stomach).'
      },
      conversar_ambulante: {
        label: 'Ask for the lowdown on street movement and traffic',
        outcome: 'Clodoaldo gives sound advice: "— Keep your wits about you near the traffic light after six; motorbikes circle around. If you need solid food, find Dona Neide near the market!" (+10% Sanity).'
      }
    }
  },

  NPC_CARAMELO: {
    title: '🐕 CARAMELO OF PIRITUBA // THE COMMUNITY DOG',
    intro: (state) => `
      The legendary yellow stray dog Caramelo trots up cheerfully along the sidewalk, ears perked and tail wagging like crazy.<br>
      He lets out a friendly bark and leans his head against your leg, asking for affection.<br>
      <small style="color:#00ff88">★ The Spiritual Guardian of Pirituba\'s Streets ★</small>
    `,
    options: {
      carinho_caramelo: {
        label: 'Give a hearty scratch behind the ears',
        outcome: 'Caramelo closes his eyes, licks your hand, and wiggles with joy. Big city stress completely evaporates (+20% Sanity, -10% Danger)!'
      },
      alimentar_caramelo: {
        label: (state) => state.flags.carameloCompanheiro
          ? 'Caramelo is already your loyal street guardian!'
          : 'Share a piece of street snack / pastry with Caramelo',
        costLabel: 'R$ 4.00 (Buy coxinha treat)',
        outcome: 'Caramelo devours the treat with legendary canine zeal and barks triumphantly! He is now your official Pirituba protector, reducing street danger (-20% Danger, +25% Sanity)!'
      },
      seguir_faro: {
        label: (state) => state.flags.faroCaramelo
          ? 'Follow dog\'s nose (Already found buried items today)'
          : 'Follow Caramelo sniffing at the base of a sidewalk tree',
        costLabel: 'Golden Sniffer',
        outcome: 'Caramelo digs quickly into the soil and unearths a R$ 5 bill and a handful of dropped coins! (+R$ 8.50, +10% Sanity).'
      }
    }
  },

  NPC_BIKE: {
    title: '🚲 JUNINHO ON HIS BICYCLE // WHEELIE MASTER',
    intro: (state) => `
      Juninho skids his red vintage bicycle up to the curb with a smooth flick of the handlebars.<br>
      <em>"— What\'s good, bro! All good? If you need a ride on the bike peg or a quick errand run, just shout!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Street Savvy: ${state.ginga}</small>
    `,
    options: {
      carona_padaria: {
        label: 'Ask for a ride on the bike peg to Estrela Bakery (R$ 3.00)',
        outcome: 'You hopped onto the back peg and Juninho sped down Paula Ferreira, ringing his bell! Arrived at the bakery in the blink of an eye (+5 Ginga).'
      },
      carona_posto: {
        label: 'Ask for a ride on the bike peg to Pirituba Gas Station (R$ 3.00)',
        outcome: 'Wind in your face and rapid pedaling! Juninho wove through Edgar Facó traffic and dropped you right at the gas station door (+5 Ginga).'
      },
      bico_marmita: {
        label: (state) => state.flags.correBike
          ? 'Meal box delivery (Delivery already completed today)'
          : 'Take an express meal box delivery to the bus stop',
        costLabel: '+R$ 20.00 | -10% Hunger',
        outcome: 'Grabbed the thermal bag and jogged to the bus stop. Delivery completed on time and payment in hand! (+R$ 20.00, +12 Ginga, -10% Stomach).'
      },
      desafio_grau: {
        label: 'Learn the secret to pulling a 1-wheel bike wheelie (Chat)',
        outcome: 'Juninho pops a flawless 1-wheel wheelie: "— Secret is rear brake control and hip balance, bro!" (+10 Ginga, +10% Sanity).'
      }
    }
  },

  NPC_DONA_NEIDE: {
    title: '🥘 DONA NEIDE // THE MEAL BOX & MARKET AUNTIE',
    intro: (state) => `
      Dona Neide walks calmly up the sidewalk with a floral apron and market bags full of fresh herbs and plantains.<br>
      <em>"— Oh my child! Good to see you. You look like you\'ve been running errands since dawn. Need some home-cooked food in your belly or a mother\'s blessing?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      comprar_marmita: {
        label: (state) => state.fome <= 20
          ? 'Accept home-cooked meal box (Dona Neide gives it free to anyone starving!)'
          : 'Buy Dona Neide\'s Homemade Meal Box (Rice, beans, steak, and farofa)',
        costLabel: (state) => state.fome <= 20 ? 'FREE (Solidarity)' : 'R$ 14.00',
        outcome: (state) => state.fome <= 20
          ? 'Dona Neide touches your shoulder warmly: "— Eat every bite, my child! Nobody walks this pavement on an empty stomach." Delicious home cooking restores your strength immediately (+50% Stomach, +25% Sanity, Free)!'
          : 'Packed styrofoam meal box, fresh beans with homestyle garlic, and juicy steak. You eat seated on the curb like a king (+50% Stomach, +25% Sanity).'
      },
      ajudar_sacolas: {
        label: (state) => state.flags.ajudouDonaNeide
          ? 'Help carry bags (Already helped Dona Neide today)'
          : 'Help carry heavy grocery bags up to the alleyway',
        costLabel: '+R$ 10.00 Coffee Money | +Corn Cake',
        outcome: 'You take both heavy bags and escort Dona Neide to the corner. She smiles gratefully, tucks a ten-real bill into your pocket, and hands you a warm slice of fresh corn cake (+R$ 10.00, +15% Stomach, +12 Ginga, +15% Sanity)!'
      },
      fofoca_bairro: {
        label: 'Listen to motherly advice and neighborhood gossip',
        outcome: 'Dona Neide shares her wisdom: "— Watch out, sweet child: afternoon storms hit hard, sky turns black! And don\'t flash cash on the avenue. Stay safe and God bless you!" (+20% Sanity, -15% Danger).'
      }
    }
  },

  BANCO_PIRITUBA: {
    title: '🏧 BANCO PIRITUBA // 24H ATM NETWORK',
    intro: (state) => {
      const isNegative = state.grana < 0;
      const statusText = isNegative
        ? `<strong style="color:#ff3344">⚠️ ACCOUNT OVERDRAWN: ${state.formattedGrana} (LIMIT: -R$ 150.00) • SERASA DEADLINE: ${Math.max(0, Math.ceil(90 - (state.bankruptTimer || 0)))}s</strong>`
        : `<span style="color:#00ff88">Available Balance: ${state.formattedGrana} • Credit Status: GOOD STANDING</span>`;
      return `
        The ATM screen emits a sterile blue glow in the semi-darkness.<br>
        The rubber keypad is worn by thousands of neighborhood fingers.<br>
        <em>"Banco Pirituba: Connecting you to your money (or your debts)."</em><br>
        <small>${statusText}</small>
      `;
    },
    options: {
      saque_cheque_especial: {
        label: (state) => state.grana <= -10000
          ? 'Overdraft Blocked (Credit limit nearly exhausted)'
          : 'Take Emergency Bank Overdraft (Immediate cash, brutal interest)',
        costLabel: 'Overdraft (-R$ 50.00 on account)',
        outcome: 'Banknotes dispense smoothly from the lower tray. Instant relief, but your balance is in the red! Settle the debt before 90 seconds or your national ID will be blacklisted and you\'ll lose the run!'
      },
      quitar_divida_banco: {
        label: (state) => state.grana >= 0
          ? 'Cash Deposit (Account is already in positive balance)'
          : 'Deposit Cash to Settle Overdraft Debt',
        costLabel: (state) => state.grana >= 0 ? 'Savings Deposit' : 'Pay Down Debt',
        outcome: 'You insert the cash deposit envelope. The immediate clearance relieves your account and banishes the threat of bankruptcy (+15% Sanity)!'
      },
      consulta_extrato_serasa: {
        label: 'Check Detailed Bank Statement & Credit Score',
        costLabel: 'Free',
        outcome: (state) => {
          if (state.grana < 0) {
            const timeLeft = Math.max(0, Math.ceil(90 - (state.bankruptTimer || 0)));
            return `URGENT NOTICE FROM BANCO PIRITUBA: Your balance is ${state.formattedGrana}. You have exactly ${timeLeft} seconds remaining before judicial asset forfeiture ends your journey!`;
          }
          return `ACCOUNT STATEMENT: Positive balance of ${state.formattedGrana}. Your credit score is favorable and there are no active liens against your name. Move forward (+5% Sanity).`;
        }
      }
    }
  },

  NPC_POLICIA: {
    title: '👮 SERGEANT ROCHA // MILITARY POLICE OF SÃO PAULO',
    intro: (state) => {
      const isHighDanger = state.perigo >= 45;
      const statusNote = isHighDanger
        ? `<strong style="color:#ff3344">⚠️ YOUR HEAT IS HIGH (${state.perigo}%)! THE SERGEANT HAS HIS HAND ON HIS HOLSTER!</strong>`
        : `<span style="color:#00ff88">Heat Level: ${state.perigo}% • Routine Patrol in Pirituba</span>`;
      return `
        The gray uniform and marked cruiser on the curb command authority.<br>
        Sergeant Rocha sizes you up from head to toe with seasoned eyes:<br>
        <em>"— Anything new around here, citizen? The 49th Battalion does not tolerate disorder."</em><br>
        <small>${statusNote}</small>
      `;
    },
    options: {
      cumprimentar_pm: {
        label: (state) => state.perigo >= 45
          ? 'Try friendly conversation (Your heat level is too high!)'
          : 'Greet respectfully and wish a safe patrol',
        costLabel: 'Model Citizen',
        outcome: 'The Sergeant offers a crisp salute to his beret: "— Good afternoon, law-abiding citizen. If you spot any suspicious activity on Paula Ferreira, let the cruiser know." (+16% Sanity, -12% Danger).'
      },
      caguetar_malandro: {
        label: (state) => state.flags.caguetouMalandro
          ? 'Report local crime (You already tipped off the patrol today)'
          : 'Snitch on the street runner and report the drug spot on Bento Bicudo',
        costLabel: '+R$ 40.00 Reward | Snitch Tag',
        outcome: 'The officer pulls out a notepad and writes down the exact alley location: "— Good job, partner. First-class intel. Take R$ 40.00 from our community fund." You walk away with cash, but feel the chill of becoming a known snitch...'
      },
      enquadro_suborno: {
        label: (state) => state.perigo < 45
          ? 'Pay "Cruiser Coffee" (Available only during high danger)'
          : 'Pay "Cruiser Coffee" (R$ 35.00 bribe to avoid the paddy wagon)',
        costLabel: 'Bribe R$ 35.00',
        outcome: 'The sergeant discreetly pockets the bill into his duty belt: "— Walk away slowly and don\'t look back. If I catch you again today, you\'re going to the 33rd Precinct!" (-R$ 35.00, -35% Danger, -12% Sanity).'
      },
      enquadro_revista: {
        label: 'Comply with police stop-and-frisk: "Hands on your head and spread your legs!"',
        costLabel: 'Police Search',
        outcome: 'The sergeant checks your pockets, runs your ID on the cruiser radio, and pats your shoulder: "— Clean record on COPOM. Go about your business, but stay sharp." Harsh street stop (-20% Sanity, -15% Danger).'
      }
    }
  },

  NPC_MALANDRO: {
    title: '🧢 STREET RUNNER // PIRITUBA HUSTLER',
    intro: (state) => {
      if (state.flags.caguetouMalandro) {
        return `
          <strong style="color:#ff2233">🚨 THE RUNNER STARES AT YOU WITH PURE HATRED!</strong><br>
          Word traveled fast on the street: you were seen chatting with the Police Sergeant!<br>
          <em>"— Talked to the cops, huh snitch?! Snitches don\'t last on this turf!"</em><br>
          <small style="color:#ffcc00">Danger: ${state.perigo}% | Balance: ${state.formattedGrana}</small>
        `;
      }
      return `
        Track shorts, chain, and flip-flops on the hot asphalt of Cel. Bento Bicudo.<br>
        The Street Runner keeps watch on the corner while chewing gum:<br>
        <em>"— What\'s up, partner! You on your toes or slipping around here?"</em><br>
        <small style="color:#00ff88">Street Savvy: ${state.ginga}% | Balance: ${state.formattedGrana} | Danger: ${state.perigo}%</small>
      `;
    },
    options: {
      cobranca_pedagio: {
        label: 'Pay snitch ransom toll (R$ 50.00)',
        costLabel: 'R$ 50.00 Snitch Ransom',
        outcome: 'The runner rips the bills from your hand: "— Mistake paid for. But if you open your mouth to the Sergeant again, you disappear!" Your wallet weeps (-R$ 50.00, -25% Sanity).'
      },
      cobranca_apanhar: {
        label: 'Defy the hustler and take a beating in the alley',
        costLabel: 'Street Violence',
        outcome: 'Two accomplices emerge from the alley. You take a brutal beating, hitting the asphalt with torn clothes and bruised ribs (-30% Stomach, -35% Sanity, +20% Danger)!'
      },
      salve_quebrada: {
        label: 'Give a respectful handshake and talk smoothly',
        costLabel: 'Street Respect',
        outcome: 'You do the traditional West Zone hand clasp: "— Much respect, bro. Humility goes a long way." (+14% Sanity, +10 Ginga).'
      },
      fazer_corre_crime: {
        label: 'Do a "Street Runner Delivery" (Drop off mystery package on Emílio Lessore)',
        costLabel: '+R$ 75.00 Fast Cash | +35% Danger',
        outcome: 'You tuck the sealed package into your waistband and sprint up Emílio Lessore. Quick drop-off, and you return with R$ 75.00 in warm cash (+$$$$$), but your heat spiked (+35% Danger, +18 Ginga)!'
      },
      assalto_mao_armada: {
        label: (state) => state.perigo < 45
          ? 'Buy a single cigarette from the pack'
          : 'Armed hold-up: "Hand over your wallet and phone now!"',
        costLabel: (state) => state.perigo < 45 ? 'R$ 2.00' : 'Robbery (-R$ 25.00)',
        outcome: (state) => state.perigo < 45
          ? 'You puff a cigarette on the corner watching the cars pass on Edgar Facó (-R$ 2.00, +10% Sanity).'
          : 'The kid flashes a chrome revolver handle under his shirt: "— Lost, clown! Hand over the cash!" He takes R$ 25.00 from your pocket (-R$ 25.00, -20% Sanity).'
      }
    }
  },

  ELEVADOR_PENTHOUSE: {
    title: '🛗 PENTHOUSE ELEVATOR (JARAGUÁ TOWER)',
    intro: (state) => `
      The private elevator's crystal-liquid touchscreen panel glows in cyan.<br>
      Behind you, the 180° panoramic view of Pico do Jaraguá dominates the penthouse.<br>
      The main lobby and concierge desk are 12 floors below.<br>
      <small style="color:#00f5d4">Triplex Penthouse • 12th Floor • Jaraguá Tower</small>
    `,
    options: {
      descer_terreo: {
        label: 'Take elevator down to lobby (Ground Floor / Street Access)',
        costLabel: 'Ride 12 Floors Down (Free)',
        outcome: 'The panoramic elevator descends smoothly across all 12 floors down to the main lobby. The brushed steel doors slide open at the concierge entrance ready for you to explore Pirituba!'
      },
      ficar_cobertura: {
        label: 'Stay in penthouse and admire the panoramic view of Pico do Jaraguá',
        costLabel: '+10% Sanity (Relax)',
        outcome: 'You take a deep breath looking out at the verdant mountain ridge on the horizon and miniature cars on Edgar Facó. An invigorating breeze lifts your spirits (+10% Sanity).'
      }
    }
  },

  ELEVADOR_TERREO: {
    title: '🛗 LOBBY ELEVATOR (JARAGUÁ TOWER)',
    intro: (state) => `
      The high-speed elevator with brushed steel doors awaits in the social lobby.<br>
      The concierge nods cordially from the polished black granite desk.<br>
      The illuminated call button provides direct private access up to the Triplex Penthouse.<br>
      <small style="color:#00f5d4">Concierge Lobby • Ground Floor • Jaraguá Tower</small>
    `,
    options: {
      subir_penthouse: {
        label: 'Ride elevator up to Penthouse (12th Floor - Jaraguá View)',
        costLabel: 'Ride 12 Floors Up (Free)',
        outcome: 'The doors close with a soft chime and the elevator ascends in seconds to the 12th floor. The breathtaking 180-degree vista of Pico do Jaraguá unfolds through the floor-to-ceiling glass walls!'
      },
      sair_rua: {
        label: 'Step out onto the streets of Pirituba',
        costLabel: 'Main Gate',
        outcome: 'You step through the revolving glass doors onto the Pirituba sidewalk, feeling the authentic urban heat of São Paulo asphalt!'
      }
    }
  },

  BLOCO_CARNAVAL: {
    title: '🥁 EDGAR FACÓ CARNIVAL BLOCO',
    closed: '[CLOSED] BLOCO OUTSIDE EVENT HOURS',
    unavailable: 'The bloco master already closed your dance slot for this run.',
    news: {
      bloco_danca: 'Danced with the carnival bloco on Edgar Facó'
    },
    intro: (state) => `
      The bloco master holds his whistle beside the parked trio, the bass drum still warm.<br>
      Confetti on the plaza and the cortege locked to the event clock.<br>
      <em>"— Join the circle, warrior! Edgar Facó is a runway today!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Sanity: ${state.sanidade}% | Street Savvy: ${state.ginga}</small>
    `,
    options: {
      dancar_bloco: {
        label: (state) => state.flags.dancouBloco
          ? 'Dance in the bloco (You already took your turn this run)'
          : 'Join the circle and dance until the whistle',
        costLabel: 'Parade rhythm (1x per run)',
        outcome: (state, ptResult) => ptResult.includes('escorregou')
          ? 'Your foot slipped on confetti and the whistle laughed. The circle kept you upright, but the vibe cooled (-8% Sanity, +5 Ginga).'
          : 'The bass drum locked your step, the whistle closed the phrase, and the whole cortege answered (+15 Ginga, +20% Sanity)!'
      }
    }
  },

  CHURRASCO_CAMPO: {
    title: '🍖 CAMPINHO BARBECUE',
    closed: '[CLOSED] CAMPINHO OUTSIDE EVENT HOURS',
    unavailable: 'The grill cook already filled your pelada slot for this run.',
    news: {
      churrasco_prato: 'Ate a barbecue plate at the favela campinho',
      pelada_campo: 'Played a pickup match on the favela pitch'
    },
    intro: (state) => `
      The grill cook turns meat beside the brick barbecue, smoke rising over the favela plateau.<br>
      The pickup game stays off the fire and the hillside connector.<br>
      <em>"— Hot plate off the grill, or jump into the pelada?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      prato_churrasco: {
        label: (state) => state.canAfford(1800)
          ? 'Order the campinho plate (grilled steak, farofa, and vinagrete)'
          : 'Order the campinho plate (Need R$ 18.00 — grill stays covered)',
        costLabel: 'R$ 18.00',
        outcome: (state, ptResult) => ptResult.includes('sem os R$')
          ? 'The cook covers the grill: without R$ 18.00 the plate does not leave. Nothing was charged and the fire stays put.'
          : 'Hot plate, moist farofa, and vinagrete on point. Stomach thanks you and your head cools down (-R$ 18.00, +40% Stomach, +22% Sanity).'
      },
      pelada_campo: {
        label: (state) => state.flags.jogouPelada
          ? 'Join the pelada (You already played your match this run)'
          : 'Ask to join the campinho pickup game',
        costLabel: 'One match (1x per run)',
        outcome: (state, ptResult) => ptResult.includes('escapou')
          ? 'The ball squirmed off your toe and you chased it to the end. You missed the play but earned the shirt (+8 Ginga, +6% Sanity, -10% Stomach).'
          : 'You received at midfield, squared it low, and the plateau yelled goal (+18 Ginga, +12% Sanity, -6% Stomach)!'
      }
    }
  },

  BARBEARIA_ACLIVE: {
    title: '💈 SEU ANTÔNIO\'S BARBERSHOP',
    intro: (state) => `
      The crisp scent of menthol aftershave and fine talcum powder fills the cozy shop.<br>
      Seu Antônio strops his straight razor on leather and gestures warmly to the swivel chair:<br>
      <em>"— Come right in, my friend! Haircut, razor beard trim, or just sharpening up your look?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Ginga: ${state.ginga} | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      corte_degrade: {
        label: 'Razor fade haircut + Straight-razor beard styling with hot towel',
        outcome: 'Sharp fade taper and straight-razor beard styling with an aromatic hot towel. Confidence through the roof (+28% Sanity, +20 Ginga)!'
      },
      papo_futebol: {
        label: (state) => state.flags.falouSeuAntonio
          ? 'Chat with Seu Antônio (Already talked with him today)'
          : 'Talk soccer and local neighborhood stories',
        costLabel: 'Free (1x per day)',
        outcome: 'Seu Antônio reminisced about the 1994 World Cup, debated local football tactics, and gave you golden advice (+12% Sanity, +5 Ginga).'
      },
      comprar_pomada: {
        label: 'Buy matte styling hair pomade',
        outcome: 'Rock-solid hairstyle that withstands the humid breeze of Paula Ferreira hill (+15 Ginga, +10% Sanity).'
      }
    }
  },

  ACOUQUE_BOI_DE_OURO: {
    title: '🥩 BOI DE OURO BUTCHER SHOP',
    intro: (state) => `
      Stainless steel hooks with fresh prime cuts and the rhythmic chop of the cleaver on the wood block.<br>
      The butcher in a clean white apron gives you a hearty wave:<br>
      <em>"— Good morning, boss! Today the picanha and country sausage are top notch!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      comprar_linguica: {
        label: 'Buy 1kg of handcrafted seasoned country sausage',
        outcome: 'Juicy country sausage grilled to perfection with herbs and mild pepper. Hunger vanquished (+40% Stomach, +15% Sanity).'
      },
      comprar_carne_churrasco: {
        label: 'Buy a prime cut of aged picanha rump steak',
        outcome: 'Tender steak grilled over rock salt with a golden fat cap. A royal meal on the Freguesia hill (+55% Stomach, +28% Sanity, +10 Ginga)!'
      },
      pedir_osso_sopa: {
        label: (state) => state.flags.pegouOssoAcougue
          ? 'Ask for a marrow bone for broth/dog (Already claimed today)'
          : 'Ask for a beef marrow bone for soup broth',
        costLabel: 'Free (1x per day)',
        outcome: 'The butcher neatly wraps a rich marrow bone: "— Simmer this into a hearty broth that resurrects the dead!" (+8% Sanity, +5% Stomach).'
      }
    }
  },

  HORTIFRUTI_PAULA_FERREIRA: {
    title: '🍎 HILLSIDE FRESH PRODUCE MARKET',
    intro: (state) => `
      Wooden crates overflowing with colorful tropical fruits, fresh coriander, and sweet oranges from CEAGESP.<br>
      The market lady mists the leafy greens with cool water and smiles:<br>
      <em>"— Welcome! Sweet fruit, crisp greens, and cold fresh coconut water for your hill climb!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      duzia_banana: {
        label: 'Buy a dozen ripe bananas',
        outcome: 'Sweet, potassium-packed bananas to tackle the steep uphill climb without cramping (+25% Stomach, +12% Sanity).'
      },
      agua_coco: {
        label: 'Drink a freshly drilled ice-cold coconut water',
        outcome: 'Naturally sweet and sub-zero cold coconut water with a straw. Pure hydration under the Pirituba sun (+15% Stomach, +22% Sanity)!'
      },
      escolher_laranja: {
        label: (state) => state.flags.provouFrutaLadeira
          ? 'Taste sample fruit at the stand (Already sampled today)'
          : 'Accept a freshly sliced segment of sweet tangerine',
        costLabel: 'Free (1x per day)',
        outcome: 'She hands you a juicy segment: "— Sweet as honey!" Refreshed your throat and brightened your mood (+6% Sanity, +5% Stomach).'
      }
    }
  },

  BOTECO_LADEIRA: {
    title: '🍻 HILLSIDE CORNER BAR (SNOOKER & DOMINOES)',
    intro: (state) => `
      Domino tiles slam down loudly onto wooden tables under the bright yellow awning.<br>
      Retirees in straw hats laugh heartily as a brown beer bottle chills in an ice bucket:<br>
      <em>"— Who's next to take a beating in dominoes? Pull up a chair, partner!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Ginga: ${state.ginga} | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      partida_domino: {
        label: (state) => state.flags.jogouDominoLadeira
          ? 'Play domino wager match (Already played your match this run)'
          : 'Challenge the seasoned veterans to dominoes (R$ 5.00 bet)',
        costLabel: 'R$ 5.00 bet (1x per run)',
        outcome: (state, ptResult) => ptResult.includes('BUCHA DE SENA')
          ? '— DOUBLE SIX SLAMMED DOWN! You sealed the table on the first read. The old-timers cheered and handed over R$ 15.00 (+R$ 15.00, +16 Ginga, +18% Sanity)!'
          : 'Seu Ditinho trapped your corner with a sly move! You lost R$ 5.00, but earned the table\'s deep respect (+5 Ginga, +6% Sanity).'
      },
      cerveja_torresmo: {
        label: '600ml ice-cold bottled beer + Plate of crispy pork cracklings (torresmo)',
        outcome: 'A cold lager with a snowy foam collar and cracklings that crunch with every bite. The fatigue of the climb vanished instantly (+32% Stomach, +24% Sanity).'
      },
      prosa_balcao: {
        label: (state) => state.flags.prosaLadeira
          ? 'Hear bar stories (Already talked today)'
          : 'Sip sparkling water and listen to old tales of Pirituba',
        costLabel: 'Free (1x per day)',
        outcome: 'The bartender recalls when Paula Ferreira was a dirt road and trams ran up to the church. Pure São Paulo nostalgia (+10% Sanity).'
      }
    }
  },

  CASA_DO_NORTE: {
    title: '☀️ ASA BRANCA NORTHEASTERN EMPORIUM',
    intro: (state) => `
      The mouth-watering aroma of cured sun-dried beef sizzling in clarified butter and grilled coalho cheese fills the air.<br>
      Northeastern forró music plays softly as the owner welcomes you with open arms:<br>
      <em>"— Welcome! True northeastern sustenance to handle any grind in São Paulo!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      baiao_dois: {
        label: 'Hearty plate of Baião de Dois with sun-dried beef and coalho cheese',
        outcome: 'Black-eyed peas, seasoned rice, generous chunks of sun-dried beef, and creamy cheese. Heavy fuel that keeps you full for hours (+60% Stomach, +30% Sanity)!'
      },
      queijo_coalho: {
        label: 'Toasted coalho cheese skewer drizzled with sugarcane molasses',
        outcome: 'Golden grilled cheese with a crispy crust and the sweet glaze of craft molasses (+30% Stomach, +18% Sanity).'
      },
      dose_cachaca_artesanal: {
        label: 'Shot of artisanal copper-still cachaça infused with jatobá bark',
        outcome: 'Went down fiery and warmed the spirit. Footsteps became lighter and your hustle sharper (+15 Ginga, +10% Sanity, -5% Stomach)!'
      }
    }
  },

  LOTERICA_PIRITUBA: {
    title: '🍀 PIRITUBA LOTTERY & BANK AGENCY',
    intro: (state) => `
      Bulletproof cashier windows with official banners, giant Mega-Sena jackpot posters, and buzzing thermal printers.<br>
      The teller speaks over the intercom:<br>
      <em>"— Next! Lottery ticket or bill payments at Caixa Aqui?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Ginga: ${state.ginga} | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      aposta_mega_sena: {
        label: 'Place a Mega-Sena jackpot bet (Standard 6-number ticket)',
        outcome: (state, ptResult) => ptResult.includes('INACREDITÁVEL')
          ? '🎉 UNBELIEVABLE! YOUR NUMBERS HIT A WINNING TIER! You collected R$ 500.00 right at the counter (+R$ 500.00, +50% Sanity, +35 Ginga)!'
          : ptResult.includes('surpresa')
            ? '🍀 Your ticket yielded a surprise R$ 50.00 payout! The teller handed you cash (+R$ 50.00, +22% Sanity, +15 Ginga)!'
            : 'Green ticket tucked into your pocket. The dream of hitting the jackpot fuels the spirit of the São Paulo worker (+10% Sanity).'
      },
      pagar_conta_luz: {
        label: (state) => state.flags.boletoPago
          ? 'Pay Enel electric bill (Daily bill already paid)'
          : (!state.hasItem('boleto_enel')
            ? 'Pay Enel electric bill at the counter (No bill in wallet)'
            : 'Pay Enel electric bill at the counter (Daily Objective)'),
        costLabel: 'R$ 124.50',
        outcome: 'Bill officially stamped and paid at the counter! Good credit preserved and lights stay on (+35% Sanity)!'
      },
      raspadinha_dinheiro: {
        label: 'Buy a Caixa instant scratch-off lottery ticket',
        outcome: (state, ptResult) => ptResult.includes('Ganhou R$')
          ? 'Scratched the foil and found three golden clovers! Won R$ 10.00 on the spot (+R$ 7.00 net, +15% Sanity, +10 Ginga)!'
          : 'Just missed: two matching numbers and one dud. Better luck next time (-R$ 3.00, -3% Sanity).'
      }
    }
  },

  PASTELARIA_BETO: {
    title: '🥟 BETO\'S PASTELARIA',
    intro: (state) => `
      The sizzling sizzle of hot oil vats and the sweet vapor of fresh sugarcane passing through the electric press.<br>
      Seu Beto lifts a golden, blistered pastel with a slotted skimmer:<br>
      <em>"— Fresh out of the oil, crispy and piping hot! Meat with egg, or special cheese?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      pastel_especial_30cm: {
        label: 'Giant 30cm Special Pastel (Ground beef, cheese, egg, olive) + 500ml Sugarcane Juice',
        outcome: 'Puffed crispy crust, molten cheese pull, and fresh cold sugarcane juice with lime. Stomach completely full (+55% Stomach, +25% Sanity)!'
      },
      pastel_palmito: {
        label: 'Vegetarian creamy hearts of palm pastel',
        outcome: 'Generous creamy filling in a flaky golden crust. A São Paulo street food classic (+35% Stomach, +16% Sanity).'
      },
      vinagrete_extra: {
        label: (state) => state.flags.vinagreteBeto
          ? 'Top with vinaigrette & chili sauce (Already seasoned today)'
          : 'Top your pastel with homemade tomato vinaigrette and house malagueta hot sauce',
        costLabel: 'Free (1x per day)',
        outcome: 'A generous spoonful of tangy vinaigrette with house chili. The master touch on your snack (+6% Sanity, +4 Ginga).'
      }
    }
  },

  BAR_DO_PEIXE: {
    title: '🐟 CANTINHO DO PEIXE SEAFOOD PUB',
    intro: (state) => `
      Outdoor tables under blue parasols serve platters of sizzling fried fish with lime wedges.<br>
      The waiter balancing a tray on his shoulder grins from the sidewalk:<br>
      <em>"— Hey boss! Crispy tilapia tenders with tartar sauce or fried whitebait with sub-zero beer?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      isca_tilapia: {
        label: 'Platter of crispy fried tilapia tenders with tartar sauce and lime',
        outcome: 'Fresh fish, light crunchy batter, fresh lime juice, and creamy tartar sauce. A respectable feast (+50% Stomach, +28% Sanity)!'
      },
      lambari_cerveja: {
        label: 'Fried crispy whitebait fish + 600ml ice-cold bottled beer in cooler',
        outcome: 'Classic São Paulo pub finger food paired with beer frosted with ice (+40% Stomach, +24% Sanity).'
      },
      pedir_caldo_peixe: {
        label: 'Cup of steaming hot seasoned fish broth with scallions',
        outcome: 'Steaming broth with scallions and mild pepper that warms your core and restores vitality (+22% Stomach, +16% Sanity).'
      }
    }
  },

  ESCOLA_PUBLICA: {
    title: '🏫 PROF. LOURENÇO FILHO PUBLIC SCHOOL',
    intro: (state) => `
      Tia Cida, the veteran hallway monitor in her blue smock with a ring of keys on her hip, spots you at the gate:<br>
      <em>"— Look who showed up! You studied here, didn't you? Or did you come to ditch class in the square again?"</em><br>
      The unforgettable scent of public school lunch drifts onto the sidewalk, and the thud of a futsal ball echoes from the court.<br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      pedir_merenda: {
        label: (state) => state.flags.merendaHoje
          ? 'Ask for school lunch (Already ate school lunch today)'
          : 'Ask for a plate of public school lunch (warm cinnamon rice pudding & manioc biscuits)',
        costLabel: 'Free (School Lunch)',
        outcome: 'Tia Cida lovingly serves you a deep plastic bowl of piping hot cinnamon rice pudding. Sweet childhood memories of Pirituba (+35% Stomach, +20% Sanity)!'
      },
      pelada_quadra: {
        label: 'Step onto the cement court and join the neighborhood kids in a futsal scrimmage',
        costLabel: '+10 Ginga (Energy Expense)',
        outcome: 'You bolted across the rough cement court, nutmegged two kids, and drilled a screamer right into the top corner! The entire playground cheered (+10 Ginga, +16% Sanity, -10% Stomach).'
      },
      lembranca_boletim: {
        label: 'Chat with Tia Cida and reminisce about old report card scares',
        costLabel: '+12% Sanity (Nostalgia)',
        outcome: 'Tia Cida laughs remembering when you hid your report card in the ceiling tiles from your mom: "— You were a handful, but you had a good heart!" (+12% Sanity, +4 Ginga).'
      }
    }
  },

  PARQUE_PETRONIO: {
    title: '🌳 PETRÔNIO PORTELA LINEAR PARK & SQUARE',
    intro: (state) => `
      Golden trumpet trees shed bright yellow blossoms across the stone sidewalk. A gentle breeze sways the palm leaves as retirees exercise on outdoor gym machines.<br>
      Seu Zico grins beside his striped popcorn cart:<br>
      <em>"— Hot and fresh with crispy bacon bits and grated parmesan, boss! Want a loaded bag?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      pipoca_bacon: {
        label: 'Buy a large bag of fresh popcorn topped with crispy bacon cubes and grated cheese',
        outcome: 'Crunchy, freshly popped corn loaded with golden bacon bits and salty parmesan. The timeless aroma of São Paulo public squares (+30% Stomach, +22% Sanity)!'
      },
      academia_ar_livre: {
        label: 'Do a full workout set on the municipal outdoor gym walkers and pull-up bars',
        costLabel: '+20% Sanity (Free Workout)',
        outcome: 'You spend 15 minutes on the yellow walker and stretch your back on the bar. Blood flows freely and mental fatigue evaporates (+20% Sanity, +8 Ginga, -8% Stomach).'
      },
      descanso_ipe: {
        label: 'Rest on a wooden bench beneath the shade of the blooming golden trumpet tree',
        costLabel: '+15% Sanity (Peace of Mind)',
        outcome: 'You sit on the park bench listening to thrushes sing amidst yellow blossoms. A rare moment of quiet serenity amidst São Paulo\'s hustle (+15% Sanity).'
      }
    }
  },

  ESPETINHO_PETRONIO: {
    title: '🍢 PETRÔNIO STREET BBQ & CORNER PUB',
    intro: (state) => `
      The fragrant smoke of glowing charcoal and sizzling skewered meats draws neighbors to yellow sidewalk tables.<br>
      Seu Toninho, wielding long barbecue tongs with a kitchen towel slung over his shoulder, turns the skewers with mastery:<br>
      <em>"— Fresh garlic steak, squeaky cheese with molasses, and bacon-wrapped chicken! Ice-cold draft beer flowing from the tap!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      combo_espetinho: {
        label: 'Combo of 2 artisan skewers with seasoned manioc flour, tomato vinaigrette, and garlic bread',
        outcome: 'Tender, juicy flame-kissed steak skewers, crunchy farofa, and zesty fresh vinaigrette. A complete street food banquet (+50% Stomach, +25% Sanity)!'
      },
      chopp_artesanal: {
        label: 'Frosty mug of draft beer with thick foam served at a sidewalk Skol table',
        outcome: 'Crisp and refreshing brew going down smooth while the evening breeze rolls down Av. Petrônio Portela (+26% Sanity, +6 Ginga).'
      },
      queijo_coalho: {
        label: 'Golden grilled coalho cheese skewer sprinkled with oregano and cane syrup',
        outcome: 'Toasted crispy exterior with a warm, stretchy sweet-and-savory bite. A beloved Brazilian classic (+26% Stomach, +18% Sanity).'
      }
    }
  },

  PAPELARIA_BAZAR: {
    title: '📚 PETRÔNIO STATIONERY, BAZAAR & DRIVING SCHOOL',
    intro: (state) => `
      Bright spiral notebooks, school backpacks, and poster boards fill the shop windows of Papelaria Pirituba.<br>
      Next door, the backlit sign of Autoescola Petrônio highlights a white driving-school hatchback parked out front.<br>
      The clerk behind the glass counter greets you with a warm smile:<br>
      <em>"— Good afternoon! Need photocopies, school supplies, or to top up your SPTrans transit card?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      recarga_bilhete: {
        label: (state) => state.flags.bilheteRecarregado
          ? 'Recharge transit card (Already topped up today)'
          : 'Top up R$ 20.00 on your SPTrans Bilhete Único bus pass',
        outcome: 'Card tapped against the terminal, loud confirmation chime, and balance loaded to ride any city bus without hassle (+15% Sanity, Transit Card Loaded)!'
      },
      comprar_material: {
        label: 'Buy a classic blue Bic ballpoint pen, pocket notepad, and cinnamon hard candies',
        outcome: 'A shiny new pen to sign documents and a notepad in your pocket. Gives you that sharp feeling of professional organization (+12% Sanity, +4 Ginga).'
      },
      tirar_xerox: {
        label: 'Make photocopies of identity documents and proof of residency at the counter',
        outcome: 'The green scanner light runs across the glass bed and warm printed sheets slide into the tray. Everyday bureaucracy handled smoothly (+8% Sanity).'
      }
    }
  },

  IGREJA_DO_MORRO: {
    title: '⛪ HILLSIDE CHAPEL // FATHER BENTO',
    intro: (state) => `
      A gentle breeze sweeps over the hilltop while the antique bronze bell chimes in the tower.<br>
      The panoramic overlook reveals the entire expanse of Av. Petrônio Portela and the rolling hills of Pirituba.<br>
      Father Bento, wearing a black cassock with a warm, welcoming gaze, greets you with an outstretched hand:<br>
      <em>"— The peace of Christ, my child! Welcome to our chapel. What brings you up the hill today?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      acender_vela_bencao: {
        label: 'Light a votive candle at the altar and receive Father Bento\'s solemn blessing',
        outcome: 'The priest traces the sign of the cross on your forehead, speaking words of peace and reassurance. The candle flame flickers gently on the stone altar (+28% Sanity, -15% Danger).'
      },
      admirar_mirante: {
        label: 'Take in the horizon from the chapel viewpoint and breathe the fresh hilltop air',
        costLabel: '+20% Sanity (Free)',
        outcome: 'Leaning against the colonial wrought-iron railing, you watch the traffic below and flowering trees swaying in the wind. Deep, restorative serenity (+20% Sanity, +4 Ginga).'
      },
      doacao_paroquia: {
        label: 'Make a R$ 10.00 charitable donation to the parish food drive and community kitchen',
        outcome: 'You drop the bill into the wooden offering box. Father Bento expresses heartfelt thanks: "— May God multiply your kindness tenfold!" Your spirit is lifted (+35% Sanity, +10 Ginga).'
      }
    }
  },

  COLEGIO_WELLINGTON: {
    title: '🏫 WELLINGTON COLLEGE // PROF. MAURÍCIO',
    intro: (state) => `
      The school bell rings across the modern courtyard as the energetic chatter of students fills the entryway.<br>
      On the sports court, the rhythmic bounce of basketballs and cheerful cheers announce recess.<br>
      Professor Maurício, wearing a teacher ID badge and textbooks tucked under his arm, welcomes you at the gate:<br>
      <em>"— Good morning! Are you here to check on enrollments, college exam tips, or shoot some hoops?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      conversa_professor: {
        label: 'Chat with Professor Maurício about current events and college essay techniques',
        costLabel: '+18% Sanity (Ideas & Culture)',
        outcome: 'The professor shares sharp insights on Brazilian literature, critical thinking, and history. True knowledge that broadens horizons (+18% Sanity, +8 Ginga).'
      },
      bater_bola_quadra: {
        label: 'Step onto the sports court for a quick pickup futsal match with the students',
        costLabel: '+22% Sanity / -10% Stomach',
        outcome: 'Quick stepovers on the blue painted concrete court, a crisp one-two pass, and a top-corner strike! Working up a sweat clears your mind (+22% Sanity, +12 Ginga, -10% Stomach).'
      },
      salgado_cantina: {
        label: 'Buy a flaky baked beef pastry (esfiha) and chilled Concord grape juice at the snack bar',
        outcome: 'Warm pastry with golden flaky crust filled with spiced minced meat, washed down with sweet chilled grape juice. Pure school recess nostalgia (+32% Stomach, +16% Sanity).'
      }
    }
  },

  MERCADO_PYRITUBA: {
    title: '🛒 PYRITUBA MUNICIPAL MARKET // SEU BETO',
    intro: (state) => `
      The covered market hall is alive with colorful fruit displays, Canastra farm cheeses, and northeastern spices.<br>
      Down the central aisle, the sizzle of hot oil announces golden fried pastéis served with fresh sugarcane juice.<br>
      Seu Beto, sporting a striped merchant apron and flat cap, arranges ripe bananas and calls out cheerfully:<br>
      <em>"— Fresh fruit straight from the farm! Crispy hot pastéis and the finest coalho cheese in town!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      pastel_caldo_mercado: {
        label: 'Order a crispy jerked beef & coalho cheese pastel with fresh ice-cold sugarcane juice with lime',
        outcome: 'Crispy blistered golden crust, brimming with savory shredded beef and melted cheese, paired with refreshing sugarcane juice that washes away fatigue (+48% Stomach, +24% Sanity)!'
      },
      cesta_frutas: {
        label: 'Buy an assorted basket of fresh seasonal fruit (apple bananas, sweet oranges, and ripe papaya)',
        outcome: 'Sweet, fragrant, vitamin-packed farm fruits. Top-tier natural nourishment to power through the city bustle (+35% Stomach, +20% Sanity).'
      },
      queijo_manteiga: {
        label: 'Buy a whole wheel of artisanal cured Minas cheese and a bottle of pure clarified butter',
        outcome: 'Time-honored delicacies wrapped in brown butcher paper. Authentic Brazilian culinary heritage that enriches your pantry and palate (+28% Sanity, +20% Stomach, +10 Ginga).'
      }
    }
  },

  RESTAURANTE_AMIGOS_DO_PICUI: {
    title: '🥩 AMIGOS DO PICUÍ RESTAURANT // CHEF SEVERINO',
    intro: (state) => `
      The intoxicating aroma of sun-cured beef sizzling in clarified butter and garlic wafts through the veranda.<br>
      Heavy hardwood tables draped in red checkered cloths host families enjoying steaming earthenware platters.<br>
      Chef Mestre Severino, dressed in a crisp white jacket and red neckerchief, steps out with a smoking skillet:<br>
      <em>"— Welcome home! Right here is authentic flavor from Picuí, Paraíba! Tender cured beef, roasted cassava, and creamy baião de dois!"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      chapa_carne_sol: {
        label: 'Order the Famous Picuí Carne de Sol Sizzler with baião de dois, golden yucca, grilled cheese, and paçoca',
        outcome: 'A monumental feast worthy of northeastern legends! The cured beef melts in your mouth with golden butter and creamy rice and beans. Gastronomic bliss (+70% Stomach, +40% Sanity, -20% Danger)!'
      },
      cachaca_torresmo: {
        label: 'Sip a shot of artisanal amburana-aged cachaça served with crispy pork cracklings and lime',
        outcome: 'Smooth, woody amber rum warming your chest, paired with crunchy cracklings that snap with every bite (+26% Sanity, +16 Ginga, +15% Stomach).'
      },
      porcao_macaxeira: {
        label: 'Order a side of tender boiled yucca pan-fried in clarified butter with toasted cheese',
        outcome: 'Pillowy soft on the inside with a crunchy golden crust and browned melted cheese. Irresistible comfort food (+38% Stomach, +22% Sanity).'
      }
    }
  },

  FARMACIA_PETRONIO: {
    title: '💊 PETRÔNIO PHARMACY & DRUGSTORE // DR. CAMILA',
    intro: (state) => `
      The clean, bright, air-conditioned interior offers instant relief from the avenue\'s humidity.<br>
      Aisles are neatly stocked with medicines, personal care essentials, first-aid kits, and vitamins.<br>
      The pharmacist Dr. Camila, in an immaculate white lab coat with professional credentials, greets you with care:<br>
      <em>"— Hello! How may I assist you today? Looking for medications, first aid, or would you like your blood pressure checked?"</em><br>
      <small style="color:#ffcc00">Balance: ${state.formattedGrana} | Stomach: ${state.fome}% | Sanity: ${state.sanidade}%</small>
    `,
    options: {
      kit_antiacido_remedios: {
        label: 'Buy an effervescent antacid packet and a blister pack of tension headache painkillers',
        outcome: 'The fizzing antacid quickly neutralizes street heartburn, while the painkiller soothes headache tension. Your mind feels clear and revitalized (+30% Sanity, -10% Danger).'
      },
      aferir_pressao: {
        label: 'Have your blood pressure and heart rate checked in the consultation room by Dr. Camila',
        outcome: 'The cuff gently inflates as the gauge ticks: "— 120 over 80, the heart of an athlete!", smiles the pharmacist. Peace of mind knowing you are in good health (+18% Sanity, +4 Ginga).'
      },
      barra_cereal_isotonico: {
        label: 'Buy a chilled citrus electrolyte sports drink and a whole-grain nut snack bar',
        outcome: 'Rapid hydration packed with minerals and steady stamina from wholesome nuts to keep walking through São Paulo (+24% Stomach, +18% Sanity).'
      }
    }
  },

  HOUSE_ENTRY_MID_CLASS: {
    title: '🏡 ENTERING TIO WILSON\'S HOUSE',
    intro: (state) => `
      The wooden door swings open onto polished parquet floor in Tio Wilson's living room.<br>
      The CRT TV blares João Kléber's Fidelity Test, the coffee table has overdue Enel bills, and the kitchen fridge hums softly.<br>
      <em>What is your intent in this household?</em><br>
      <small style="color:#ffcc00">Thefts on record: ${state.theftCount || 0} | Heat / Danger: ${state.perigo}%</small>
    `,
    options: {
      modo_furto: {
        label: '🥷 THIEF MODE: Sneak in and pocket whatever valuables you can find!',
        outcome: '🚨 <strong>THIEF MODE ACTIVATED:</strong> Your eyes scan the household for valuable loot. Watch out: watchful neighbors might call 190!'
      },
      modo_respeito: {
        label: '🤝 VISITOR MODE: Enter peacefully and respect the family home',
        outcome: '🤝 <strong>PEACEFUL VISIT:</strong> You entered with a clean conscience. Peace of mind and respect earned (+12% Sanity, +6 Ginga).'
      },
      modo_vasculhar: {
        label: '🔍 LOOK AROUND: Quietly explore the rooms without touching anything',
        outcome: '🔍 <strong>CASUAL EXPLORATION:</strong> You stroll through the house, examining the furnishings with curiosity.'
      }
    }
  },

  HOUSE_ENTRY_FAVELA: {
    title: '🏠 ENTERING COMMUNITY RESIDENCE',
    intro: (state) => `
      The wooden door creaks open to reveal a humble exposed brick hillside home.<br>
      The comforting aroma of homemade beans and cloth-drip coffee fills the air. A blue Ultragaz tank, clay water filter, and bed savings are visible.<br>
      <em>What is your intent in this home?</em><br>
      <small style="color:#ffcc00">Thefts on record: ${state.theftCount || 0} | Heat / Danger: ${state.perigo}%</small>
    `,
    options: {
      modo_furto: {
        label: '🥷 THIEF MODE: Steal the gas cylinder, mattress savings, or household goods',
        outcome: '🚨 <strong>THIEF MODE ACTIVATED:</strong> You focus on the family\'s belongings. Police cruisers might seal the alleyway if anyone sounds the alarm!'
      },
      modo_respeito: {
        label: '🤝 RESPECT MODE: Honor the hardworking family and enter with discipline',
        outcome: '🤝 <strong>FAVELA DISCIPLINE:</strong> "In the community, respect is the supreme law!" Your humility earns neighborhood respect (+14% Sanity, +8 Ginga).'
      },
      modo_vasculhar: {
        label: '🔍 LOOK AROUND: Look around discreetly without taking anything',
        outcome: '🔍 <strong>DISCREET LOOK:</strong> You walk through the house, admiring the warmth of popular Brazilian architecture.'
      }
    }
  },

  HOUSE_ENTRY_PENTHOUSE: {
    title: '🏙️ JARAGUÁ TOWER LUXURY PENTHOUSE',
    intro: (state) => `
      The brushed steel elevator opens into a high-end duplex with Italian leather, marble counters, and a panoramic view of Pico do Jaraguá.<br>
      High-tech electronics, titanium iPhone 16, Stanley tumbler, Black card, and chrome espresso machine decorate the space.<br>
      <em>What is your intent in this multimillionaire penthouse?</em><br>
      <small style="color:#ffcc00">Thefts on record: ${state.theftCount || 0} | Heat / Danger: ${state.perigo}%</small>
    `,
    options: {
      modo_furto: {
        label: '🥷 THIEF MODE: Loot designer luxury goods, electronics, and cards!',
        outcome: '🚨 <strong>HIGH-END BURGLARY MODE:</strong> Maximum alert! If private security or police are alerted, sirens will arrive fast!'
      },
      modo_respeito: {
        label: '🤝 VISITOR MODE: Just admire the stunning view and luxury decor',
        outcome: '🥂 <strong>CIVILIZED VISIT:</strong> You relax taking in the panoramic mountain view without breaking the law (+18% Sanity, +5 Ginga).'
      },
      modo_vasculhar: {
        label: '🔍 LOOK AROUND: Inspect the modern design with caution',
        outcome: '🔍 <strong>CAREFUL INSPECTION:</strong> You walk through the penthouse admiring the designer Italian furniture.'
      }
    }
  },

  POLICE_INTERCEPTION_BURGLARY: {
    title: '🚔 MILITARY POLICE INTERCEPTION // BURGLARY SUSPECT',
    intro: (state) => `
      A Military Police cruiser (87th Battalion Pirituba) screeches to a halt right in front of you with flashing strobes and wailing sirens!<br>
      Two tactical patrol officers step out holding clipboards and clipboard reports:<br>
      <em>"— STOP RIGHT THERE! HANDS ON YOUR HEAD! Dispatch received neighbor calls reporting home burglaries in the sector. You match the exact description!"</em><br>
      <small style="color:#ff3333;font-weight:bold">🚨 Heat Level: ${state.perigo}% | Thefts: ${state.theftCount || 0} items | Loot: ${state.stolenItems && state.stolenItems.length > 0 ? state.stolenItems.map(i => i.name).join(', ') : 'None'}</small>
    `,
    options: {
      entregar_bens: {
        label: '🤝 Surrender all stolen loot, pay legal processing fee, and cooperate',
        outcome: '🚔 <strong>LOOT CONFISCATED:</strong> You cooperated, returned the stolen items, and paid administrative fees. The patrol let you go under strict warning (-35% Danger, theft heat cleared).'
      },
      dar_migue: {
        label: '🗣️ Try smooth-talking your way out (Claim you bought it at the Sunday flea market)',
        outcome: (state, ptResult) => ptResult.includes('ESPETACULAR')
          ? '🗣️ <strong>SMOOTH TALK VICTORY:</strong> With pure Brazilian street hustle, you spun an elaborate tale about distant cousins and market receipts. The sergeant warned you to move along (+20 Ginga, +10 Sanity)!'
          : '🚨 <strong>COP DIDN\'T BUY IT:</strong> "— Who do you think you\'re kidding?!" The sergeant seized your suspicious goods and logged your name in the precinct database (+40% Danger)!'
      },
      meter_o_pe: {
        label: '🏃 RUN FOR IT! High-speed sprint through the narrow favela alleyways!',
        outcome: (state, ptResult) => ptResult.includes('CINEMATOGRÁFICA')
          ? '🏃 <strong>CINEMATIC ESCAPE:</strong> You sprinted through narrow alleys, vaulted a brick wall, and vanished into Pirituba\'s labyrinth (+25 Ginga, -12% Stomach, +12% Sanity)!'
          : '🚨 <strong>CORNERED:</strong> You tripped over a storm drain and the police car pinned you against the wall! Arrested on the spot for residential burglary!'
      }
    }
  }
};


