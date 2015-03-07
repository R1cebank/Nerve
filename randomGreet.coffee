sample = "Greetings, strange one, what brings you here?"

greets = [
  "Greetings",
  "Ahoy",
  "Hola",
  "Konichiwa",
  "Kwai",
  "Ni hao",
  "Hej",
  "Tere",
  "Bonjour",
  "Guten Tag",
  "Aloha",
  "Shalom",
  "Hello",
  "Anyo",
  "Hoi"
]

adjs = [
  "adaptable",
  "adventurous",
  "affable",
  "affectionate",
  "agreeable",
  "ambitious",
  "amiable",
  "amicable",
  "amusing",
  "brave",
  "bright",
  "broad-minded",
  "calm",
  "careful",
  "charming",
  "communicative",
  "compassionate",
  "conscientious",
  "considerate",
  "convivial",
  "courageous",
  "courteous",
  "creative",
  "decisive",
  "determined",
  "diligent",
  "diplomatic",
  "discreet",
  "dynamic",
  "easygoing",
  "emotional",
  "energetic",
  "enthusiastic",
  "exuberant",
  "fair-minded",
  "faithful",
  "fearless",
  "forceful",
  "frank",
  "friendly",
  "funny",
  "generous",
  "gentle",
  "good",
  "gregarious",
  "hard-working",
  "helpful",
  "honest",
  "humorous",
  "imaginative",
  "impartial",
  "independent",
  "intellectual",
  "intelligent",
  "intuitive",
  "inventive",
  "kind",
  "loving",
  "loyal",
  "modest",
  "neat",
  "nice",
  "optimistic",
  "passionate",
  "patient",
  "persistent",
  "pioneering",
  "philosophical",
  "placid",
  "plucky",
  "polite",
  "powerful",
  "practical",
  "pro-active",
  "quick-witted",
  "quiet",
  "rational",
  "reliable",
  "reserved",
  "resourceful",
  "romantic",
  "self-confident",
  "self-disciplined",
  "sensible",
  "sensitive",
  "shy",
  "sincere",
  "sociable",
  "straightforward",
  "sympathetic",
  "thoughtful",
  "tidy",
  "tough",
  "unassuming",
  "understanding",
  "versatile",
  "warmhearted",
  "willing",
  "witty"
]

phrases = [
  "what brings you here?",
  "how about a quest"
]

subs = [
  "summoner",
  "adventurer",
  "the strange one",
]

greetings = '{GREET}, {ADJ} {SUB}, {PHRASE}'

for phrase, i in phrases
  for adj, j in adjs
    for greet, k in greets
      for sub, l in subs
        greeting = greetings.replace /{GREET}/g, greets[k]
        greeting = greeting.replace /{ADJ}/g, adjs[j]
        greeting = greeting.replace /{PHRASE}/g, phrases[i]
        greeting = greeting.replace /{SUB}/g, subs[l]
        console.log greeting
