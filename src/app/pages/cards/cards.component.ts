import { Component, OnInit, ViewChild } from '@angular/core';
import { PoModalAction, PoModalComponent, PoNotificationService, PoPageFilter, PoSelectOption, PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { CardsService } from './cards.service';
import { Card, CardType, CardClass } from './interfaces/cards.interface';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  constructor(
    private cardsService: CardsService,
    private notification: PoNotificationService){}

  @ViewChild('cardModal') cardModal : PoModalComponent;
  @ViewChild('advancedFilterModal') advancedFilterModal : PoModalComponent;
  @ViewChild('removeModal') removeModal : PoModalComponent;
  
  tableColumns: PoTableColumn[];
  tableItems: Card[] = [];
  tableItemsFiltered: Card[] = [];
  tableActions: PoTableAction[] = [
    { label: 'Editar', action: this.openEditCardModal.bind(this) }, 
    { label: 'Remover', action: this.openRemoveModal.bind(this) },
    { label: 'Consultar', action: this.openVisualizeModal.bind(this) }
  ];
  isLoading: boolean = false;
  modalLabel: string = '';
  modalTitle: string = '';
  advFilterModalAction: PoModalAction = {label: 'Filtrar', action: this.advFilterAction.bind(this)};
  removeModalAction: PoModalAction = {label: 'Sim', action: this.removeCard.bind(this)};
  removeModalSecAction: PoModalAction = {label: 'Não', action: this.closeRemoveModal.bind(this)};
  cardTypeOption: PoSelectOption[];
  cardClassOption: PoSelectOption[];
  cardName: string = '';
  cardPower?: number;
  cardDefense?: number;
  cardType?: number;
  cardClass?: number;
  cardMana?: number;
  cardDescription: string;
  cardEditId: number;
  cardRemoveId: number;
  lastId:number;
  isEdit:boolean;
  isVisualize: boolean;
  isVisual: string;
  deckClass?: number = -1;
  pageFilter: PoPageFilter = {
    action: this.filterAction.bind(this), 
    width: 200, 
    placeholder: 'Nome',
    advancedAction: this.openAdvancedModal.bind(this)
  }

  filterId: number = 0;
  filterName: string = '';
  filterType?: number;
  filterClass?: number;

  CardType = CardType;
  CardClass = CardClass;

  ngOnInit(){
    this.tableColumns = this.cardsService.getColumns();
    this.cardTypeOption = this.cardsService.getTypeOptions();
    this.cardClassOption = this.cardsService.getClassOptions();
    this.tableItems = this.cardsService.getItems();
    this.tableItemsFiltered = this.tableItems;
    this.lastId = this.cardsService.getLastId();
    
  }

  openAddCardModal(){
    if(this.tableItems && this.tableItems.length > 0){
      this.deckClass = this.tableItems[0].class;
    } else {
      this.deckClass = -1;
    }

    if(this.tableItems && this.tableItems.length >= 30){
      this.notification.warning('Limite máximo de 30 cartas atingindo.')
    } else {
      this.resetModal();
      
      this.isEdit = false;
      this.isVisualize = false;
      this.isVisual = 'false';
      this.modalLabel = 'Adicionar';
      this.modalTitle = 'Adicionar carta';
      this.cardModal.open();
    }
    
  }

  addEditCard(){
    let cardObject: Card;
    let cardEditIndex;

    if(this.validCard()){
      this.lastId += (this.isEdit) ? 0 : 1;

      cardObject = {
        id: (this.isEdit) ? this.cardEditId : this.lastId,
        name: this.cardName, 
        description: this.cardDescription,
        power: this.cardPower,
        defense: this.cardDefense,
        type: this.cardType,
        class: this.cardClass,
        mana: this.cardMana
      }
 
      if(this.isEdit){
        cardEditIndex = this.tableItems.findIndex(card => card.id === this.cardEditId);
        if(cardEditIndex >= 0) {
          this.tableItems[cardEditIndex] = cardObject
        }
      } else {
        this.tableItems.push(cardObject);
        this.cardsService.setLastId(this.lastId);
      }

      this.cardsService.updateDeck(this.tableItems);
  
      this.tableItemsFiltered = this.tableItems;

      this.resetModal();
      this.cardModal.close();
    }
    
  }

  resetModal(){
    this.cardName = '';
    this.cardPower = undefined;
    this.cardDefense = undefined;
    this.cardType = undefined;
    this.cardClass = undefined;
    this.cardDescription = '';
    this.cardMana = undefined;
  }

  validCard(){
    let isValid = false;
    if (!this.cardName || !this.cardPower || !this.cardDefense || !this.cardType || !this.cardClass || !this.cardDescription || !this.cardMana) {
      this.notification.warning('Preencha todos os campos.');
    } else if(this.cardPower > 10 || this.cardPower < 0 || this.cardDefense > 10 || this.cardDefense < 0 || this.cardMana < 0 || this.cardMana > 10) {
      this.notification.warning('Valor do campo Ataque, Defesa e Mana devem ser entre 0 a 10.');
    } else if( this.deckClass !== undefined && this.deckClass !== -1 && this.deckClass !== this.cardClass && this.cardClass != 4){
      this.notification.warning('Adicione apenas cartas das classes ' + CardClass[this.deckClass] + ' ou Qualquer');
    } else if(this.tableItems.filter(card => card.name === this.cardName).length >= 2){
      this.notification.warning('Número máximo de cartas iguais atigindo: 2.');
    } else {
      isValid = true;
    }

    return isValid;
  }


  filterAction(searchFor: string, advFilter: boolean){
    this.isLoading = true;

    if(advFilter){
      this.tableItemsFiltered = this.tableItems.filter(card => 
        card.name.includes(this.filterName) &&
        ( !this.filterId || card.id == this.filterId ) &&
        ( !this.filterType || card.type == this.filterType ) &&
        ( !this.filterClass || card.class == this.filterClass )
      );

      this.advancedFilterModal.close();
    } else if(searchFor) {
      this.tableItemsFiltered = this.tableItemsFiltered.filter(card => card.name.includes(searchFor));
    } else {
      this.tableItemsFiltered = this.tableItems;
    }

    this.isLoading = false;
  }

  openAdvancedModal(){
    this.advancedFilterModal.open();
  }

  advFilterAction(){
    this.filterAction('', true);
  }

  openEditCardModal(card: Card){
    if(this.tableItems && this.tableItems.length > 0){
      this.deckClass = this.tableItems[0].class;
    } else {
      this.deckClass = -1;
    }
    this.cardName = card.name;
    this.cardPower = card.power;
    this.cardDefense = card.defense;
    this.cardMana = card.mana;
    this.cardType = card.type;
    this.cardClass = card.class;
    this.cardDescription = card.description;
    this.cardEditId = card.id;
    this.isEdit = true;
    this.isVisualize = false;
    this.isVisual = 'false';

    this.modalLabel = 'Editar';
    this.modalTitle = 'Editar carta';
    
    this.cardModal.open();
  }

  openRemoveModal(card: Card){
    this.cardRemoveId = card.id;
    this.removeModal.open();
  }

  removeCard(){
    let cardRemoveIndex = this.tableItems.findIndex(card => card.id === this.cardRemoveId);

    if(cardRemoveIndex >= 0) {
      this.tableItems.splice(cardRemoveIndex, 1);
      this.cardsService.updateDeck(this.tableItems);
    }

    this.removeModal.close();

  }

  closeRemoveModal(){
    this.removeModal.close();
  }

  openVisualizeModal(card: Card){
    this.cardName = card.name;
    this.cardPower = card.power;
    this.cardDefense = card.defense;
    this.cardMana = card.mana;
    this.cardType = card.type;
    this.cardClass = card.class;
    this.cardDescription = card.description;
    this.cardEditId = card.id;
    this.isVisualize = true;
    this.isVisual = 'true';

    this.modalLabel = 'Fechar';
    this.modalTitle = 'Consultar';
    
    this.cardModal.open()
  }

  closeCardModal(){
    this.cardModal.close();
  }

  resetFilters(){
    this.filterId = 0;
    this.filterName = '';
    this.filterType = undefined;
    this.filterClass = undefined;
  }


}
