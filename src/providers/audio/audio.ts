import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { NativeAudio } from '@ionic-native/native-audio';


@Injectable()
export class AudioProvider {

  audioType: string = 'html5';
    sounds: any = [];
 
    constructor(public nativeAudio: NativeAudio, platform: Platform) {
 
        if(platform.is('cordova')){
            this.audioType = 'native';
        }
 
    }
 
    preload(key, asset) {
        try{
            
                   if(this.audioType === 'html5'){
            
                       let audio = {
                           key: key,
                           asset: asset,
                           type: 'html5'
                       };
            
                       this.sounds.push(audio);
            
                   } else {
            
                       this.nativeAudio.preloadSimple(key, asset);
            
                       let audio = {
                           key: key,
                           asset: key,
                           type: 'native'
                       };
            
                       this.sounds.push(audio);
                   }       

        }
        catch(error){
            console.error("erro executado audio: "+error)
        }
 
    }
 
    play(key){

        try {
            
                   let audio = this.sounds.find((sound) => {
                       return sound.key === key;
                   });
            
                   if(audio.type === 'html5'){
            
                       let audioAsset = new Audio(audio.asset);
                       audioAsset.play();
            
                   } else {
            
                       this.nativeAudio.play(audio.asset).then((res) => {
                           console.log(res);
                       }, (err) => {
                           console.log(err);
                       });
            
                   }
            
        } catch (error) {
            console.error("erro executado audio: "+error)            
        }
 
    }

}
