import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Event catalog',
    loadComponent: () => import('./features/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'events/:id',
    title: 'Event',
    loadComponent: () => import('./features/event-detail/event-detail').then((m) => m.EventDetail),
  },
  {
    path: 'orders',
    title: 'My orders',
    loadComponent: () => import('./features/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'admin',
    title: 'Admin',
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  {
    path: 'demo',
    title: 'Demo lab',
    loadComponent: () => import('./features/demo/demo').then((m) => m.Demo),
  },
  { path: '**', redirectTo: '' },
];
