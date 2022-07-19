import { Injectable } from '@angular/core';
import { PoTableColumn } from '@po-ui/ng-components';
import { LocalStorageService } from 'src/app/shared/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor(private localStorageService: LocalStorageService) { }

  getColumns(){
    return [
      { label: 'Id', property: 'id' },
      { label: 'Nome', property: 'name' },
      { label: 'Ataque', property: 'power' },
      { label: 'Defesa', property: 'defense' },
      { label: 'Tipo', property: 'type', type: 'cellTemplate' },
      { label: 'Classe', property: 'class', type: 'cellTemplate' },
    ]
  }

  getItems(){
    let deck = this.localStorageService.get('deck');
    return (deck) ? deck : [];
  }

  getTypeOptions(){
    return [
      {label: 'Magia', value: '0'},
      {label: 'Criatura', value: '1'},
    ]
  }

  getClassOptions(){
    return [
      {label: 'Mago', value: '0'},
      {label: 'Paladino', value: '1'},
      {label: 'Caçador', value: '2'},
      {label: 'Druida', value: '3'},
      {label: 'Qualquer', value: '4'},
    ]
  }

  updateDeck(card: any){
    this.localStorageService.set('deck', card);
  }

  getLastId(){
    let lastId = this.localStorageService.get('lastId');
    return (lastId) ? lastId : 0;
  }

  setLastId(newId:number){
    this.localStorageService.set('lastId', newId);
  }
}
