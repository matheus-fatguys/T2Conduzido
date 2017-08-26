import { Local } from './local';
export interface Perna{
    tempo: {texto:string, numero:number},
    distancia: {texto:string, numero:number},
    local: Local   
    caminho:Array<google.maps.LatLng>
}