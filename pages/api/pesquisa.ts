import type {NextApiRequest,NextApiResponse} from 'next';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { UsuarioModel } from '../../models/UsuarioModel';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';

const pesquisaEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg|any[]>) =>{
    try{
        if(req.method === 'GET'){
            if(req?.query?.id){
                const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                if(!usuarioEncontrado){
                    return res.status(400).json({erro: 'Usuário não encontrado'})
                }
                usuarioEncontrado.senha = null;
                return res.status(200).json(usuarioEncontrado);
            }else{
                const {filtro} = req.query;
                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro: 'Insira ao menos dois caracteres na pesquisa'});                
                }
                const usuariosEncontrados = await UsuarioModel.find({
                    $or: [{nome : {$regex:filtro, $options: 'i'}},
                    {email : {$regex:filtro, $options: 'i'}}]
                });
                usuariosEncontrados.forEach((e: any)=>e.senha = null);              
                return res.status(200).json(usuariosEncontrados);

            }
        }
        return res.status(40).json({erro: 'Metodo Informado não é valido'})
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível buscar usuarios'})
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));
