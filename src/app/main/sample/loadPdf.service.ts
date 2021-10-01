import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class loadPdfService {
    public fileList :BehaviorSubject<any>;
    public name : BehaviorSubject<any>;
    public pdfChosse : BehaviorSubject<any>;
    //fileList1 = this.fileList.asObservable();
    //public files: BehaviorSubject<any>;
  constructor() {
    this.name = new BehaviorSubject({});
    this.fileList = new BehaviorSubject({});
    this.pdfChosse = new BehaviorSubject([]);
  }
  changedPdf(files: any) {
    //console.log(files)
    this.fileList.next(files);
  }
  getPdf():Observable<any>{
      return this.fileList
  }
  chossePdf(pdfChosse:number){
    this.pdfChosse.next(pdfChosse);
    //console.log(pdfChosse)
  }
  removePdf(){

  }
  //test name
  getName():Observable<string> {
      return this.name;
  }
  changedName(name:string){
      this.name.next(name);
  }
}
