/**
 * CharacterCustomizer.js — Brazil Simulator // Sobrevivência BR
 * Full 3D Character Customization Suite:
 * Head-to-Toes modular customization with authentic Paulistano / Brazilian references:
 * - Gender & Body Types (Magrelo Chassi de Grilo, Bombado da Praça, Cerveja & Torresmo)
 * - Head Accessories (Boné de Cria virado pra trás, Aba Reta Cyclone, Chapéu de Palha, Bandana, Capacete Pro Tork)
 * - Hair Styles (Degradê na Régua, Nevou!, Black Power, Dreads, Moicano Neymar 2011, Calvície de Cria)
 * - Facial Hair (Bigodinho Fininho de Cria, Cavanhaque, Barba Feita na Gilete, Barba do Brooklin)
 * - Eyewear (Óculos Juliet Espelhado Dourado/Azul, Óculos de Grau CLT, Wayfarer)
 * - Shirts (🌟 Sem Camisa 35°C, Seleção Canarinho, Mengão, Timão, Regata Furada, Polo do Brás, Corta-Vento)
 * - Pants/Shorts (🌟 Shorts Tactel de Praia, Bermuda Jeans, Calça Jeans, Moletom, Chino)
 * - Footwear (🌟 Havaianas Brancas com tira azul, Kenner Preto, Mizuno 12 Molas, All Star, Descalço)
 * - Real-Time 3D Rotating Previewer & LocalStorage Persistence
 */

