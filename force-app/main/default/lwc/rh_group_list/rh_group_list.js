import { LightningElement } from 'lwc';

export default class Rh_group_list extends LightningElement {
    initial =[{Name:"Group1",Description:"Gp1"},
    {Name:"Group2",Description:"Gp2"},
    {Name:"Group3",Description:"Gp3"},
    {Name:"Group4",Description:"Gp4"},
    {Name:"Group5",Description:"Gp5"},
    {Name:"Group6",Description:"Gp6"},
    {Name:"Group7",Description:"Gp7"},
    {Name:"Group8",Description:"Gp8"},
]
    visibleGroups; 
    updateGroupeHandler(event){
    this.visibleGroups=[...event.detail.records]
    console.log(event.detail.records)
    }
}