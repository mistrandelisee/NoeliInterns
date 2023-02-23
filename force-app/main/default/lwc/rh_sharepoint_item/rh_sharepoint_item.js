import { api, LightningElement } from 'lwc';

export default class Rh_sharepoint_item extends LightningElement {
    @api
    item;
    @api baseUrl='https://noeliit.sharepoint.com';
    get title() { return this.item?.Name}
    get createdDate(){ return this.item?.TimeCreated}
    get extension(){ 
        if(this.title?.includes('.')){ 
            // console.log(`this.title.split('.')`, this.title.split('.'));
            return this.title.split('.').pop()
        }
        return '';
    }
    get source(){ return 'Sharepoint Files'}

    get icon(){ 
        return `doctype:${this.handleExtension()}`
    }
    handleExtension(){ 
        if(this.extension=='xlsx') return 'excel';
        if(this.extension=='docx') return 'word';
        return this.extension || 'attachment';
    }
    get link(){
        return this.item?.LinkingUri || this.buildLinkingUri();
    }

    buildLinkingUri(){
        let link = this.baseUrl+this.item?.ServerRelativeUrl;
        // console.log(`link ?? `, link );

        link= `${link}?d=w${this.item?.UniqueId?.replaceAll("-", "")}`;

        // console.log(`2 link ?? `, link );
        return encodeURI(link)
    }

    gotolink(){
        console.log(this.link)

        window.open(this.link)
    }
}