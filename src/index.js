// src/index.js (ou onde inicializa o Express)
const express = require('express');
const helmet = require('helmet');
// Importar bibliotecas para validação e sanitização
const { body, validationResult } = require('express-validator');
const app = express();
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// [Seus middlewares de segurança (Helmet, etc.) aqui...]

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

// --- Rotas de Login e Cadastro com SSDLC Aplicado ---

// Função de Tratamento Seguro de Erros e Validação
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // TRATAMENTO SEGURO DE ERROS: Retorna mensagem genérica para não vazar detalhes
        return res.status(400).json({ 
            success: false, 
            message: 'Dados de entrada inválidos. Verifique os campos e tente novamente.' 
        });
    }
    next();
};

// --- Rota de Cadastro ---
app.post('/cadastro', [
    // Validação de Entradas (Regras de Whitelist/Sanitização)
    body('email')
        .isEmail().withMessage('Email inválido.')
        .normalizeEmail(), // Sanitiza: converte para minúsculas
    body('senha')
        .isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
    body('nome')
        .trim() // Sanitiza: remove espaços em branco no início/fim
        .isAlpha('pt-BR', { ignore: ' ' }).withMessage('Nome contém caracteres inválidos.'),

    handleValidationErrors
], async (req, res) => {
    const { email, senha, nome } = req.body;

    // Prática de Segurança: A senha NUNCA é armazenada em texto puro.
    // Use bcrypt/argon2 para hash e salt. (Simulação: const hashedPassword = await hash(senha);)

    // Se passou na validação, os dados são considerados seguros.
    console.log(`Novo usuário cadastrado: ${nome} (${email})`);
    
    // Tratamento Seguro de Erros: Simulação de resposta bem-sucedida
    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso.' });
});

// --- Rota de Login ---
app.post('/login', [
    // Validação de Entradas
    body('email').isEmail().normalizeEmail(),
    body('senha').exists(),

    handleValidationErrors
], async (req, res) => {
    const { email, senha } = req.body;

    // Simulação de busca no DB e verificação de senha
    if (email === 'teste@ssdls.com' && senha === 'SenhaSegura123') {
        
        // AUTENTICAÇÃO SEGURA COM TOKENS: Geração de Token (JWT)
        const token = 'seu-jwt-seguro-aqui'; // Simulação de token
        
        // AUTENTICAÇÃO SEGURA COM EXPIRAÇÃO E COOKIES:
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // EXIGE HTTPS
            sameSite: 'strict',
            maxAge: 3600000 // Expiração de 1 hora
        });

        // VERIFICAÇÃO DE SESSÃO: (Na vida real, o token seria verificado em cada requisição protegida)
        return res.json({ success: true, message: 'Login bem-sucedido.', user: email });
    }

    // TRATAMENTO SEGURO DE ERROS: Mensagem genérica para prevenir ataque de enumeração de usuário
    return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
});

// ... [Outras rotas e inicialização]
app.get('/', (req, res) => res.send('OK'));
app.listen(3000, '0.0.0.0', () => console.log('http://127.0.0.1:3000'));
