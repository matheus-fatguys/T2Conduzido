import { Perna } from "./perna";

export interface Trajeto {
    roteiro: string,
    tempoTotal: {texto:string, numero:number},
    distanciaTotal: {texto:string, numero:number},    
    pernas: Perna[]
}