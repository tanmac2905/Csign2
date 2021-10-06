import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  HostListener,
  ViewEncapsulation,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subject } from "rxjs";
import { take, takeUntil, filter, throwIfEmpty } from "rxjs/operators";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import * as FileSaver from "file-saver";
import { CoreConfigService } from "@core/services/config.service";
import { CoreMenuService } from "@core/components/core-menu/core-menu.service";
import { CoreSidebarService } from "@core/components/core-sidebar/core-sidebar.service";
import { loadPdfService } from "app/main/sample/loadPdf.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Listcertservice } from "app/auth/service/listcert.service";
import { SigningService } from "../../../../auth/service/signing.service";
import * as forge from "node-forge";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "vertical-menu",
  templateUrl: "./vertical-menu.component.html",
  styleUrls: ["./vertical-menu.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class VerticalMenuComponent implements OnInit, OnDestroy {
  coreConfig: any;
  pdfSrc;
  menu: any;
  isCollapsed: boolean;
  isScrolled: boolean = false;
  page: number = 1;
  totalPages!: number;
  checkedEmail: string = "1";
  checkedName: string = "1";
  checkedOrgUnit: string = "1";
  checkedTime: string="1"
  checkedHeader: true;
  width: number = 120;
  height: number = 60;
  dragPosition = { x: 0, y: 0 };
  x = 0;
  y = 0;
  public test = "";
  selectedCert
  selectItem:any[]=[];
  selectCert:any[]=[]
  option="Ảnh/Chữ"
  listCert:string [] = [];
  listDocuments:any[] = [];
  listPDF:any[] = [];
  certInfor:any[]=[]
  public selectBasic = [
    {
      id: "5a15b13c36e7a7f00cf0d7cb",
      index: 2,
      isActive: true,
      picture: "http://placehold.it/32x32",
      age: 23,
      name: "Karyn Wright",
      gender: "female",
      company: "ZOLAR",
      email: "karynwright@zolar.com",
      phone: "+1 (851) 583-2547",
    },
    {
      id: "5a15b13c2340978ec3d2c0ea",
      index: 3,
      isActive: false,
      picture: "http://placehold.it/32x32",
      age: 35,
      name: "Rochelle Estes",
      disabled: true,
      gender: "female",
      company: "EXTRAWEAR",
      email: "rochelleestes@extrawear.com",
      phone: "+1 (849) 408-2029",
    },
    {
      id: "5a15b13c663ea0af9ad0dae8",
      index: 4,
      isActive: false,
      picture: "http://placehold.it/32x32",
      age: 25,
      name: "Mendoza Ruiz",
      gender: "male",
      company: "ZYTRAX",
      email: "mendozaruiz@zytrax.com",
      phone: "+1 (904) 536-2020",
    },
  ];
  documents:any[]=[]
  public selectBasicLoading = false;
  // Privatedo
  private _unsubscribeAll: Subject<any>;
  [x: string]: any;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {CoreMenuService} _coreMenuService
   * @param {CoreSidebarService} _coreSidebarService
   * @param {Router} _router
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _coreMenuService: CoreMenuService,
    private _coreSidebarService: CoreSidebarService,
    private _router: Router,
    private loadPdfService: loadPdfService,
    private modalService: NgbModal,
    private singingService:SigningService,
    private listCertService: Listcertservice,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    public form: FormBuilder
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
    // this.top.valueChanges.subscribe(v => {
    //   console.log('In the component ' +  v);
    // });
  }

  @ViewChild(PerfectScrollbarDirective, { static: false })
  directiveRef?: PerfectScrollbarDirective;
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On Init
   */
  ngOnInit(): void {
    this.signForm = this.form.group({
      operationMode: ["A",Validators.required],
      sad: ["44833",Validators.required],
      photo:[null,Validators.required],
      certificate: [null,Validators.required],
      signedProps: [null,Validators.required],
      documents: [null,Validators.required], 
      config: this.form.group({
        top: [this.x,Validators.required],
        left: [this.y,Validators.required],
        height: [this.height,Validators.required],
        width: [this.width,Validators.required],
        pageIndex: [this.page,Validators.required],
      }),
      display: this.form.group({
        hasPhoto: [true,Validators.required],
        hasLabel: [true,Validators.required],
        hasCommonName: [true,Validators.required],
        hasEmail: [true,Validators.required],
        hasOrganization: [true,Validators.required],
        HasSigningTime: [true,Validators.required]
      }),
    })
    // Subscribe config change
    this._coreConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.coreConfig = config;
      });

    this.isCollapsed =
      this._coreSidebarService.getSidebarRegistry("menu").collapsed;

    // Close the menu on router NavigationEnd (Required for small screen to close the menu on select)
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        if (this._coreSidebarService.getSidebarRegistry("menu")) {
          this._coreSidebarService.getSidebarRegistry("menu").close();
        }
      });

    // scroll to active on navigation end
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe(() => {
        setTimeout(() => {
          //this.directiveRef.scrollToElement(".navigation .active", -180, 500);
        });
      });

    // Get current menu
    this._coreMenuService.onMenuChanged
      .pipe(
        filter((value) => value !== null),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.menu = this._coreMenuService.getCurrentMenu();
      });
    // this.getListSig();
    // this.getTemplate();
  }
  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * On Sidebar scroll set isScrolled as true
   */
  onSidebarScroll(): void {
    if (this.directiveRef.position(true).y > 3) {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
  }

  /**
   * Toggle sidebar expanded status
   */
  toggleSidebar(): void {
    this._coreSidebarService.getSidebarRegistry("menu").toggleOpen();
  }
  /**
   * Toggle sidebar collapsed status
   */
  toggleSidebarCollapsible(): void {
    // Get the current menu state
    this._coreConfigService
      .getConfig()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.isCollapsed = config.layout.menu.collapsed;
      });

    if (this.isCollapsed) {
      this._coreConfigService.setConfig(
        { layout: { menu: { collapsed: false } } },
        { emitEvent: true }
      );
    } else {
      this._coreConfigService.setConfig(
        { layout: { menu: { collapsed: true } } },
        { emitEvent: true }
      );
    }
  }
  // getListSig() { Lấy chữ ký từ API
  //   this.listCertService.getListSig().subscribe((respon: any) => {
  //     this.listSig = respon.result;
  //     localStorage.setItem("listCert", JSON.stringify(this.listSig));
  //     console.log(this.listSig[0].subscriberID);
  //   });

  // }
  // getTemplate(){
  //   const listCert = JSON.parse(localStorage.getItem("listCert")!);
  //   console.log(listCert[0]);
  //   const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
  //   console.log(currentUser);
  //   const subscriberID = listCert[0].subscriberID;
  //   console.log(subscriberID);
  //   const token = currentUser.accessToken;
  //   const option = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + token,
  //     },
  //   };
  //   return this.http.get<any>(
  //     `http://183.91.3.60:13301/api/SignatureConfig/GetTemplate/${subscriberID}`,
  //     option).subscribe((responseTemplate:any) => {
  //     // const cert = responseTemplate.result.certificate;
  //     console.log(responseTemplate);
  //     const cert = forge.pki.certificateFromPem(
  //       "-----BEGIN CERTIFICATE-----\r\n" +
  //         responseTemplate.result.certificate +
  //         "\r\n-----END CERTIFICATE-----\r\n"
  //     );
  //     const templateImg = responseTemplate.result.image;
  //     console.log(templateImg);
  //     let props = [];
  //     if (cert.subject.attributes.length !== 0) {
  //       for (let i = 0; i < cert.subject.attributes.length; i++) {
  //         let prop = {};
  //         if (cert.subject.attributes[i].shortName === "E") {
  //           prop = {
  //             name: cert.subject.attributes[i].name,
  //             value: cert.subject.attributes[i].value,
  //             checked: true,
  //           };
  //           props.push(prop);
  //         }
  //         if (cert.subject.attributes[i].shortName === "CN") {
  //           prop = {
  //             name: cert.subject.attributes[i].name,
  //             value: cert.subject.attributes[i].value,
  //             checked: true,
  //           };
  //           props.push(prop);
  //         }
  //         if (cert.subject.attributes[i].shortName === "OU") {
  //           prop = {
  //             name: cert.subject.attributes[i].name,
  //             value: cert.subject.attributes[i].value,
  //             checked: true,
  //           };
  //           props.push(prop);
  //         }
  //         if (cert.subject.attributes[i].shortName === "O") {
  //           prop = {
  //             name: cert.subject.attributes[i].name,
  //             value: cert.subject.attributes[i].value,
  //             checked: true,
  //           };
  //           props.push(prop);
  //         }
  //       }
  //     }
  //     this.signInfors = props;
  //     console.log(this.signInfors);
  //     this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(
  //       `data:image/png;base64,${templateImg}`
  //     );})
  // }
  onFileInput(event) {
    //console.log(event.target.files[0].name)
    this.pdfName = event.target.files[0].name
    this.listPDF.push({
      attributeName: "filename",
      attributeValue: this.pdfName
    });
    //console.log(this.listPDF)
    this.signForm.patchValue({
      signedProps: this.listPDF
    })
    //console.log(this.files);
    this.loadPdfService.changedPdf(this.files);
    console.log(this.files);
    this.loadPdfService.changedName("hung");
    // const pdfTatget: any = event.target;
    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
        this.localPDF = this.pdfSrc;
        this.test = this.localPDF
        this.listDocuments.push(this.test.split(",")[1])
        //console.log(this.listDocuments)
        //this.localPDF = this.test;
        //console.log(this.test.split(",")[1]);
                //   cert.split(",")[1] +
        this.signForm.patchValue({
          documents : this.listDocuments
        })
      };
      //reader.readAsArrayBuffer(this.files[0]);
    }
  }
  handleFile(event: any) {
    if (this.files != null) {
      this.files = Array.from(this.files).concat(Array.from(event.files));
    } else {
      this.files = event.files;
    }
  }
  choosePdf(i: number) {
    if(this.files !== null){
    this.loadPdfService.chossePdf(this.files[i]);
    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
        this.localPDF = this.pdfSrc;
      };
      reader.readAsArrayBuffer(this.files[i]);
      //console.log(this.files[i]);
    }}
  }
  removeFile(i) {
    //this.loadPdfService.changedPdf(this.files);
    if (
      this.files !== null &&
      this.files.length > 1 &&
      typeof FileReader !== "undefined"
    ) {
      //  this.Files = Array.from(this.Files).splice(0, 1) ;
      const foo_object = this.files[i];
      this.files = Array.from(this.files).filter((obj) => obj !== foo_object);
    }
    //console.log(this.files);
    this.loadPdfService.changedPdf(this.files);
  }
  onCertInput(e:any) {
    for (var i = 0; i < e.target.files.length; i++) { 
      this.listCert.push(e.target.files[i]);
    }
    //console.log(this.listCert);
    let cert = e.target.files
    const reader = new FileReader();
    reader.readAsText(cert[0]);
    reader.onload = (e: any) => {
      const cert = e.target.result;
      console.log(cert);
      console.log(cert.slice(29,-29));
      console.log(cert.slice(29,-29).replaceAll("\n","").replaceAll("\r",""))
      this.signForm.patchValue({
        certificate : cert.slice(29,-29).replaceAll("\n","").replaceAll("\r","")
      })
      const certed = forge.pki.certificateFromPem(cert
        // "-----BEGIN CERTIFICATE-----\r\n" +
        //   cert.split(",")[1] +
        //   "\r\n-----END CERTIFICATE-----\r\n"
      );
      const certificated = JSON.parse(
        forge.util.decodeUtf8(JSON.stringify(certed.subject.attributes))
      );
      console.log(certificated);
      let count = this.certInfor.length,
      inc = ++count;
      this.certInfor.push({
      countryName: certificated[8].value,
      provinceName: certificated[7].value,
      localityName: certificated[6].value,
      organizationName: certificated[5].value,
      streetAddress: certificated[0].value,
      emailAddress: certificated[2].value,
      commonName: certificated[4].value,
      telePhone: certificated[1].value
    });
    };
  }
  onDragEnded(event: any): void {
    let position = event.source.getFreeDragPosition();
    console.log(position);
    //console.log(position.x, position.y);
    this.x = position.x;
    this.y = position.y;
  }
  changePositionX() {
    this.dragPosition = {
      x: (this.dragPosition.x = this.x),
      y: this.dragPosition.y + 0,
    };
  }
  changePositionY() {
    this.dragPosition = {
      x: this.dragPosition.x + 0,
      y: (this.dragPosition.y = this.y),
    };
  }
  inputImage(event){
    if (typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (e: any) => {
        this.image = e.target.result;
        //console.log(this.image);
        //console.log(this.image.split(",")[1])
        this.signForm.patchValue({
          photo : this.image.split(",")[1]
        })
      };
    }        

  }
  openCauhinh(modalCauhinh) {
    this.modalService.open(modalCauhinh, {
      scrollable: true,
      size: "lg",
    });
  }
  postSignRequest(){
    //this.singingService.requestSigning().subscribe;
    const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
    const token = currentUser.data.token;
    //console.log("Token:",token);
    const sigNing = JSON.stringify(this.signForm.value);
    //console.log(sigNing);
    this.singingService.requestSigning(sigNing).subscribe((res: any) => {
      console.log(res)
    });
  }
  openKyso(modalBasic) { 
    console.log(this.signForm.value)
    // const sigNing = JSON.stringify(this.signForm.value);
    // console.log(sigNing);
    // this.singingService.requestSigning(sigNing).subscribe((res: any) => {
    //   console.log(res)
    // });
        this.modalService.open(modalBasic, {
      scrollable: true,
      centered: true,
      size: "lg",
    });
  }
  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'application/pdf' });    
    return blob;
 }
  getData(i: number){
    this.singingService.getData().subscribe((data:any) => {
      console.log(data)
      const pdfSigned = ("data:application/pdf," + data.data[0].data) 
      // console.log(data.data[0].fileName)
      // console.log(pdfSigned)
      const base64 = data.data[0].data;
const imageName = data.data[0].fileName;
const imageBlob = this.dataURItoBlob(base64);
const imageFile = new File([imageBlob], imageName, { type: 'application/pdf' });
      // var blob = new Blob([pdfSigned], {type: "application/pdf"});
      // this.file = new File([blob], data.data[0].fileName,{type: "application/pdf"});

      FileSaver.saveAs(imageFile);

      console.log(this.file)
      console.log(this.files[0])
      console.log(this.files)
      //this.files.push(this.file)
      this.files = Array.from(this.files).concat(imageFile);
      console.log(this.files)
      this.loadPdfService.changedPdf(this.files);
      this.loadPdfService.chossePdf(this.files[i]);
    })
  }
    //this.signForm.get('documents').value
    // console.log(this.signForm.get("certificate").value)
    // console.log(this.signForm.get("documents").value)
    // //console.log(this.signForm.get("attributeValue").value)
    // console.log(this.signForm.value)
    // // this.modalService.open(modalBasic, {
    // //   scrollable: true,
    // //   centered: true,
    // //   size: "lg",
    // // });
  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = true;
  }
}
