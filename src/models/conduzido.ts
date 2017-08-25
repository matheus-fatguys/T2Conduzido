export interface Conduzido{
    id: string,
    nome: string,
    telefone: string,
    condutor: string,
    chave: string,
    ativo: boolean,
    usuario:string,
    localizacao?:{latitude:number, longitude:number, endereco?:string}
}