export const CHARACTER_CATALOG = {
  genders: [
    { id: 'MASC', name: 'Mano / Muleque de Quebrada' },
    { id: 'FEM', name: 'Mina de Fibra da Quebrada' },
    { id: 'NEUTRO', name: 'Cria Neutra / Não-Binário' }
  ],

  bodyTypes: [
    { id: 'PADRAO', name: 'No Padrão / Médio', scaleX: 1.0, scaleZ: 1.0, scaleY: 1.0, armScale: 1.0 },
    { id: 'MAGRELO', name: 'Chassi de Grilo', scaleX: 0.85, scaleZ: 0.86, scaleY: 1.02, armScale: 0.85 },
    { id: 'BOMBADO', name: 'Bombado da Praça / Academia', scaleX: 1.24, scaleZ: 1.15, scaleY: 1.0, armScale: 1.28 },
    { id: 'CHEINHO', name: 'Cerveja & Torresmo de Boteco', scaleX: 1.20, scaleZ: 1.30, scaleY: 0.98, armScale: 1.05 }
  ],

  skinTones: [
    { id: 'BRONZEADO', name: 'Bronzeado de Sol', color: 0xba7d56 },
    { id: 'MORENO', name: 'Moreno / Pardo Raiz', color: 0x8d5524 },
    { id: 'NEGRO', name: 'Negro Retinto', color: 0x4a2e1b },
    { id: 'CLARO', name: 'Pele Clara / Faria Limer', color: 0xe8be99 },
    { id: 'CLT_PALIDO', name: 'Palidez de Escritório CLT', color: 0xffd5b8 }
  ],

  headAccessories: [
    { id: 'BONE_TRAS', name: 'Boné Virado pra Trás (De Cria)', color: 0x0d47a1, visorColor: 0xffcc00 },
    { id: 'SEM_ACESSORIO', name: 'Sem Acessório / Cabeça Livre' },
    { id: 'BONE_RETA', name: 'Boné Aba Reta Cyclone', color: 0x111111, visorColor: 0x333333 },
    { id: 'CHAPEU_PALHA', name: 'Chapéu de Palha da Feira', color: 0xddbb66, visorColor: 0xaa8833 },
    { id: 'BANDANA', name: 'Bandana de Quebrada', color: 0xcc2222, visorColor: 0x991111 },
    { id: 'CAPACETE_MOTO', name: 'Capacete Pro Tork de Motoboy', color: 0x222222, visorColor: 0x111111 }
  ],

  hairStyles: [
    { id: 'DEGRADE', name: 'Degradê na Régua / Disfarçado' },
    { id: 'NEVOU', name: 'Nevou! (Loiro Pivete)' },
    { id: 'BLACK_POWER', name: 'Black Power / Afro' },
    { id: 'DREADS', name: 'Dreadlocks de Favela' },
    { id: 'MOICANO_NEYMAR', name: 'Moicano Neymar 2011' },
    { id: 'CALVICIE_CRIA', name: 'Entradinhas de CLT / Calvície' },
    { id: 'RASPADO', name: 'Raspado na Máquina 1' }
  ],

  hairColors: [
    { id: 'PRETO', name: 'Preto Natural', color: 0x111111 },
    { id: 'NEVOU_BRANCO', name: 'Nevou / Platinado 0°', color: 0xffffff },
    { id: 'CASTANHO', name: 'Castanho Escuro', color: 0x422615 },
    { id: 'LOIRO', name: 'Loiro Queimado', color: 0xccaa44 },
    { id: 'VERMELHO', name: 'Vermelho de Baile', color: 0xaa1122 },
    { id: 'VERDE', name: 'Verde Canarinho', color: 0x009944 }
  ],

  facialHairs: [
    { id: 'BIGODINHO', name: 'Bigodinho Fininho de Cria' },
    { id: 'SEM_BARBA', name: 'Sem Barba / Rostinho Liso' },
    { id: 'CAVANHAQUE', name: 'Cavanhaque de Pagodeiro' },
    { id: 'BARBA_FEITA', name: 'Barba Feita na Gilete' },
    { id: 'BARBA_CHEIA', name: 'Barba Cheia do Brooklin' },
    { id: 'BIGODAO', name: 'Bigodão do Seu Madruga' }
  ],

  eyewears: [
    { id: 'JULIET_DOURADA', name: 'Óculos Juliet Lente Dourada', color: 0xffaa00, frame: 0xcccccc },
    { id: 'SEM_OCULOS', name: 'Sem Óculos / Olhar Limpo' },
    { id: 'JULIET_AZUL', name: 'Óculos Juliet Lente Azul Polarizada', color: 0x00d4ff, frame: 0x222222 },
    { id: 'OCULOS_GRAU', name: 'Óculos de Grau CLT (Armação Preta)', color: 0x99ccff, frame: 0x111111 },
    { id: 'WAYFARER', name: 'Óculos Escuro Malandro', color: 0x111111, frame: 0x111111 }
  ],

  shirts: [
    { id: 'CANARINHO', name: 'Camisa 10 da Seleção Canarinho', color: 0xffdf00, trim: 0x009b3a, isBare: false },
    { id: 'SEM_CAMISA', name: '🌟 Sem Camisa (35°C no Asfalto)', isBare: true },
    { id: 'MENGAO', name: 'Manto Rubro-Negro Listrado', color: 0xaa1111, trim: 0x111111, isBare: false },
    { id: 'TIMAO', name: 'Camisa Alvinegra do Povo', color: 0xffffff, trim: 0x111111, isBare: false },
    { id: 'REGATA_PEDREIRO', name: 'Regata Furada de Pedreiro', color: 0xededed, trim: 0xdddddd, isBare: false, isSleeveless: true },
    { id: 'POLO_BRAS', name: 'Polo com Jacaré do Brás', color: 0x0a3b25, trim: 0xffffff, isBare: false },
    { id: 'CORTA_VENTO', name: 'Corta-Vento Cyclone Furta-Cor', color: 0x1e3a8a, trim: 0x06b6d4, isBare: false },
    { id: 'SOCIAL_CLT', name: 'Camisa Social Amassada de CLT', color: 0x93c5fd, trim: 0x1e3a8a, isBare: false }
  ],

  pants: [
    { id: 'TACTEL', name: '🌟 Shorts Tactel de Praia', isShorts: true, color: 0x1d3557 },
    { id: 'BERMUDA_JEANS', name: 'Bermuda Jeans Rasgada', isShorts: true, color: 0x3d5a80 },
    { id: 'JEANS_CHAVE', name: 'Calça Jeans com Chaveiro no Cós', isShorts: false, color: 0x243b55 },
    { id: 'MOLETOM_DOMINGO', name: 'Calça Moletom Cinza de Domingo', isShorts: false, color: 0x6b7280 },
    { id: 'CHINO_BEGE', name: 'Calça Chino Bege de Faria Limer', isShorts: false, color: 0xb59a6d }
  ],

  shoes: [
    { id: 'HAVAIANAS_BRANCAS', name: '🌟 Havaianas Brancas (Tira Azul)', type: 'flipflop', soleColor: 0xffffff, strapColor: 0x1565c0 },
    { id: 'KENNER_PRETO', name: 'Chinelo Kenner Preto Tratorado', type: 'flipflop', soleColor: 0x111111, strapColor: 0x333333 },
    { id: 'MIZUNO_12_MOLAS', name: 'Mizuno Wave 12 Molas', type: 'sneakers', soleColor: 0xdddddd, strapColor: 0x00eeff },
    { id: 'ALL_STAR', name: 'All Star Surrado de Lona', type: 'sneakers', soleColor: 0xffffff, strapColor: 0x111111 },
    { id: 'BOTA_OBRA', name: 'Bota Vulcabras de Bico de Aço', type: 'boots', soleColor: 0x111111, strapColor: 0x5a3825 },
    { id: 'DESCALCO', name: 'Descalço (Pé no Asfalto Quente)', type: 'barefoot' }
  ]
};

