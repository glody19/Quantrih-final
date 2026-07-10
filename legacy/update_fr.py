with open("src/contexts/LanguageContext.tsx", "r") as f:
    content = f.read()

old_fr = """    "pb.initialT": "Initial",
    "ta.tit": "Allocation Tactique"
  },
  de: {"""

new_fr = """    "pb.initialT": "Initial",
    "ta.tit": "Allocation Tactique",
    "firstName": "Prénom",
    "lastName": "Nom",
    "email": "Adresse Email",
    "company": "Entreprise (Optionnel)",
    "pass": "Mot de passe",
    "passVerify": "Confirmer le mot de passe"
  },
  de: {"""
content = content.replace(old_fr, new_fr)

with open("src/contexts/LanguageContext.tsx", "w") as f:
    f.write(content)
