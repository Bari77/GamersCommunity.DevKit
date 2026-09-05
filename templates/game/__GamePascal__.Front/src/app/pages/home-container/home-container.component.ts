import { Component, inject, OnInit, signal } from "@angular/core";
import { NbCardModule, NbSpinnerModule } from "@nebular/theme";
import { ItemsService } from "../../features/items/items.service";
import { ItemDto } from "../../features/items/item.dto";

@Component({
  selector: "__CssPrefix__-home-container",
  standalone: true,
  imports: [NbCardModule, NbSpinnerModule],
  templateUrl: "./home-container.component.html",
  styleUrl: "./home-container.component.scss",
})
export class HomeContainerComponent implements OnInit {
  private readonly items = inject(ItemsService);
  readonly list = signal<ItemDto[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.items.list().subscribe({
      next: (data) => { this.list.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
