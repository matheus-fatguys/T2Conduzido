import { Conduzido } from './conduzido';
import { Local } from "./local";
export interface Conducao {    
    id: string,
    condutor: string,
    conduzido: string,
    conduzidoVO: Conduzido,
    origem: Local,
    destino: Local,
    cancelada?:boolean
    emAndamento?:boolean
    embarcado?:boolean
    realizada?:boolean,
    interrompida?:boolean,
    inicio?:Date,
    fim?:Date,
    cancelamentoNotificado?:boolean,
    status?:StatusConducao
}
export enum StatusConducao{EmAndamento, Embarcado, Finalizada, Cancelada, Inicial}