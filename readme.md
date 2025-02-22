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

- **ReactJS**
- **WebSocket (`ws`)**
- **Tailwind CSS**

### 📦 Instalação

1️⃣ **Clonar o Repositório**

```bash
git clone https://github.com/jpedro058/BRNDTS-chall
```

2️⃣ **Instalar as Dependências**

```bash
cd BRNDTS-challe/backend
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
cd frontend
npm run dev
```

### Testar a Aplicação

- Use o Postman para conectar a "ws://localhost:8080" e enviar uma mensagem com o formato JSON do tipo { action: "startCapture"} para iniciar a captura de frames, ou { action: "stopCapture"} para parar.
- Use o Postman para retornar os frames armazenados no MongoDB, enviando também uma mensagem com o formato JSON do tipo { action: "getFrames"}.
- Ou acesse a página web gerada pelo frontend para realizar as mesmas ações de forma mais visual.

## 📋 Como Funciona

### 1. **Frontend**

- O utilizador pode iniciar e parar a captura de frames através da interface.
- Quando a captura é iniciada, o frontend envia uma mensagem via WebSocket para o backend.
- O frontend também pode solicitar todos os frames armazenados, que são enviados pelo backend através do WebSocket.
- Um sistema de logs em tempo real exibe mensagens de status para o utilizador.

### 2. **Backend (Armazenamento no MongoDB)**

- O backend utiliza o Puppeteer para abrir uma página que contém um vídeo e capturar frames periodicamente.
- O backend recebe os frames via WebSocket.
- Cada frame é armazenado na base de dados **MongoDB**.
- Os frames são guardados como objetos binários (Buffer).
- O backend fornece uma funcionalidade para recuperar todos os frames guardados e enviá-los ao cliente via WebSocket.
- O WebSocket gere a comunicação entre frontend e backend, garantindo que os comandos e os dados sejam geridos corretamente.

## 💡 Considerações Finais

- **WebSocket** foi escolhido para a comunicação entre frontend e backend devido à sua baixa latência e facilidade de uso.
- **MongoDB** foi escolhido para armazenar os frames devido à sua escalabilidade e facilidade de manipulação de dados binários.
- **Docker** facilita a configuração e execução do projeto em diferentes ambientes, garantindo consistência entre desenvolvimento e produção.
- **Puppeteer** de entre outras ferramentas foi escolhido para capturar os frames de vídeo devido à sua facilidade de uso e documentação.
- **ReactJS** foi escolhido para o frontend devido à sua facilidade de uso.
