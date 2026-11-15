// Valores adaptados para o jogo: ESTIMATIVAS / PARÂMETROS DE SIMULAÇÃO (não dados oficiais).
export const REQS = { 1: [2500, 2000, 5], 2: [3000, 2500, 6], 3: [1800, 1500, 8], 4: [2200, 1800, 5], 5: [2000, 2500, 4], 6: [1500, 1200, 1] };
export const GOALS = { imagem: "Mapear a superfície / obter imagens", composicao: "Analisar a composição do solo e rochas", clima: "Estudar o clima e a atmosfera", subsolo: "Identificar estruturas e gelo no subsolo", vida: "Procurar moléculas orgânicas" };
export const MGOALS = { 1: ["imagem", "composicao", "clima", "subsolo"], 2: ["imagem", "composicao", "subsolo", "clima"], 3: ["imagem", "clima", "composicao", "subsolo"], 4: ["imagem", "composicao", "subsolo", "vida"], 5: ["imagem", "clima", "composicao", "subsolo"], 6: ["imagem", "composicao", "clima", "subsolo"] };
export const MOBJ = { 1: ["Procurar sinais de água no passado.", "Estudar o ambiente e o solo de Marte."], 2: ["Instalar infra-estruturas científicas.", "Estudar o solo e o gelo lunar."], 3: ["Monitorizar o clima.", "Acompanhar ecossistemas e alterações ambientais."], 4: ["Determinar a composição do asteróide.", "Mapear a sua forma e superfície."], 5: ["Estudar a atmosfera de Júpiter.", "Investigar as suas luas e campo magnético."], 6: ["Sair da heliosfera.", "Medir o meio interestelar durante décadas."] };

