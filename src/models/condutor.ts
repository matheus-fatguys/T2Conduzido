import { Trajeto } from './trajeto';
import { Roteiro } from './roteiro';
import { Veiculo } from './veiculo';
import { Usuario } from './usuario';
export interface Condutor{
    id: string,
    nome: string,
    telefone: string,
    usuario: string,
    veiculo: Veiculo,
    localizacao:{latitude:number, longitude:number, endereco?:string}  
    localizacaoSimulada:{latitude:number, longitude:number, endereco?:string},
    roteiros?:Roteiro[]
    roteiroEmexecucao?:Roteiro
}