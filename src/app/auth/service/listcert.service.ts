import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { User } from "../models";

@Injectable({ providedIn: "root" })
export class Listcertservice {
    constructor(
        private http: HttpClient,
      ) {}
    getListSig() {
        const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
        const userId = currentUser.userId;
        const token = currentUser.accessToken;
        const option = {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        return this.http
          .get<User>(
            `${environment.apiUrl}/api/SignatureCreation/GetListCredentials/${userId}`,
            option
          )
        //   .subscribe((respon: any) => {
        //     this.listSig = respon.result;
        //     localStorage.setItem("listSig", JSON.stringify(this.listSig));
        //     console.log(this.listSig);
        //   });
      }
}