import { Component, OnInit } from "@angular/core";

import { locale as en } from "./i18n/en";
import { locale as fr } from "./i18n/fr";
import { locale as de } from "./i18n/de";
import { locale as pt } from "./i18n/pt";

import { CoreTranslationService } from "@core/services/translation.service";
import { loadPdfService } from "./loadPdf.service";

@Component({
  selector: "app-sample",
  templateUrl: "./sample.component.html",
  styleUrls: ["./sample.component.scss"],
})
export class SampleComponent implements OnInit {
  public contentHeader: object;
  //pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  public pdfSrc;
  public pdfSource;
  files: Array<any> = new Array();
  fileContent: string | ArrayBuffer;
  /**
   *
   * @param {CoreTranslationService} _coreTranslationService
   */
  constructor(
    private _coreTranslationService: CoreTranslationService,
    private loadPdfService: loadPdfService
  ) {
    this._coreTranslationService.translate(en, fr, de, pt);
    // this.loadPdfService.name.subscribe((name) => {
    //   this.getPdfSrc();
    // });
    this.loadPdfService.pdfChosse.subscribe((name) => {
      //console.log(pdfChosse)
      this.chosenPdf();
    })
    //this.chosenPdf();
  }
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: "Home",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Home",
            isLink: true,
            link: "/",
          },
          {
            name: "Sample",
            isLink: false,
          },
        ],
      },
    };
    this.getPdfSrc();
  }
  getPdfSrc() {
    this.loadPdfService.fileList.subscribe(
      (files) => {
        //console.log(files[0]);
          const reader = new FileReader();
          reader.onload = () => {
            this.pdfSrc = reader.result;
            this.pdfSource = this.pdfSrc;
          };
          console.log(files)
          if(files.length > 0) {
            reader.readAsArrayBuffer(files[0]);
          }
        }
    );
  }
  chosenPdf() {
    this.loadPdfService.pdfChosse.subscribe(
      (pdfChosse) => {
        //console.log(pdfChosse);
        //console.log(this.files[pdfChosse])
        if (typeof FileReader !== "undefined") {

          const reader = new FileReader();
          reader.onload = (e:any) => {
            this.pdfSrc = e.target.result;
            this.pdfSource = this.pdfSrc;
          };
          if(this.pdfSrc){
            reader.readAsArrayBuffer(pdfChosse);
          }
        }}
    );
  }
}
