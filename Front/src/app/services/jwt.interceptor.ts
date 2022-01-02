import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Storage } from "@ionic/storage-angular";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private storage: Storage, private router: Router, private authService: AuthService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authService.isAuthenticated()) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + this.getToken())
                    .append('Access-Control-Allow-Origin', '*')
            });
            return next.handle(authReq);
        }
        return next.handle(req);
    }

    getToken() {
        return this.authService.getAccessToken();
    }
}