const S = (id, name, type, maker, mass, cargo, power, data, life, cost, dest, desc, pros, cons, crew = 0) => ({ id, name, type, maker, mass, cargo, power, data, life, cost, dest, desc, pros, cons, crew, dim: type === "crew" ? "8 x 4 m" : "4 x 3 m" });
export const SHIPS = [
  S(1, "Orion", "crew", "NASA / Lockheed Martin", 8500, 4000, 3000, 12, "6 meses", 1200, [1, 2, 4], "Nave tripulada segura para missões além da órbita da Terra.", ["Alta segurança", "Grande autonomia"], ["Custo elevado", "Exige foguete pesado"], 4),
  S(2, "Starship", "crew", "SpaceX", 9000, 6000, 3500, 15, "9 meses", 900, [1, 2, 4], "Grande capacidade de carga e baixo custo por quilograma.", ["Enorme capacidade", "Reutilizável"], ["Tecnologia em desenvolvimento", "Exige foguete pesado"], 4),
  S(3, "SpaceX Dragon", "crew", "SpaceX", 6000, 3000, 2000, 10, "5 anos", 1000, [1, 2, 3, 4], "Nave reutilizável, confortável e com sistemas avançados.", ["Reutilizável", "Tecnologia avançada"], ["Custo elevado", "Dependência da SpaceX"], 4),
  S(4, "Voyager", "probe", "NASA / JPL", 900, 1800, 1500, 2, "30 anos", 600, [5, 6], "Sonda de longo alcance para o espaço profundo.", ["Longa vida útil", "Baixo custo"], ["Pouca energia", "Transmissão lenta"]),
  S(5, "Juno", "probe", "NASA / JPL", 1500, 1800, 2500, 6, "7 anos", 800, [5], "Sonda com painéis solares para órbita de Júpiter.", ["Boa energia", "Resistente à radiação"], ["Missão curta"]),
  S(6, "OSIRIS-REx", "probe", "NASA / Lockheed Martin", 1200, 1800, 1800, 5, "7 anos", 700, [4], "Sonda de recolha de amostras de asteróides.", ["Manobras precisas", "Recolha de amostras"], ["Só asteróides"]),
  S(7, "New Horizons", "probe", "NASA / APL", 480, 1800, 1500, 1, "25 anos", 650, [5, 6], "Sonda rápida para os confins do Sistema Solar.", ["Muito rápida", "Leve"], ["Pouca capacidade de dados"]),
  S(8, "Terra (EOS)", "sat", "NASA", 4800, 1600, 3000, 20, "10 anos", 500, [3], "Satélite científico de observação do clima.", ["Muitos dados", "Longa vida"], ["Só órbita terrestre"]),
  S(9, "Sentinel", "sat", "ESA", 2300, 1600, 1800, 12, "7 anos", 400, [3], "Satélite de monitorização ambiental com radar.", ["Radar de alta resolução", "Económico"], ["Menos armazenamento"]),
  S(10, "Perseverance", "rover", "NASA / JPL", 1025, 1600, 2000, 8, "3 anos", 700, [1, 2], "Rover de última geração para astrobiologia.", ["Autonomia", "Recolhe amostras"], ["Lento"]),
  S(11, "Curiosity", "rover", "NASA / JPL", 900, 1600, 2000, 6, "5 anos", 600, [1], "Rover nuclear robusto e testado.", ["Fiável", "Energia constante"], ["Menos instrumentos"]),
  S(12, "Módulo Lunar", "lander", "NASA / parceiros", 3000, 2500, 2500, 10, "1 ano", 550, [2, 4], "Módulo de aterragem para superfícies sem atmosfera.", ["Aterragem precisa", "Boa carga"], ["Só um local de aterragem"]),
];
export const SHIP_TYPES = { crew: "Nave tripulada", probe: "Sonda espacial", sat: "Satélite científico", rover: "Rover", lander: "Módulo de aterragem" };
const I = (id, name, icon, fn, mass, power, data, cost, goals, compat, pros, cons) => ({ id, name, icon, fn, mass, power, data, cost, goals, compat, pros, cons, life: "5 anos" });
const ALL = ["crew", "probe", "sat", "rover", "lander"];
export const INSTRUMENTS = [
  I("cam", "Câmara Panorâmica", "📷", "Regista imagens de alta resolução da superfície.", 25, 80, 5, 70, ["imagem"], ALL, ["Imagens de alta qualidade", "Grande área de cobertura"], ["Gera grande volume de dados", "Não analisa a composição química"]),
  I("spec", "Espectrómetro", "🌈", "Analisa a composição química de rochas e solos.", 30, 60, 2, 100, ["composicao"], ALL, ["Identifica minerais", "Dados compactos"], ["Alcance curto"]),
  I("met", "Estação Meteorológica", "🌦️", "Mede temperatura, pressão, vento e humidade.", 10, 20, 0.5, 90, ["clima"], ALL, ["Leve e barata", "Dados contínuos"], ["Só mede o local"]),
  I("drill", "Perfurador de Solo", "⛏️", "Recolhe amostras do subsolo para análise.", 80, 150, 1, 120, ["composicao", "subsolo"], ["rover", "lander", "crew"], ["Acede ao subsolo", "Amostras directas"], ["Consome muita energia", "Mais pesado"]),
  I("bio", "Detector de Biomoléculas", "🧬", "Procura sinais de vida passada (moléculas orgânicas).", 40, 70, 1, 130, ["vida"], ["rover", "lander"], ["Resposta científica forte"], ["Só rovers e módulos"]),
  I("radar", "Radar de Subsuperfície", "📡", "Detecta gelo e estruturas por baixo da superfície.", 35, 100, 3, 110, ["subsolo"], ["probe", "sat", "rover", "lander"], ["Vê através do solo", "Não faz contacto"], ["Menor resolução"]),
];
const R = (id, name, maker, stages, payload, cost, reuse, h, pros) => ({ id, name, maker, stages, payload, cost, reuse, dim: `${h} m`, pros });
export const ROCKETS = [
  R(1, "Falcon 9", "SpaceX", 2, 8000, 150, "Parcial", 70, "Fiável e económico; carga limitada."),
  R(2, "Atlas V", "ULA", 2, 6500, 250, "Não", 58, "Muito fiável; custo elevado por kg."),
  R(3, "Falcon Heavy", "SpaceX", 2, 18000, 400, "Parcial", 70, "Grande carga; mais complexo."),
  R(4, "SLS", "NASA / Boeing", 2, 35000, 1100, "Não", 98, "Máxima carga; muito caro."),
];
const O = (id, name, type, period, cover, purpose, cost, dest, use) => ({ id, name, type, period, cover, purpose, cost, dest, use });
export const ORBITS = [
  O(1, "Órbita Areocêntrica Baixa (OAB)", "Areocêntrica baixa", "≈ 1 h 52 min", "Alta resolução", "Mapeamento e observação detalhada", 30, [1], "Baixo"),
  O(2, "Órbita Lunar Baixa", "Selenocêntrica baixa", "≈ 2 h", "Alta resolução", "Apoio à aterragem e mapeamento", 30, [2], "Baixo"),
  O(3, "Órbita Polar Heliossíncrona", "Terrestre polar", "≈ 1 h 40 min", "Global", "Observação regular de todo o planeta", 40, [3], "Médio"),
  O(4, "Órbita de Transferência Heliocêntrica", "Heliocêntrica", "≈ 1 a 6 anos", "Variável", "Encontros com asteróides e planetas distantes", 60, [4, 5], "Alto"),
  O(5, "Trajectória de Escape Solar", "Hiperbólica", "—", "Espaço interestelar", "Sair da heliosfera", 90, [6], "Muito alto"),
];
// Astronautas reais da NASA (factos públicos resumidos). Ilustrados como bonecos; as habilidades são parâmetros de jogo.
export const ASTRONAUTS = [
  { id: 1, g: "f", name: "Peggy Whitson", nat: "Estados Unidos", spec: "Bioquímica e longas missões", exp: "Mais de 660 dias no espaço", skills: [5, 4, 5], edu: "Doutoramento em Bioquímica (Rice University)", bio: "Biocientista e comandante da Estação Espacial Internacional. Foi a primeira mulher a comandar a ISS e detém o recorde de tempo acumulado no espaço entre os astronautas dos EUA.", fun: "Foi a primeira mulher a comandar a ISS, em 2007." },
  { id: 2, g: "f", name: "Kate Rubins", nat: "Estados Unidos", spec: "Biologia molecular", exp: "2 missões na ISS", skills: [4, 5, 4], edu: "Doutoramento em Biologia do Cancro (Stanford University)", bio: "Cientista que voou para a ISS em 2016 e 2020. Em 2016 realizou a primeira sequenciação de ADN no espaço.", fun: "Antes de ser astronauta, investigou vírus em laboratório." },
  { id: 3, g: "m", name: "Scott Kelly", nat: "Estados Unidos", spec: "Piloto e engenharia", exp: "340 dias seguidos na ISS", skills: [4, 4, 5], edu: "Engenharia Eléctrica (SUNY Maritime) e Mestrado em Sistemas de Aviação", bio: "Piloto de testes da Marinha dos EUA. Passou quase um ano na ISS (2015-2016) num estudo sobre os efeitos de missões longas no corpo humano.", fun: "O seu irmão gémeo, Mark, serviu de comparação no estudo dos gémeos da NASA." },
  { id: 4, g: "f", name: "Christina Koch", nat: "Estados Unidos", spec: "Engenharia eléctrica", exp: "328 dias seguidos na ISS", skills: [4, 5, 4], edu: "Engenharia Eléctrica e Física (NC State University)", bio: "Engenheira que passou 328 dias seguidos na ISS (2019-2020), o recorde para uma mulher numa só missão. Participou na primeira caminhada espacial só com mulheres.", fun: "Trabalhou em instrumentos científicos para satélites e na Antártida." },
];
export const GLOSS = {
  massa: "A massa é a quantidade de matéria de um objecto (kg). Quanto maior a massa da nave e dos equipamentos, mais potente tem de ser o foguete.",
  potência: "A potência (W) mede a energia por segundo. Os instrumentos e as comunicações consomem potência; os painéis solares produzem-na.",
  dados: "Os dados (GB/dia) são a informação recolhida pelos instrumentos. A nave tem de os guardar e transmitir à Terra.",
  órbita: "Uma órbita é a trajectória de um corpo à volta de outro, mantida pela gravidade. A sua altura e inclinação definem o que podes observar.",
  orçamento: "O orçamento é o dinheiro disponível (M USD = milhões de dólares). Cada escolha tem um custo.",
  estágios: "Os estágios são secções do foguete que se separam quando ficam sem combustível, para reduzir a massa.",
};
