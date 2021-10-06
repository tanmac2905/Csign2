import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SigningService {
  //public
  //public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
  }

  /**
   * User login
   * @param operationMode
   * @param certificate
   * @param photo
   * @param sad
   * @param signedProps
   * @param documents
   * @param config
   * @param display
   * @returns data

   */

  requestSigning(body) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
    const token = currentUser.data.token;
    //console.log(token);
    const option = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    return this._http
      .post<any>(`${environment.apiUrl}/api/SignatureCreationMessage/SendRequestSignature`, body ,option)
      .pipe(
        map(data => {
          console.log(data)
          // login successful if there's a jwt token in the response
          //if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('data', JSON.stringify(data));
          return data;
        })
      );

  }
getData(){
  const currentUser = JSON.parse(localStorage.getItem("currentUser")!);
  const token = currentUser.data.token;
  //console.log(token);
  const option = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };
  const data= JSON.parse(localStorage.getItem('data'));
  //console.log(data)
  const requestId = data.data.requestId
  console.log(requestId)
  return this._http
  .get<any>(`${environment.apiUrl}/api/PdfSigning/GetSignedDocument/${requestId}`,option)
  .pipe(
    map(res => {
      console.log(res)
      // login successful if there's a jwt token in the response
      //if (user && user.token) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
      return res;
    })
  );
  // (res => {
  //     console.log(res)
  //     // login successful if there's a jwt token in the response
  //     //if (user && user.token) {
  //       // store user details and jwt token in local storage to keep user logged in between page refreshes
  //       // localStorage.setItem('data', JSON.stringify(data));
  //     return data;
  //   }
  // );
}
  /**
   * User logout
   *
   */
}
