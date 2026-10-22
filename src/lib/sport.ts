import { useStored } from './store'
import { diffDays, isoWeekday, parseKey } from './dates'

export interface Exercise {
  id: string
  name: string
  dose: string
  how: string
}

export interface Session {
  title: string
  focus: string
  minutes: number
  items: Exercise[]
}

export interface SportState {
  reeducDone: number
  reeducTotal: number
  feuVert: boolean
  phase2Start?: string
}

export function useSport() {
  return useStored<SportState>('sport.state', () => ({ reeducDone: 5, reeducTotal: 10, feuVert: false }))
}

/** dateKey -> ids d'exercices faits */
export function useSportDone() {
  return useStored<Record<string, string[]>>('sport.done', () => ({}))
}

export type Phase = 1 | 2 | 3

export const PHASES: Record<Phase, { name: string; text: string }> = {
  1: {
    name: 'Douceur',
    text: 'Pendant la rééducation du périnée : respiration, marche, mobilité. Pas d’abdos classiques, pas de sauts, pas de charges lourdes.',
  },
  2: {
    name: 'Reprise progressive',
    text: 'Rééducation terminée et feu vert obtenu : on réveille les abdos profonds et on renforce tout le corps en douceur.',
  },
  3: {
    name: 'Renforcement',
    text: 'Après 4 semaines de reprise : séances un peu plus longues et plus intenses, toujours en protégeant le périnée.',
  },
}

export function currentPhase(s: SportState, d: Date): Phase {
  if (s.reeducDone < s.reeducTotal || !s.feuVert || !s.phase2Start) return 1
  return diffDays(d, parseKey(s.phase2Start)) >= 28 ? 3 : 2
}

const ex = (id: string, name: string, dose: string, how: string): Exercise => ({ id, name, dose, how })

const BREATH = ex('respiration', 'Respiration du transverse', '10 respirations',
  'Allongée sur le dos, genoux pliés. Inspire par le nez en gonflant le ventre, puis souffle longuement par la bouche en rentrant doucement le nombril et en remontant le périnée.')
const TILT = ex('bascule', 'Bascule du bassin', '10 fois',
  'Allongée, genoux pliés. En soufflant, plaque doucement le bas du dos au sol. Relâche en inspirant.')
const CATCOW = ex('chat-vache', 'Dos rond / dos creux', '10 fois',
  'À quatre pattes. Souffle en arrondissant le dos, inspire en le creusant légèrement. Mouvement lent.')
const STRETCH = ex('etirements', 'Étirements doux', '5 minutes',
  'Cuisses, dos, épaules et nuque. Tenir chaque étirement 20 à 30 secondes, sans forcer.')
const WALK20 = ex('marche', 'Marche', '20 minutes',
  'À ton rythme, avec ou sans poussette. Tu dois pouvoir parler sans être essoufflée.')
const WALK30 = ex('marche', 'Marche active', '30 minutes',
  'Un peu plus vite que d’habitude : légèrement essoufflée mais capable de parler.')
const BRIDGE_SOFT = ex('pont', 'Pont fessier doux', '2 × 8',
  'Allongée, genoux pliés. Souffle en serrant les fesses et en remontant le périnée, décolle le bassin. Redescends en inspirant.')
const SHOULDERS = ex('epaules', 'Ouverture des épaules', '10 fois',
  'Assise bien droite, roule les épaules vers l’arrière puis ouvre les bras en croix. Idéal après les tétées et le portage.')
const SIDE = ex('clam', 'Coquillage', '2 × 10 par côté',
  'Allongée sur le côté, genoux pliés. Ouvre le genou du dessus en gardant les pieds collés, en soufflant.')

const KNEE_PLANK = (s: string) => ex('planche-genoux', 'Gainage sur les genoux', s,
  'Sur les avant-bras et les genoux, corps bien aligné. Respire normalement en gardant le nombril rentré. Arrête si le ventre fait un « dôme ».')
const DEADBUG = (s: string) => ex('dead-bug', 'Dead bug', s,
  'Sur le dos, bras vers le plafond, genoux pliés à 90°. En soufflant, tends une jambe et le bras opposé, sans cambrer.')
const BIRDDOG = (s: string) => ex('bird-dog', 'Bird dog', s,
  'À quatre pattes, tends un bras et la jambe opposée, dos bien plat. Alterne lentement.')
const SQUAT = (s: string) => ex('squat', 'Squat', s,
  'Pieds largeur de hanches, descends comme pour t’asseoir, dos droit. Souffle en remontant.')
const BRIDGE = (s: string) => ex('pont', 'Pont fessier', s,
  'Allongée, genoux pliés. Souffle en montant le bassin, serre les fesses en haut, redescends lentement.')
const LUNGE = (s: string) => ex('fente', 'Fente arrière', s,
  'Recule une jambe et plie les deux genoux. Tiens-toi à une chaise au début si besoin.')
const PUSHUP = (wall: boolean, s: string) => ex('pompes', wall ? 'Pompes contre le mur' : 'Pompes sur les genoux', s,
  'Mains un peu plus larges que les épaules, corps aligné. Souffle en poussant.')