export class CharacterCustomizer {
  constructor() {
    this.currentConfig = this.loadPreset() || this.getRandomConfig();
  }

  getDefaultConfig() {
    return {
      gender: 'MASC',
      bodyType: 'PADRAO',
      skinTone: 'BRONZEADO',
      headAccessory: 'BONE_TRAS',
      hairStyle: 'DEGRADE',
      hairColor: 'PRETO',
      facialHair: 'BIGODINHO',
      eyewear: 'JULIET_DOURADA',
      shirt: 'CANARINHO',
      pants: 'TACTEL',
      shoes: 'HAVAIANAS_BRANCAS'
    };
  }

  getRandomConfig() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)].id;
    return {
      gender: pick(CHARACTER_CATALOG.genders),
      bodyType: pick(CHARACTER_CATALOG.bodyTypes),
      skinTone: pick(CHARACTER_CATALOG.skinTones),
      headAccessory: pick(CHARACTER_CATALOG.headAccessories),
      hairStyle: pick(CHARACTER_CATALOG.hairStyles),
      hairColor: pick(CHARACTER_CATALOG.hairColors),
      facialHair: pick(CHARACTER_CATALOG.facialHairs),
      eyewear: pick(CHARACTER_CATALOG.eyewears),
      shirt: pick(CHARACTER_CATALOG.shirts),
      pants: pick(CHARACTER_CATALOG.pants),
      shoes: pick(CHARACTER_CATALOG.shoes)
    };
  }

  savePreset(config = this.currentConfig) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('brazil_sim_char_preset', JSON.stringify(config));
      } catch (e) {
        console.warn('Unable to save character preset to localStorage', e);
      }
    }
  }

  loadPreset() {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('brazil_sim_char_preset');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {
        console.warn('Unable to parse character preset from localStorage', e);
      }
    }
    return null;
  }

  // Get item definition from catalog by category and ID
  getItem(category, id) {
    const list = CHARACTER_CATALOG[category];
    if (!list) return null;
    return list.find(item => item.id === id) || list[0];
  }

  // Cycle property forward or backward in catalog
  cycleProperty(category, currentId, direction = 1) {
    const list = CHARACTER_CATALOG[category];
    if (!list || list.length === 0) return currentId;
    let idx = list.findIndex(item => item.id === currentId);
    if (idx === -1) idx = 0;
    idx = (idx + direction + list.length) % list.length;
    return list[idx].id;
  }

  /**
   * Build complete modular 3D avatar rig matching config
   * Compatible with 3rd-person camera rig and animations in Controls.js
   */
  buildAvatarRig(cfg = this.currentConfig) {
    if (typeof THREE === 'undefined') return null;

    const avatar = new THREE.Group();
    avatar.name = 'player_avatar';

    const skinObj = this.getItem('skinTones', cfg.skinTone) || CHARACTER_CATALOG.skinTones[0];
    const bodyObj = this.getItem('bodyTypes', cfg.bodyType) || CHARACTER_CATALOG.bodyTypes[0];
    const shirtObj = this.getItem('shirts', cfg.shirt) || CHARACTER_CATALOG.shirts[0];
    const pantsObj = this.getItem('pants', cfg.pants) || CHARACTER_CATALOG.pants[0];
    const shoeObj = this.getItem('shoes', cfg.shoes) || CHARACTER_CATALOG.shoes[0];
    const hairObj = this.getItem('hairStyles', cfg.hairStyle) || CHARACTER_CATALOG.hairStyles[0];
    const hairColObj = this.getItem('hairColors', cfg.hairColor) || CHARACTER_CATALOG.hairColors[0];
    const headAccObj = this.getItem('headAccessories', cfg.headAccessory) || CHARACTER_CATALOG.headAccessories[0];
    const faceHairObj = this.getItem('facialHairs', cfg.facialHair) || CHARACTER_CATALOG.facialHairs[0];
    const eyeObj = this.getItem('eyewears', cfg.eyewear) || CHARACTER_CATALOG.eyewears[0];

    // Shared Materials
    const skinMat = new THREE.MeshLambertMaterial({ color: skinObj.color, transparent: true, opacity: 1.0 });
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColObj.color, transparent: true, opacity: 1.0 });

    // Shirt Material (or bare skin if "SEM_CAMISA")
    const isBareChest = shirtObj.isBare === true;
    const isSleeveless = isBareChest || shirtObj.isSleeveless === true;
    const torsoMat = isBareChest ? skinMat : new THREE.MeshLambertMaterial({ color: shirtObj.color || 0xffdf00, transparent: true, opacity: 1.0 });
    const trimMat = new THREE.MeshLambertMaterial({ color: shirtObj.trim || 0x009b3a, transparent: true, opacity: 1.0 });

    // Pants Material
    const pantsMat = new THREE.MeshLambertMaterial({ color: pantsObj.color || 0x1d3557, transparent: true, opacity: 1.0 });

    // Shoes Materials
    const soleMat = new THREE.MeshLambertMaterial({ color: shoeObj.soleColor || 0xffffff, transparent: true, opacity: 1.0 });
    const strapMat = new THREE.MeshLambertMaterial({ color: shoeObj.strapColor || 0x1565c0, transparent: true, opacity: 1.0 });

    const avatarMaterials = [skinMat, hairMat, torsoMat, trimMat, pantsMat, soleMat, strapMat];

    // 1. Torso Group
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.05, 0);
    const torsoWidth = 0.44 * (bodyObj.armScale || 1.0);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth, 0.52, 0.24 * (bodyObj.scaleZ || 1.0)), torsoMat);
    torsoGroup.add(torso);

    if (!isBareChest) {
      // Collar band
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.25), trimMat);
      collar.position.set(0, 0.24, 0);
      torsoGroup.add(collar);

      // Chest Badge
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), trimMat);
      badge.position.set(-0.12, 0.12, 0.125 * (bodyObj.scaleZ || 1.0));
      torsoGroup.add(badge);
    } else {
      // Subtle muscular pectoral definition line on bare chest
      const pecLine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.01), new THREE.MeshLambertMaterial({ color: 0x5a341e }));
      pecLine.position.set(0, 0.08, 0.125 * (bodyObj.scaleZ || 1.0));
      torsoGroup.add(pecLine);
    }
    avatar.add(torsoGroup);

    // 2. Head & Neck Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.48, 0);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), skinMat);
    headGroup.add(head);

    // Hair Models
    if (hairObj.id === 'NEVOU' || hairObj.id === 'DEGRADE') {
      const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.25), hairMat);
      topHair.position.set(0, 0.14, 0);
      headGroup.add(topHair);
    } else if (hairObj.id === 'BLACK_POWER') {
      const afro = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.32), hairMat);
      afro.position.set(0, 0.16, 0);
      headGroup.add(afro);
    } else if (hairObj.id === 'DREADS') {
      const dreadBase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.28), hairMat);
      dreadBase.position.set(0, 0.14, 0);
      headGroup.add(dreadBase);
      // Falling dread strands
      for (let d = -1; d <= 1; d += 2) {
        const strand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.06), hairMat);
        strand.position.set(d * 0.14, 0.02, -0.08);
        headGroup.add(strand);
      }
    } else if (hairObj.id === 'MOICANO_NEYMAR') {
      const moicano = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.26), hairMat);
      moicano.position.set(0, 0.18, 0);
      headGroup.add(moicano);
    } else if (hairObj.id === 'CALVICIE_CRIA') {
      // Side hair rings only
      const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.22), hairMat);
      sideL.position.set(-0.13, 0.06, 0);
      const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.22), hairMat);
      sideR.position.set(0.13, 0.06, 0);
      headGroup.add(sideR);
      headGroup.add(sideL);
    }

    // Facial Hair
    if (faceHairObj.id === 'BIGODINHO') {
      const bigode = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.02), hairMat);
      bigode.position.set(0, -0.05, 0.125);
      headGroup.add(bigode);
    } else if (faceHairObj.id === 'CAVANHAQUE') {
      const cavan = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 0.02), hairMat);
      cavan.position.set(0, -0.09, 0.125);
      headGroup.add(cavan);
    } else if (faceHairObj.id === 'BARBA_FEITA' || faceHairObj.id === 'BARBA_CHEIA') {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.12, 0.245), hairMat);
      beard.position.set(0, -0.08, 0.01);
      headGroup.add(beard);
    } else if (faceHairObj.id === 'BIGODAO') {
      const bigodao = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.03), hairMat);
      bigodao.position.set(0, -0.05, 0.13);
      headGroup.add(bigodao);
    }

    // Eyewear
    if (eyeObj.id === 'JULIET_DOURADA' || eyeObj.id === 'JULIET_AZUL') {
      const glassMat = new THREE.MeshBasicMaterial({ color: eyeObj.color, transparent: true, opacity: 0.95 });
      const frameMat = new THREE.MeshLambertMaterial({ color: eyeObj.frame || 0xcccccc });
      avatarMaterials.push(glassMat, frameMat);

      // Curving Juliet frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.025, 0.06), frameMat);
      frame.position.set(0, 0.04, 0.125);
      headGroup.add(frame);
      // Iridescent lenses
      const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.02), glassMat);
      lensL.position.set(-0.06, 0.025, 0.135);
      const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.02), glassMat);
      lensR.position.set(0.06, 0.025, 0.135);
      headGroup.add(lensL);
      headGroup.add(lensR);
    } else if (eyeObj.id === 'OCULOS_GRAU' || eyeObj.id === 'WAYFARER') {
      const glassMat = new THREE.MeshBasicMaterial({ color: eyeObj.color, transparent: true, opacity: 0.75 });
      const frameMat = new THREE.MeshLambertMaterial({ color: eyeObj.frame || 0x111111 });
      avatarMaterials.push(glassMat, frameMat);
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.04), frameMat);
      glasses.position.set(0, 0.03, 0.13);
      headGroup.add(glasses);
    }

    // Head Accessories
    if (headAccObj.id === 'BONE_TRAS' || headAccObj.id === 'BONE_RETA') {
      const capMat = new THREE.MeshLambertMaterial({ color: headAccObj.color || 0x0d47a1 });
      const visorMat = new THREE.MeshLambertMaterial({ color: headAccObj.visorColor || 0xffcc00 });
      avatarMaterials.push(capMat, visorMat);

      const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.26), capMat);
      capCrown.position.set(0, 0.10, 0);
      headGroup.add(capCrown);

      const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.16), visorMat);
      if (headAccObj.id === 'BONE_TRAS') {
        capVisor.position.set(0, 0.08, -0.19);
        capVisor.rotation.x = -0.15;
      } else {
        capVisor.position.set(0, 0.08, 0.19);
        capVisor.rotation.x = 0.05;
      }
      headGroup.add(capVisor);
    } else if (headAccObj.id === 'CHAPEU_PALHA') {
      const strawMat = new THREE.MeshLambertMaterial({ color: headAccObj.color || 0xddbb66 });
      avatarMaterials.push(strawMat);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), strawMat);
      brim.position.set(0, 0.12, 0);
      headGroup.add(brim);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 10), strawMat);
      crown.position.set(0, 0.20, 0);
      headGroup.add(crown);
    } else if (headAccObj.id === 'BANDANA') {
      const bandMat = new THREE.MeshLambertMaterial({ color: headAccObj.color || 0xcc2222 });
      avatarMaterials.push(bandMat);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.25), bandMat);
      band.position.set(0, 0.09, 0);
      headGroup.add(band);
    } else if (headAccObj.id === 'CAPACETE_MOTO') {
      const helmetMat = new THREE.MeshLambertMaterial({ color: headAccObj.color || 0x222222 });
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.85 });
      avatarMaterials.push(helmetMat, visorMat);
      const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.30, 0.29), helmetMat);
      helmet.position.set(0, 0.06, 0);
      headGroup.add(helmet);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.05), visorMat);
      visor.position.set(0, 0.03, 0.14);
      headGroup.add(visor);
    }

    avatar.add(headGroup);

    // 3. Left Arm Group
    const armOffsetX = 0.24 * (bodyObj.armScale || 1.0) + 0.06;
    const armThickness = 0.10 * (bodyObj.armScale || 1.0);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-armOffsetX, 1.25, 0);
    if (!isSleeveless) {
      const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(armThickness + 0.02, 0.18, 0.16), torsoMat);
      leftSleeve.position.set(0, -0.09, 0);
      leftArmGroup.add(leftSleeve);
    }
    const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(armThickness, 0.44, 0.12), skinMat);
    leftForearm.position.set(0, -0.26, 0);
    leftArmGroup.add(leftForearm);
    avatar.add(leftArmGroup);

    // 4. Right Arm Group
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(armOffsetX, 1.25, 0);
    if (!isSleeveless) {
      const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(armThickness + 0.02, 0.18, 0.16), torsoMat);
      rightSleeve.position.set(0, -0.09, 0);
      rightArmGroup.add(rightSleeve);
    }
    const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(armThickness, 0.44, 0.12), skinMat);
    rightForearm.position.set(0, -0.26, 0);
    rightArmGroup.add(rightForearm);
    avatar.add(rightArmGroup);

    // 5. Left Leg Group
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.13, 0.78, 0);
    const isShorts = pantsObj.isShorts !== false;
    const pantH = isShorts ? 0.30 : 0.60;
    const pantMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, pantH, 0.20), pantsMat);
    pantMesh.position.set(0, -pantH / 2, 0);
    leftLegGroup.add(pantMesh);

    if (isShorts) {
      const leftCalf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.14), skinMat);
      leftCalf.position.set(0, -0.45, 0);
      leftLegGroup.add(leftCalf);
    }

    // Footwear
    if (shoeObj.type === 'flipflop') {
      const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.26), soleMat);
      leftSole.position.set(0, -0.66, 0.04);
      leftLegGroup.add(leftSole);
      const leftStrap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.10), strapMat);
      leftStrap.position.set(0, -0.63, 0.03);
      leftLegGroup.add(leftStrap);
    } else if (shoeObj.type === 'sneakers' || shoeObj.type === 'boots') {
      const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.26), soleMat);
      shoeMesh.position.set(0, -0.64, 0.04);
      leftLegGroup.add(shoeMesh);
    } else {
      // Barefoot
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.24), skinMat);
      foot.position.set(0, -0.66, 0.03);
      leftLegGroup.add(foot);
    }
    avatar.add(leftLegGroup);

    // 6. Right Leg Group
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.13, 0.78, 0);
    const rightPant = new THREE.Mesh(new THREE.BoxGeometry(0.18, pantH, 0.20), pantsMat);
    rightPant.position.set(0, -pantH / 2, 0);
    rightLegGroup.add(rightPant);

    if (isShorts) {
      const rightCalf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.14), skinMat);
      rightCalf.position.set(0, -0.45, 0);
      rightLegGroup.add(rightCalf);
    }

    // Right Footwear
    if (shoeObj.type === 'flipflop') {
      const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.26), soleMat);
      rightSole.position.set(0, -0.66, 0.04);
      rightLegGroup.add(rightSole);
      const rightStrap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.10), strapMat);
      rightStrap.position.set(0, -0.63, 0.03);
      rightLegGroup.add(rightStrap);
    } else if (shoeObj.type === 'sneakers' || shoeObj.type === 'boots') {
      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.26), soleMat);
      rightShoe.position.set(0, -0.64, 0.04);
      rightLegGroup.add(rightShoe);
    } else {
      const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.24), skinMat);
      rightFoot.position.set(0, -0.66, 0.03);
      rightLegGroup.add(rightFoot);
    }
    avatar.add(rightLegGroup);

    // Overall Body Scaling
    avatar.scale.set(bodyObj.scaleX || 1.0, bodyObj.scaleY || 1.0, bodyObj.scaleZ || 1.0);

    // Attach limb references for limb-swing animation in Controls.js
    avatar.avatarTorso = torsoGroup;
    avatar.avatarHead = headGroup;
    avatar.avatarLeftArm = leftArmGroup;
    avatar.avatarRightArm = rightArmGroup;
    avatar.avatarLeftLeg = leftLegGroup;
    avatar.avatarRightLeg = rightLegGroup;
    avatar.avatarMaterials = avatarMaterials;

    return avatar;
  }
}

