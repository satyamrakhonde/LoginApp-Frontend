import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { CreateUser } from './components/create-user/create-user';
import { Login } from './components/login/login';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path : '', component: Login },
    { path : 'create', component: CreateUser },
    { path : 'home', component: Home , canActivate: [AuthGuard] },
    { path : '**', redirectTo: '' }
];
