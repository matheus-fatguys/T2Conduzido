import { Rastreio } from './rastreio';
import { Trajeto } from './trajeto';
import { Conducao } from "./conducao";
export interface Roteiro {
    id: string,
    condutor: string,
    nome: string,
    hora: number,
    minuto: number,
    domingo: boolean,
    segunda: boolean,   
    terca: boolean,   
    quarta: boolean,   
    quinta: boolean,   
    sexta: boolean,   
    sabado: boolean,   
    conducoes: Conducao[],
    ativo: boolean,
    emAndamento?:boolean,
    interrompido?:boolean,
    inicio?:Date,
    fim?:Date,
    trajeto?:Trajeto,
    rastreamento?:Rastreio[]
}