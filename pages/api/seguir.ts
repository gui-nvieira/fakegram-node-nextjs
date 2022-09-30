import type {NextApiRequest,NextApiResponse} from 'next';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { UsuarioModel } from '../../models/UsuarioModel';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import {SeguidorModel} from '../../models/SeguidorModel'
import { politicaCORS } from '../../middlewares/politicaCORS';

const endpointSeguir = async(req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){
            const {userId,id} = req?.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!userId){
                return res.status(400).json({erro: 'Usuario logado não encontrado'});
            }
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!id){
                return res.status(400).json({erro: 'Usuario a ser seguido não encontrado'});
            }
            const euJaSigoEsseUsuario = await SeguidorModel.find({
                usuarioId: usuarioLogado._id ,usuarioSeguidoId: usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                euJaSigoEsseUsuario.forEach(async(e : any)=>await SeguidorModel.findByIdAndRemove({_id: e._id}));
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg: 'Usuario deixou de seguir com sucesso'});
            }else{
                const seguidor = {usuarioId: usuarioLogado._id ,
                    usuarioSeguidoId: usuarioASerSeguido._id};
                await SeguidorModel.create(seguidor);
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg: 'Usuario seguido com sucesso'});
            }
            
        }
        return res.status(405).json({erro: 'Método não é válido'})
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível seguir'});
        
    }

}

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)));