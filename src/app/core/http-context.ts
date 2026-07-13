import { HttpContextToken } from '@angular/common/http';

export const SILENT = new HttpContextToken<boolean>(() => false);
