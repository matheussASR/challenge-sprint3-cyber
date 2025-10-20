// src/index.js (ou onde inicializa o Express)
const express = require('express');
const helmet = require('helmet');
const app = express();

// Middleware para processar JSON (necessário para rotas POST)
app.use(express.json()); 

// 1) Remova banner do Express
app.disable('x-powered-by');

// 2) Cabeçalhos de segurança (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"]
        }
    },
    referrerPolicy: { policy: "no-referrer" },
    frameguard: { action: 'deny' },
}));


// --- Funções de Validação e Sanitização Manuais ---

/**
 * Sanitiza e valida uma string para ser um nome seguro (apenas letras, sem scripts).
 * @param {string} input - O nome a ser verificado.
 * @returns {string|null} - O nome limpo ou null se for inválido.
 */
function sanitizeAndValidateName(input) {
    if (!input || typeof input !== 'string') return null;

    // Sanitização: Remove espaços em excesso e tags HTML (simples)
    const sanitized = input.trim().replace(/<[^>]*>/g, '');
    
    // Validação (Whitelist): Permite apenas letras e espaços
    // Regex: ^[A-Za-zÀ-ÿ\s]+$ (Permite letras, acentos e espaços)
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(sanitized)) {
        return null; // Falha na validação
    }
    
    // Garantir que o nome tenha um tamanho mínimo decente
    if (sanitized.length < 2) return null;
    
    return sanitized;
}

/**
 * Validação básica de email.
 * @param {string} input - O email a ser verificado.
 * @returns {string|null} - O email sanitizado (minúsculas) ou null.
 */
function sanitizeAndValidateEmail(input) {
    if (!input || typeof input !== 'string') return null;
    
    const email = input.trim().toLowerCase(); // Sanitização: Trim e Minúsculas

    // Validação Regex simples de formato de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return null; 
    }
    return email;
}


// --- Rotas de Login e Cadastro com SSDLC Aplicado ---

// --- Rota de Cadastro ---
app.post('/cadastro', async (req, res) => {
    const { email, senha, nome } = req.body;

    // 1. VALIDAÇÃO E SANITIZAÇÃO DE ENTRADAS (Manual)
    const safeName = sanitizeAndValidateName(nome);
    const safeEmail = sanitizeAndValidateEmail(email);

    // Validação da Senha
    if (!senha || senha.length < 8) {
        // TRATAMENTO SEGURO DE ERROS (Genérico)
        return res.status(400).json({ success: false, message: 'Dados de entrada inválidos.' });
    }
    
    if (!safeName || !safeEmail) {
        // TRATAMENTO SEGURO DE ERROS (Genérico)
        return res.status(400).json({ success: false, message: 'Dados de entrada inválidos.' });
    }

    // Nota SSDLC: Em produção, a senha deve ser hasheada e salgada antes de salvar.
    console.log(`Novo usuário cadastrado: ${safeName} (${safeEmail})`);
    
    // Tratamento Seguro de Erros: Simulação de resposta bem-sucedida
    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso.' });
});


// --- Rota de Login ---
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    // 1. VALIDAÇÃO E SANITIZAÇÃO DE ENTRADAS (Manual)
    const safeEmail = sanitizeAndValidateEmail(email);

    if (!safeEmail || !senha) {
        // TRATAMENTO SEGURO DE ERROS (Mensagem unificada)
        return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    // Simulação de busca no DB e verificação de senha
    if (safeEmail === 'teste@ssdls.com' && senha === 'SenhaSegura123') {
        
        // AUTENTICAÇÃO SEGURA COM TOKENS: Geração de Token (Simulação)
        const token = 'seu-jwt-seguro-aqui'; 
        
        // 2. AUTENTICAÇÃO SEGURA COM EXPIRAÇÃO E COOKIES:
        res.cookie('auth_token', token, {
            httpOnly: true,     // Não acessível via JS (Mitiga XSS)
            secure: true,       // EXIGE HTTPS
            sameSite: 'strict', // Proteção contra CSRF
            maxAge: 3600000     // Expiração de 1 hora
        });

        return res.json({ success: true, message: 'Login bem-sucedido.', user: safeEmail });
    }

    // 3. TRATAMENTO SEGURO DE ERROS: Mensagem genérica (evita enumeração de usuário)
    return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
});


// ... [Outras rotas e inicialização]
app.get('/', (req, res) => res.send('OK'));
app.listen(3000, '0.0.0.0', () => console.log('http://127.0.0.1:3000'));
