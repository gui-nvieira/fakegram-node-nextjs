import type { NextApiHandler, NextApiRequest , NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../types/RespostaPadraoMsg";
import mongoose from 'mongoose';

export const conectarMongoDB = (handler: NextApiHandler) => 
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    //verificar se o banco esta conectado, se estiver seguir para o endpoint
    // ou proximo middleware
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }


//ja que esta conectado vamos conectar
//obter a variavel de ambiente preenchida do env

    const{DB_CONEXAO_STRING} = process.env;

    //se a env estiver vazia aborta o uso do sistema e avisa o programador
    if(!DB_CONEXAO_STRING){
        return res.status(500).json({erro : 'ENV de configuracao do banco nao informado'});
    }

    mongoose.connection.on('connected', () => console.log('Banco de dados Conectado'));
    mongoose.connection.on('error', error => console.log(`Ocorreu algum erro ao conectar: ${error}`));
    await mongoose.connect(DB_CONEXAO_STRING);
    //agora posso seguir para o endpoint pois esta conectado no banco
    return handler(req,res);
}
