// The curricula and their stages (Programmes): plain data, apart from the laboratory (docs/REBUILD_PLAN.md stage 1),
// so that the shell can know the live curricula without loading every experiment. content.js re-exports it.
import { university } from './catalogue-data.js';
import { universityPathway } from './university-model.js';

export const pathways = [
  {
    id:"mg", label:"MG", name:["Programme malagasy","Malagasy curriculum"],
    intro:["Repères tirés des répartitions ministérielles 2024–2025 pour T10 et les séries S, OSE, L. Leur validité pour 2026–2027 reste à confirmer avec ton enseignant. Les anciens documents A/C/D ne sont pas interchangeables.", "Guides based on ministry distributions for 2024–2025: T10 and streams S, OSE, L. Their applicability to 2026–2027 still needs confirmation with your teacher. Older A/C/D documents are not interchangeable."],
    stages:[
      {name:["T10 · Algèbre et vecteurs","T10 · Algebra and vectors"],ids:["quadratic","vectors"],note:["Le laboratoire des vecteurs travaille le déterminant et la colinéarité.","The vectors lab works on the determinant and collinearity."]},
      {name:["T11 S · Analyse et géométrie","T11 S · Calculus and geometry"],ids:["quadratic","trig","sequences","derivative","vectors"]},
      {name:["T11 OSE & L · Algèbre et analyse","T11 OSE & L · Algebra and calculus"],ids:["quadratic","sequences","derivative"]},
      {name:["T11 OSE · Statistiques","T11 OSE · Statistics"],ids:["statistics"]},
      {name:["T12 S · Approfondir","T12 S · Extend"],ids:["probability","integral","complex"],note:["Explorations partielles, pas une couverture complète. T12 OSE/L : correspondances encore à vérifier.","Partial explorations, not full coverage. T12 OSE/L mappings still need review."]}
    ],
    source:"https://www.education.gov.mg/repartition-annuelle-du-programme-detudes/",
    sourceName:["MEN · Répartitions T10, T11/T12 S, OSE, L (2024–2025)","Ministry · T10, T11/T12 S, OSE, L distributions (2024–2025)"]
  },
  {
    id:"fr",label:"FR",name:["Programme français","French curriculum"],
    intro:["Voie générale : seconde et première, programmes 2026–2027 ; terminale spécialité, programme 2019 encore applicable en 2026–2027. Le nouveau programme de terminale s’applique en 2027–2028. Les voies technologiques et les maths complémentaires ne sont pas cartographiées ici.","General pathway: seconde and première use the 2026–2027 programmes; terminale specialty still uses the 2019 programme in 2026–2027. Its new programme starts in 2027–2028. Technological pathways and maths complémentaires are not mapped here."],
    stages:[
      {name:["Seconde · Explorer","Seconde · Explore"],ids:["statistics","vectors","quadratic"],note:["Vecteurs : coordonnées, déterminant et colinéarité dans le laboratoire. Le discriminant général : prolongement, pas un attendu de seconde.","Vectors: coordinates, determinant and collinearity in the lab. The general discriminant is an extension, not a seconde requirement."]},
      {name:["Première · Spécialité","Première · Specialty"],ids:["quadratic","trig","sequences","derivative","vectors","probability"],note:["Probabilités (BO n° 14 du 2 avril 2026) : indépendance, probabilités totales, arbre de n ⩽ 4 épreuves de Bernoulli, espérance et variance. Le labo de probabilités s’utilise avec n ⩽ 4 et un arbre ; la loi binomiale B(n, p) relève de la terminale.","Probability (BO no. 14, 2 April 2026): independence, total probability, trees for n ⩽ 4 Bernoulli trials, expectation and variance. Use the probability lab with n ⩽ 4 and a tree; the binomial distribution B(n, p) belongs to terminale."]},
      {name:["Terminale · Spécialité (2026-2027)","Terminale · Specialty (2026-2027)"],ids:["probability","integral","monte-carlo-pi","monte-carlo-walk","monte-carlo-integral","monte-carlo-lake"],note:["Les quatre expériences de Monte-Carlo (estimer π, une aire, une intégrale, une probabilité) prolongent les probabilités et l’intégrale ; placement indicatif, sans prétendre couvrir le programme.","The four Monte Carlo experiments (estimating π, an area, an integral, a probability) extend probability and integration; indicative placement, with no claim to cover the programme."]},
      {name:["Terminale · Option maths expertes","Terminale · Maths expertes option"],ids:["complex"]}
    ],
    source:"https://eduscol.education.gouv.fr/5817/programmes-et-ressources-en-mathematiques-voie-gt",
    sourceName:["MEN · Programmes et options du lycée","Ministry · Lycée programmes and options"]
  },
  {
    id:"int",label:"INT",icon:"globe",name:["International","International"],
    intro:["Deux référentiels pour commencer : le Baccalauréat International (IB) et le SAT. Les placements sont pédagogiques et indicatifs ; les explorations couvrent une partie seulement de chaque référentiel.","Two frameworks to start with: the International Baccalaureate (IB) and the SAT. Placements are pedagogical suggestions; the explorations cover only part of each framework."],
    programmes:[{
    id:"ib",name:["Baccalauréat International (IB)","International Baccalaureate (IB)"],
    intro:["AA = Analysis and Approaches ; AI = Applications and Interpretation. SL = niveau moyen ; HL = niveau supérieur. Les repères ci-dessous distinguent le programme actuel (première évaluation 2021) des changements pour la première évaluation 2029.","AA = Analysis and Approaches; AI = Applications and Interpretation. SL = standard level; HL = higher level. These guides distinguish the current syllabus (first assessment 2021) from changes for first assessment 2029."],
    stages:[
      {name:["AA & AI · SL/HL · Idées communes","AA & AI · SL/HL · Shared ideas"],ids:["quadratic","sequences","statistics","probability","derivative","integral"]},
      {name:["AA SL/HL & AI HL · Cercle unité","AA SL/HL & AI HL · Unit circle"],ids:["trig"],note:["AI SL : trigonométrie des triangles ; cette activité sur les radians et les angles orientés est un prolongement.","AI SL: triangle trigonometry; this activity on radians and directed angles is an extension."]},
      // [VERIFY] which IB course(s) and level(s) treat sinusoidal modelling is not established here: the stage names no course on purpose.
      {name:["Modèles sinusoïdaux","Sinusoidal models"],ids:["ferris-wheel"],note:["Placement indicatif : une situation réelle idéalisée, modélisée par un cosinus, avec un seuil et une vitesse de variation. Ce n’est pas une affirmation sur le contenu d’un cours précis.","Indicative placement: an idealised real situation modelled by a cosine, with a threshold and a rate of change. This is not a claim about the content of a particular course."]},
      {name:["AA & AI · HL · Vecteurs","AA & AI · HL · Vectors"],ids:["vectors"]},
      {name:["AA HL · Complexes","AA HL · Complex numbers"],ids:["complex"]},
      {name:["AI HL · Complexes : programme actuel seulement","AI HL · Complex numbers: current syllabus only"],ids:["complex"],note:["Retirés pour les élèves commençant en août 2027 (première évaluation en mai 2029). Ils restent une exploration facultative.","Removed for students starting in August 2027 (first assessment May 2029). They remain optional enrichment."]}
    ],
    source:"https://ibo.org/programmes/diploma-programme/curriculum/mathematics/",
    sourceName:["IB · Cours actuels et première évaluation 2029","IB · Current courses and first assessment 2029"]
  },{
    id:"sat",name:["SAT Math","SAT Math"],
    intro:["Le SAT numérique comporte une section de mathématiques de 44 questions en deux modules, répartie en quatre domaines. Les parts indiquées sont approximatives et varient d’un document à l’autre : vérifie la fiche College Board en vigueur. Dérivation et intégration ne figurent pas dans ces domaines.","The digital SAT has one maths section of 44 questions in two modules, split across four domains. The shares shown are approximate and differ between documents: check the current College Board specification. Differentiation and integration are not among these domains."],
    stages:[
      {name:["Algèbre · environ 35 %","Algebra · about 35%"],ids:[],note:["Équations et inéquations affines, fonctions affines, systèmes de deux équations. Pas encore d’exploration dédiée.","Linear equations and inequalities, linear functions, systems of two equations. No dedicated exploration yet."]},
      {name:["Mathématiques avancées · environ 35 %","Advanced math · about 35%"],ids:["quadratic","sequences"],note:["Équations et fonctions non linéaires : quadratiques, exponentielles, polynomiales. Les suites géométriques donnent le modèle discret de la croissance exponentielle.","Nonlinear equations and functions: quadratic, exponential, polynomial. Geometric sequences give the discrete model of exponential growth."]},
      {name:["Résolution de problèmes et analyse de données · environ 15 %","Problem-solving and data analysis · about 15%"],ids:["statistics","probability"],note:["Données à une et deux variables, probabilités. Probabilités conditionnelles, marge d’erreur, rapports et pourcentages : pas encore couverts.","One- and two-variable data, probability. Conditional probability, margin of error, ratios and percentages: not yet covered."]},
      {name:["Géométrie et trigonométrie · environ 15 %","Geometry and trigonometry · about 15%"],ids:["trig"],note:["Triangles rectangles et trigonométrie. Aires, volumes, angles et cercles : pas encore couverts.","Right triangles and trigonometry. Area, volume, angles and circles: not yet covered."]}
    ],
    source:"https://satsuite.collegeboard.org/sat/whats-on-the-test/math/overview",
    sourceName:["College Board · SAT, section Mathématiques (consulté le 13 octobre 2026)","College Board · SAT Math section (consulted 13 October 2026)"]
  }]
  },
  universityPathway(university)
];

// Stages of a pathway, whether it lists them directly or through programmes.
export const pathwayStages = (p) => (p.programmes ? p.programmes.flatMap((x) => x.stages) : p.stages);
