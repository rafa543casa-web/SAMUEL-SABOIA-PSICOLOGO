# Psicológico Samuel Sabóia — App de Acompanhamento

App web (PWA) para acompanhamento de pacientes: registro de humor, diário, tarefas terapêuticas e gráficos de evolução.

## 🔑 Logins de demonstração
- **Psicólogo:** `dr.samuel` / `psi123`
- **Paciente:** `paciente` / `123`

## 🚀 Como publicar online (Vercel — grátis)

1. Crie uma conta em https://vercel.com (pode usar login do GitHub)
2. Crie uma conta em https://github.com se ainda não tiver
3. Crie um novo repositório no GitHub e suba esta pasta inteira (pode arrastar os arquivos na própria interface do GitHub, em "Add file" → "Upload files")
4. No Vercel, clique em "Add New Project", selecione o repositório que você criou
5. Deixe as configurações padrão (o Vercel detecta automaticamente que é um projeto Vite) e clique em "Deploy"
6. Em 1-2 minutos você recebe um link como `psicologico-samuel-saboia.vercel.app`

## 📱 Como o paciente instala no celular

Depois de publicado, peça para o paciente:
1. Abrir o link no navegador do celular (Chrome ou Safari)
2. Tocar no menu (⋮ ou compartilhar)
3. Escolher "Adicionar à tela inicial" / "Instalar app"

O app aparece como um ícone normal, abre em tela cheia, sem barra do navegador.

## 💻 Como rodar localmente (opcional, para testar antes)

Pré-requisito: ter o Node.js instalado (https://nodejs.org)

```
npm install
npm run dev
```

Abra o link que aparecer no terminal (geralmente http://localhost:5173)

## 🛍️ Próximo passo: publicar nas lojas (App Store / Play Store)

Quando quiser transformar este mesmo código em app nativo:
```
npm install -D @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```
Isso "empacota" este projeto como app Android/iOS sem reescrever o código.

## ⚠️ Importante — dados de demonstração

Este projeto usa dados fictícios guardados na memória do navegador (não salva em banco de dados de verdade). Para uso real com pacientes de verdade, será necessário conectar um banco de dados (ex: Supabase ou Firebase) para guardar os registros permanentemente. Posso te ajudar com isso quando for a hora.
