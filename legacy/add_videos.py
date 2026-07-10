import re

with open('src/components/pages/Education.tsx', 'r') as f:
    content = f.read()

new_videos = """  {
    title: "How The Economic Machine Works",
    titleFr: "Comment Fonctionne la Machine Économique",
    speaker: "Ray Dalio",
    tag: "Macroeconomics",
    tagFr: "Macroéconomie",
    lang: "EN",
    videoId: "PHe0bXAIuk0",
    summary: "Ray Dalio breaks down the fundamental logic of the economic machine, exploring credit, interest rates, and debt cycles.",
    summaryFr: "Ray Dalio explique la logique fondamentale de la machine économique, explorant le crédit, les taux et les cycles de la dette.",
    featured: true
  },
  {
    title: "Finance & Capital Markets",
    titleFr: "Finance et Marchés des Capitaux",
    speaker: "Khan Academy",
    tag: "Finance Basics",
    tagFr: "Bases de la finance",
    lang: "EN",
    videoId: "F3QpgXBtDeo",
    summary: "An introduction to finance and capital markets by Khan Academy.",
    summaryFr: "Une introduction à la finance et aux marchés des capitaux par la Khan Academy.",
    featured: true
  },
  {
    title: "William Ackman: Everything You Need to Know About Finance and Investing in Under an Hour",
    titleFr: "Tout ce que vous devez savoir sur la finance en moins d'une heure",
    speaker: "Big Think",
    tag: "Investing",
    tagFr: "Investissement",
    lang: "EN",
    videoId: "WEDIj9JBTC8",
    summary: "Hedge fund manager Bill Ackman explains the basics of finance.",
    summaryFr: "Le gestionnaire de fonds Bill Ackman explique les bases de la finance.",
    featured: false
  },
  {
    title: "Modern Portfolio Theory - Explained in 4 Minutes",
    titleFr: "Théorie Moderne du Portefeuille - Expliquée en 4 minutes",
    speaker: "Kenji Explains",
    tag: "Portfolio Management",
    tagFr: "Gestion de portefeuille",
    lang: "EN",
    videoId: "3jQ_Fq9YmS8",
    summary: "A quick introduction to Markowitz's Modern Portfolio Theory and the Efficient Frontier.",
    summaryFr: "Une brève introduction à la théorie moderne du portefeuille de Markowitz et à la frontière efficiente.",
    featured: false
  },
  {
    title: "Aswath Damodaran: Valuation in Four Lessons",
    titleFr: "Aswath Damodaran: L'évaluation d'entreprise en 4 leçons",
    speaker: "Aswath Damodaran",
    tag: "Valuation",
    tagFr: "Valorisation",
    lang: "EN",
    videoId: "K-Ivlh5J8j8",
    summary: "The 'Dean of Valuation' explains the core principles of valuing any asset or business.",
    summaryFr: "Le 'Doyen de l'évaluation' explique les principes fondamentaux pour évaluer tout actif ou entreprise.",
    featured: false
  },
  {
    title: "Bogleheads Investment Philosophy",
    titleFr: "Philosophie d'investissement des Bogleheads",
    speaker: "Bogleheads",
    tag: "Indexing",
    tagFr: "Gestion Passive",
    lang: "EN",
    videoId: "V-EIK0_rN6s",
    summary: "The core principles of Jack Bogle's investment philosophy, focusing on low-cost index funds and long-term holding.",
    summaryFr: "Les principes fondamentaux de la philosophie de Jack Bogle, axés sur les fonds indiciels à bas coûts et la détention à long terme.",
    featured: false
  }"""

content = re.sub(r'const VIDEOS: VideoData\[\] = \[\s*\{\s*title: "How The Economic Machine Works",.*?\}\s*\];', f'const VIDEOS: VideoData[] = [\n{new_videos}\n];', content, flags=re.DOTALL)

with open('src/components/pages/Education.tsx', 'w') as f:
    f.write(content)
