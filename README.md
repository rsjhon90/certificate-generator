<h1 align="center">Serverless project</h1>

## Tecnologias

- [Node.js](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- [Serverless Framework](serverless.com/)
- [Amazon Lambda](https://aws.amazon.com/pt/lambda/)
- [Sentry's Node SDK](https://sentry.io/)

## Projeto

Projeto serverless contendo duas lambdas functions, que têm como responsabilidade gerar certificado de um usuário e verificar sua validade.

Feito junto as aulas da [RocketSeat](https://www.rocketseat.com.br/) no curso `Ignite NodeJS`.
E a partir do template `aws-nodejs-typescript` do Serverless.

## Requerimentos

- NodeJS 14.x
- Serveless instalado.
- Credenciais AWS configuradas.

## Execução

- Altere as variáveis de ambiente em um arquivo `.env` como no exemplo.
- Rode `yarn` para instalar as dependências.

### Localmente

- Rode `serverless dynamodb install` para baixar o dynamoDB na raiz do projeto.
- Rode `yarn dynamodb:start` para iniciar o banco de dados localmente.
- Rode em outro terminal, `yarn dev` para subir a aplicação localmente.

### Deploying

- Rode `yarn deploy` para subir o projeto para AWS Lambda.

### Sentry para monitorar erros fora da aws

- Com um projeto criado no [Sentry](https://sentry.io/), copie o DSN para a variável no arquivo `.env`.