const ROW = (s: string) => ex('rowing', 'Tirage avec bouteilles', s,
  'Penchée en avant dos plat, une bouteille d’eau dans chaque main. Ramène les coudes vers l’arrière en serrant les omoplates.')
const SIDEPLANK = (s: string) => ex('gainage-lateral', 'Gainage latéral sur les genoux', s,
  'Sur un avant-bras et les genoux, bassin levé, corps aligné.')
const HYPO = ex('hypopressif', 'Respiration hypopressive', '5 fois',
  'Souffle tout l’air, bloque sans inspirer en ouvrant les côtes : le ventre se creuse tout seul. Tiens 5 à 10 secondes. À apprendre avec ta kiné si possible.')
const CARDIO = (s: string) => ex('cardio', 'Cardio doux', s,
  'Marche rapide, vélo ou vélo d’appartement. Pas de course ni de sauts tant que ta kiné ne l’a pas validé.')

const REST: Session = {
  title: 'Repos',
  focus: 'Récupération',
  minutes: 0,
  items: [ex('repos', 'Repos ou petite balade', 'Libre', 'Le repos fait partie du programme. Une balade tranquille est bienvenue.')],
}

/** Index 0 = lundi … 6 = dimanche */
const PROGRAM: Record<Phase, Session[]> = {
  1: [
    { title: 'Respiration et marche', focus: 'Abdos profonds', minutes: 25, items: [BREATH, TILT, WALK20] },
    { title: 'Mobilité', focus: 'Dos et bassin', minutes: 15, items: [TILT, CATCOW, STRETCH] },
    { title: 'Marche', focus: 'Cardio doux', minutes: 25, items: [BREATH, WALK20] },
    { title: 'Bas du corps doux', focus: 'Fessiers', minutes: 15, items: [BREATH, BRIDGE_SOFT, SIDE] },
    { title: 'Haut du corps doux', focus: 'Épaules et posture', minutes: 15, items: [SHOULDERS, CATCOW, STRETCH] },
    { title: 'Marche et étirements', focus: 'Global', minutes: 30, items: [WALK20, STRETCH] },
    REST,
  ],
  2: [
    { title: 'Abdos profonds', focus: 'Ventre', minutes: 20, items: [BREATH, HYPO, DEADBUG('2 × 8'), KNEE_PLANK('3 × 15 s')] },
    { title: 'Bas du corps', focus: 'Jambes et fessiers', minutes: 25, items: [SQUAT('3 × 10'), BRIDGE('3 × 12'), LUNGE('2 × 8 par jambe'), STRETCH] },
    { title: 'Cardio doux', focus: 'Endurance', minutes: 30, items: [CARDIO('30 minutes'), STRETCH] },
    { title: 'Haut du corps', focus: 'Bras, dos, épaules', minutes: 20, items: [PUSHUP(true, '3 × 10'), ROW('3 × 12'), SHOULDERS] },
    { title: 'Gainage', focus: 'Ventre et dos', minutes: 20, items: [BREATH, KNEE_PLANK('3 × 20 s'), SIDEPLANK('2 × 15 s par côté'), BIRDDOG('2 × 10')] },
    { title: 'Circuit global', focus: 'Tout le corps', minutes: 25, items: [SQUAT('2 × 12'), PUSHUP(true, '2 × 10'), BRIDGE('2 × 12'), BIRDDOG('2 × 10')] },
    REST,
  ],
  3: [
    { title: 'Abdos profonds', focus: 'Ventre', minutes: 25, items: [HYPO, DEADBUG('3 × 10'), KNEE_PLANK('3 × 30 s'), SIDEPLANK('3 × 20 s par côté')] },
    { title: 'Bas du corps', focus: 'Jambes et fessiers', minutes: 30, items: [SQUAT('3 × 15'), LUNGE('3 × 10 par jambe'), BRIDGE('3 × 15'), SIDE] },
    { title: 'Cardio', focus: 'Endurance', minutes: 40, items: [CARDIO('40 minutes'), STRETCH] },
    { title: 'Haut du corps', focus: 'Bras, dos, épaules', minutes: 25, items: [PUSHUP(false, '3 × 8'), ROW('3 × 15'), SHOULDERS] },
    { title: 'Gainage', focus: 'Ventre et dos', minutes: 25, items: [KNEE_PLANK('3 × 40 s'), SIDEPLANK('3 × 25 s par côté'), BIRDDOG('3 × 12'), DEADBUG('3 × 10')] },
    { title: 'Circuit global', focus: 'Tout le corps', minutes: 30, items: [SQUAT('3 × 12'), PUSHUP(false, '3 × 8'), LUNGE('3 × 8 par jambe'), BRIDGE('3 × 12'), WALK30] },
    REST,
  ],
}

export function sessionFor(phase: Phase, d: Date): Session {
  return PROGRAM[phase][isoWeekday(d) - 1]
}

export const SAFETY =
  'Ces conseils sont généraux. Arrête et parles-en à ta sage-femme ou ta kiné en cas de douleur, de fuite urinaire, de sensation de lourdeur dans le bas du ventre ou si le ventre forme un « dôme » pendant l’effort.'
