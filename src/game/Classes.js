/**
 * Social Classes / Character Archetypes for Brazil Simulator
 * Defines starting wealth (centavos), stats (0-100), inventory, and daily objectives.
 */

import { getLanguage, getLocalizedClass } from './i18n.js';

export const SOCIAL_CLASSES = {
  CLASSE_DE: {
    id: 'CLASSE_DE',
    title: 'Muleque de Quebrada',
    badge: 'FAVELA / PERIFERIA',
    subtitle: 'Nascido no alto do morro em Pirituba. Ginga nas alturas, grana no limite.',
    grana: 1400, // R$ 14,00 in centavos
    fome: 70,
    sanidade: 80,
    perigo: 10,
    ginga: 90,
    decay: { fomePerHour: 4.5, sanidadePerHour: 2.0 },
    spawn: { x: 1.0, y: 8.5, z: -70.0 }, // Mirante da Laje
    inventory: [
      { id: 'bu', name: 'Bilhete Único (Negativo)', desc: 'Saldo: -R$ 5,00. Precisa de recarga urgente.' },
      { id: 'chinelo', name: 'Havaianas com Prego', desc: 'Arrebentou a tira, mas foi consertada com arame.' },
      { id: 'celular_trincado', name: 'Motorola Tela Trincada', desc: 'Bateria em 12%. Dá pra mandar WhatsApp.' },
      { id: 'sacola_latinhas', name: 'Sacola com Latinhas de Alumínio', desc: 'Latinhas amassadas catadas na subida do morro. Dá pra vender na Adega do Zé.' }
    ],
    dailyObjective: 'Ganhar pelo menos R$ 40 em bicos ou conseguir cesta básica sem B.O.',
    targetWealthGain: 4000 // R$ 40,00
  },

  CLASSE_C: {
    id: 'CLASSE_C',
    title: 'Tiozão CLT do Subúrbio',
    badge: 'CLASSE MÉDIA / TRABALHADOR',
    subtitle: 'Acorda às 05:30. Carnê das Casas Bahia na gaveta e boleto de luz vencendo.',
    grana: 18000, // R$ 180,00 in centavos
    fome: 85,
    sanidade: 55,
    perigo: 20,
    ginga: 65,
    decay: { fomePerHour: 3.5, sanidadePerHour: 3.0 },
    spawn: { x: -8.0, y: 0.28, z: -12.5 }, // Casa do Tiozão CLT na Rua Emílio Lessore
    inventory: [
      { id: 'chave_carro', name: 'Chave do Celta 2004', desc: 'Está estacionado perto do posto, 2 portas na reserva.' },
      { id: 'boleto_enel', name: 'Boleto Enel (Vence Hoje!)', desc: 'R$ 124,50. Se não pagar cortam a luz amanhã.' },
      { id: 'carne', name: 'Carnê Casas Bahia (18/24)', desc: 'Smart TV parcelada. Não atrase.' }
    ],
    dailyObjective: 'Pagar a conta de luz e voltar pra casa com pão na chapa sem ter o carro riscado.',
    targetWealthGain: 0
  },

  CLASSE_AB: {
    id: 'CLASSE_AB',
    title: 'Herdeiro da Faria Lima',
    badge: 'ELITE / FARIA LIMER',
    subtitle: 'Desceu em Pirituba por engano no Waze. Paranoia a 200 km/h, carteira cheia.',
    grana: 380000, // R$ 3.800,00 in centavos
    fome: 95,
    sanidade: 35,
    perigo: 5,
    ginga: 15,
    decay: { fomePerHour: 2.0, sanidadePerHour: 5.0 }, // Sanidade despenca rápido
    spawn: { x: 37.0, y: 32.25, z: 3.5 }, // Cobertura Penthouse 180° Vista Pico do Jaraguá
    inventory: [
      { id: 'iphone', name: 'iPhone 16 Pro Max Titânio', desc: 'Cobiçado por 10 entre 10 motoboys.' },
      { id: 'stanley', name: 'Copo Stanley com Matchá', desc: 'Mantém gelado por 18 horas.' },
      { id: 'black_card', name: 'Cartão Black Sem Limite', desc: 'Inútil se o boteco só aceitar dinheiro ou Pix.' }
    ],
    dailyObjective: 'Sobreviver o dia na rua sem ter o celular levado e conseguir voltar pros Jardins são e salvo.',
    targetWealthGain: 0
  }
};

export function getActiveClassConfig(classId, lang = null) {
  const base = SOCIAL_CLASSES[classId] || SOCIAL_CLASSES.CLASSE_DE;
  const loc = typeof getLocalizedClass === 'function' ? getLocalizedClass(classId, lang || (typeof getLanguage === 'function' ? getLanguage() : 'pt')) : null;
  if (!loc) return base;
  return {
    ...base,
    title: loc.title || base.title,
    badge: loc.badge || base.badge,
    subtitle: loc.subtitle || base.subtitle,
    dailyObjective: loc.dailyObjective || base.dailyObjective,
    inventory: loc.items ? loc.items.map((it, idx) => ({ ...base.inventory[idx], ...it })) : base.inventory
  };
}