/**
 * CharacterPreview — Live Three.js Viewport Renderer for Customizer UI
 * Displays a rotating pedestal with dynamic lighting and responsive touch/mouse orbit.
 */
export class CharacterPreview {
  constructor(canvasElement, customizer) {
    this.canvas = canvasElement;
    this.customizer = customizer;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.currentMesh = null;
    this.pedestal = null;
    this.rotY = 0;
    this.isDragging = false;
    this.lastX = 0;
    this.animId = null;

    this.init();
  }

  init() {
    if (!this.canvas || typeof THREE === 'undefined') return;

    const width = this.canvas.clientWidth || 320;
    const height = this.canvas.clientHeight || 420;

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (err) {
      this.renderer = null;
      return;
    }

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 0.95, 3.2);
    this.camera.lookAt(0, 0.90, 0);

    // Three-point portrait studio lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(amb);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 1.2);
    keyLight.position.set(2, 3, 2);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x66bbff, 0.6);
    fillLight.position.set(-2, 1, 1);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00ff88, 0.8);
    rimLight.position.set(0, 2, -2);
    this.scene.add(rimLight);

    // Concrete Street Pedestal (Calçada Paulistana)
    const pedGeo = new THREE.CylinderGeometry(0.75, 0.82, 0.10, 24);
    const pedMat = new THREE.MeshLambertMaterial({ color: 0x222624 });
    this.pedestal = new THREE.Mesh(pedGeo, pedMat);
    this.pedestal.position.set(0, -0.05, 0);
    this.scene.add(this.pedestal);

    // Circular neon ring under pedestal
    const ringGeo = new THREE.RingGeometry(0.76, 0.84, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.005, 0);
    this.pedestal.add(ring);

    this.bindEvents();
    this.updatePreview();
    this.startLoop();
  }

  updatePreview(config = this.customizer.currentConfig) {
    if (!this.scene) return;

    if (this.currentMesh) {
      this.scene.remove(this.currentMesh);
      this.currentMesh.traverse(child => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
        }
      });
      this.currentMesh = null;
    }

    const mesh = this.customizer.buildAvatarRig(config);
    if (mesh) {
      mesh.rotation.y = this.rotY;
      this.scene.add(mesh);
      this.currentMesh = mesh;
    }
  }

  bindEvents() {
    if (!this.canvas) return;

    const onStart = (clientX) => {
      this.isDragging = true;
      this.lastX = clientX;
    };

    const onMove = (clientX) => {
      if (!this.isDragging) return;
      const dx = clientX - this.lastX;
      this.lastX = clientX;
      this.rotY += dx * 0.015;
      if (this.currentMesh) this.currentMesh.rotation.y = this.rotY;
    };

    const onEnd = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', e => onStart(e.clientX));
    window.addEventListener('mousemove', e => onMove(e.clientX));
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', onEnd);

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || 320;
    const height = this.canvas.clientHeight || 420;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  startLoop() {
    const loop = () => {
      if (this.renderer && this.scene && this.camera) {
        if (!this.isDragging && this.currentMesh) {
          this.rotY += 0.006;
          this.currentMesh.rotation.y = this.rotY;
        }
        this.renderer.render(this.scene, this.camera);
      }
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer) this.renderer.dispose();
  }
}
