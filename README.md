# 🎬 Book a Call — RedDani

La tua pagina di prenotazione personalizzata.

---

## 🚀 Setup in 4 step

### Step 1: Crea un progetto Firebase (gratuito)

1. Vai su **[console.firebase.google.com](https://console.firebase.google.com)**
2. Clicca **"Aggiungi progetto"** → chiamalo `book-a-call` → Avanti → Avanti → Crea
3. Una volta creato, clicca **"Web"** (icona `</>`) per aggiungere un'app web
4. Dai un nome qualsiasi (es: "booking") → **Registra app**
5. Ti mostrerà il codice con `firebaseConfig` — **copia i valori**
6. Apri il file `src/firebase.js` e **incolla i tuoi valori** al posto dei placeholder

### Step 2: Abilita Firestore

1. Sempre nella Firebase Console, nel menu a sinistra clicca **"Firestore Database"**
2. Clicca **"Crea database"**
3. Scegli **"Modalità di test"** (per ora, poi la proteggeremo)
4. Scegli la regione **europe-west** → Clicca **Abilita**

### Step 3: Carica su GitHub

1. Vai su **[github.com](https://github.com)** e crea un nuovo repository
2. Chiamalo `book-a-call` → **Create repository**
3. Dalla cartella del progetto, apri il terminale ed esegui:

```bash
cd book-a-call
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/book-a-call.git
git push -u origin main
```

### Step 4: Deploy su Vercel (gratuito)

1. Vai su **[vercel.com](https://vercel.com)** → accedi con GitHub
2. Clicca **"Add New" → "Project"**
3. Seleziona il repository `book-a-call`
4. Vercel rileva automaticamente Vite → clicca **"Deploy"**
5. In ~1 minuto hai il tuo link! 🎉

Il link sarà tipo: `book-a-call-tuo-username.vercel.app`

Puoi anche personalizzare il dominio nelle impostazioni di Vercel.

---

## 📱 Mettilo su Instagram

1. Vai su **Modifica profilo** su Instagram
2. Nel campo **Sito web** incolla il tuo link Vercel
3. Nella bio scrivi qualcosa tipo: `Book a call ↓`

---

## 🔧 Come funziona

- **I clienti** vanno al link, vedono il calendario, scelgono giorno/orario, compilano il form
- **Tu** vai al link con la tab "Admin" per vedere le prenotazioni e gestire le indisponibilità
- **Le prenotazioni** si salvano in tempo reale su Firebase
- **Quando arriva una prenotazione**, scrivi a Claude in chat e lui crea l'evento Calendar + Meet

---

## 📁 Struttura file

```
book-a-call/
├── index.html          ← Pagina HTML principale
├── package.json        ← Dipendenze del progetto
├── vite.config.js      ← Configurazione Vite
└── src/
    ├── main.jsx        ← Entry point React
    ├── App.jsx         ← Componente principale (tutta la UI)
    ├── firebase.js     ← ⚠️ DA CONFIGURARE con i tuoi dati Firebase
    └── database.js     ← Funzioni per leggere/scrivere dal database
```
