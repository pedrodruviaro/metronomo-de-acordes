# Metrônomo de Acordes 🎸

Um aplicativo web para praticar acordes de guitarra com metrônomo configurável.

## 🚀 Funcionalidades

- Configuração de BPM (batidas por minuto)
- Intervalo personalizável entre mudanças de acordes
- Lista de acordes customizável
- Modo sequencial ou aleatório para execução dos acordes
- Persistência de configurações no navegador
- Visualização do acorde atual e próximo acorde

## 📦 Instalação

```bash
pnpm install
```

## 🛠️ Desenvolvimento

```bash
pnpm dev
```

## 🏗️ Build

```bash
pnpm build
```

## 📤 Deploy no GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages através do GitHub Actions.

### Passos para fazer o deploy:

1. **Crie um repositório no GitHub** (se ainda não tiver)

2. **Faça push do código:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/guitar-learner.git
   git push -u origin main
   ```

3. **Habilite o GitHub Pages:**

   - Vá em **Settings** do repositório
   - No menu lateral, clique em **Pages**
   - Em **Source**, selecione **GitHub Actions**
   - O workflow já está configurado e será executado automaticamente

4. **Aguarde o deploy:**
   - O workflow será executado automaticamente a cada push na branch `main`
   - Você pode acompanhar o progresso em **Actions** no repositório
   - Após o deploy, seu site estará disponível em:
     `https://SEU-USUARIO.github.io/guitar-learner/`

### Deploy manual (alternativa):

Se preferir fazer deploy manual:

```bash
pnpm build
# O arquivo dist/ será criado
# Faça upload do conteúdo de dist/ para o GitHub Pages
```

## 🎯 Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS

## 📝 Licença

Este projeto está sob a licença MIT.
