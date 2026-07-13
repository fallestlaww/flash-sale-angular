import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'app-user-switcher',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-switcher.html',
  styleUrl: './user-switcher.css',
})
export class UserSwitcher {
  private readonly userService = inject(UserService);
  readonly currentUserId = this.userService.currentUserId;

  onChange(value: number): void {
    this.userService.setUser(value);
  }
}
