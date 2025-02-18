# 🎥 Video Frame Capture

Este repositório contém tanto o backend quanto o frontend de uma aplicação que captura frames de um vídeo e os envia via WebSocket para o backend, onde são armazenados no MongoDB.

## 🚀 Tecnologias Utilizadas

### Backend

- **Node.js**
- **WebSocket (`ws`)**
- **MongoDB (`mongoose`)**
- **Docker & Docker Compose**
- **dotenv** (para configuração de ambiente)

### Frontend

- **Puppeteer** (para controlo do navegador e captura de frames)
- **WebSocket (`ws`)**
- **Node.js**

### 📦 Instalação

1️⃣ **Clonar o Repositório**

```bash
git clone https://github.com/jpedro058/BRNDTS-chall
```

2️⃣ **Instalar as Dependências**

```bash
cd video-frame-capture/backend
npm install
cd ../frontend
npm install
```

3️⃣ **Rodar o Servidor**

```bash
cd server
npm start
```

4️⃣ **Executar o Frontend**

```bash
cd web
npm start
```

### Testar a Aplicação

- Use o Postman para conectar a "ws://localhost:8080" e enviar frames de vídeo em formato base64 ou Buffer, para ver os frames armazenados envie uma mensagem com o texto "getFrames" e o backend retornará os frames armazenados.
- Ou use o frontend para capturar frames de um vídeo e enviar via WebSocket.

## 📋 Como Funciona

### 1. **Frontend**

- **Puppeteer** é usado para controlar a página web e capturar frames de um vídeo hospedado numa URL.
- O vídeo é carregado, e o Puppeteer captura um frame a cada segundo, enviando-o ao backend através de uma conexão WebSocket.

### 2. **Backend (Armazenamento no MongoDB)**

- O backend recebe os frames via WebSocket.
- Cada frame é armazenado na base de dados **MongoDB**.
- Os frames são salvo guardados como objetos binários (Buffer).
- O backend também possui um endpoint para retornar todos os frames armazenados, para validar o armazenamento.

## 💡 Considerações Finais

- **MongoDB** foi escolhido para armazenar os frames devido à sua escalabilidade e facilidade de manipulação de dados binários.
- **Docker** facilita a configuração e execução do projeto em diferentes ambientes, garantindo consistência entre desenvolvimento e produção.
- **Puppeteer** de entre outras ferramentas foi escolhido para capturar os frames de vídeo devido à sua facilidade de uso e documentação.
