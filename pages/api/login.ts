import type {NextApiRequest,NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectaMongoDB';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import {UsuarioModel} from '../../models/UsuarioModel';
import md5 from 'md5';

const endpointLogin = async (
    req: NextApiRequest,
    res: NextApiResponse<RespostaPadraoMsg>
)=> {
    if(req.method === 'POST'){
        const {login,senha} = req.body;

        const usuariosEncontrados = await UsuarioModel.find({email: login, senha : md5(senha)});
        if (usuariosEncontrados && usuariosEncontrados.length > 0){
            const usuariosEncontrado = usuariosEncontrados[0];
            return res.status(200).json({msg: `O usuário ${usuariosEncontrado.nome} foi encontrado com sucesso`});
        }
        return res.status(405).json({erro: 'Usuário não encontrado'});
    }
    return res.status(405).json({erro : 'Método informado não é válido'});
}  

export default conectarMongoDB(endpointLogin);